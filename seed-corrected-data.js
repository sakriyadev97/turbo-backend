const mongoose = require('mongoose');
const fs = require('fs');

// MongoDB setup
mongoose.connect('mongodb+srv://sakriyadev97:v3QMJW5LaIDngRsu@turbo0.lfrorar.mongodb.net/?retryWrites=true&w=majority&appName=turbo0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define the exact schema that matches turbo.ts
const TurboSchema = new mongoose.Schema({
  location: { type: String, required: true },
  partNumbers: {
    type: [String],
    required: function() {
      return !this.hasSizeOption;
    },
  },
  hasSizeOption: { type: Boolean, default: false },
  priority: { type: Boolean, default: false },
  sizeVariants: {
    big: {
      partNumbers: [String],
      quantity: { type: Number, default: 0 },
    },
    small: {
      partNumbers: [String],
      quantity: { type: Number, default: 0 },
    },
  },
  quantity: {
    type: Number,
    default: 0,
    required: function() {
      return !this.hasSizeOption;
    },
  },
  threshold: {
    type: Number,
    default: 0,
  },
});

const Turbo = mongoose.model('Turbo', TurboSchema);

async function seedCorrectedData() {
  try {
    console.log('📊 Starting corrected JSON data import...');

    // Read the corrected JSON file
    const jsonData = JSON.parse(fs.readFileSync('corrected_normalized_turbo_data.json', 'utf8'));
    console.log(`📋 Loaded ${jsonData.length} entries from corrected JSON file.`);

    // Clear existing data
    await Turbo.deleteMany({});
    console.log('🗑️  Cleared existing turbo data.');

    // Process and insert data
    const processedEntries = [];
    let validEntries = 0;
    let skippedEntries = 0;
    let duplicatePartNumbers = 0;

    for (const entry of jsonData) {
      // Validate required fields
      if (!entry.location || !entry.partNumbers || entry.partNumbers.length === 0) {
        skippedEntries++;
        continue;
      }

      // Create individual entry for each part number
      entry.partNumbers.forEach((partNumber, index) => {
        if (partNumber && partNumber.trim() !== '') {
          // Check if this part number already exists in this location
          const existingEntry = processedEntries.find(p => 
            p.location === `${entry.location} - ${partNumber.trim()}`
          );

          if (existingEntry) {
            // If duplicate part number, update quantity to the higher value
            if (entry.quantity > existingEntry.quantity) {
              existingEntry.quantity = entry.quantity;
            }
            duplicatePartNumbers++;
          } else {
            const individualEntry = {
              location: `${entry.location} - ${partNumber.trim()}`,
              partNumbers: [partNumber.trim()],
              hasSizeOption: entry.hasSizeOption || false,
              quantity: entry.quantity || 0,
              threshold: entry.threshold || 0,
              priority: entry.priority || false,
              sizeVariants: entry.sizeVariants || {
                big: { partNumbers: [], quantity: 0 },
                small: { partNumbers: [], quantity: 0 }
              }
            };

            processedEntries.push(individualEntry);
            validEntries++;
          }
        }
      });
    }

    console.log(`📊 Processed ${validEntries} individual entries, skipped ${skippedEntries} invalid entries.`);
    console.log(`🔄 Handled ${duplicatePartNumbers} duplicate part numbers by keeping highest quantity.`);

    if (processedEntries.length === 0) {
      console.log('❌ No valid entries found. Check your JSON data structure.');
      mongoose.disconnect();
      return;
    }

    // Insert data
    await Turbo.insertMany(processedEntries);
    console.log('✅ Successfully imported corrected data.');
    console.log(`📊 Imported ${processedEntries.length} individual turbo entries.`);

    // Show summary statistics
    const nonZeroQuantities = processedEntries.filter(entry => entry.quantity > 0).length;
    const zeroQuantities = processedEntries.filter(entry => entry.quantity === 0).length;
    const totalQuantity = processedEntries.reduce((sum, entry) => sum + entry.quantity, 0);

    console.log('\n📈 Corrected Import Summary:');
    console.log(`📋 Total entries: ${processedEntries.length}`);
    console.log(`💰 Entries with quantity > 0: ${nonZeroQuantities}`);
    console.log(`📦 Entries with quantity = 0: ${zeroQuantities}`);
    console.log(`🎯 Total quantity across all items: ${totalQuantity}`);

    // Show quantity distribution
    const quantityRanges = {
      '0': 0,
      '1-5': 0,
      '6-10': 0,
      '11-20': 0,
      '20+': 0
    };

    processedEntries.forEach(entry => {
      if (entry.quantity === 0) quantityRanges['0']++;
      else if (entry.quantity <= 5) quantityRanges['1-5']++;
      else if (entry.quantity <= 10) quantityRanges['6-10']++;
      else if (entry.quantity <= 20) quantityRanges['11-20']++;
      else quantityRanges['20+']++;
    });

    console.log('\n📊 Quantity Distribution:');
    Object.entries(quantityRanges).forEach(([range, count]) => {
      console.log(`   ${range}: ${count} entries`);
    });

    // Show sample entries
    console.log('\n📝 Sample corrected entries:');
    processedEntries.slice(0, 10).forEach((entry, index) => {
      const partNumber = entry.partNumbers[0] || 'No Part';
      console.log(`${index + 1}. ${entry.location}: "${partNumber}" (qty: ${entry.quantity})`);
    });

    // Show unique locations
    const uniqueLocations = new Set(processedEntries.map(entry => entry.location.split(' - ')[0]));
    console.log(`\n📍 Unique bay locations: ${uniqueLocations.size}`);
    console.log('📍 Sample locations:', Array.from(uniqueLocations).slice(0, 10).join(', '));

    // Show top locations by entry count
    const locationCounts = {};
    processedEntries.forEach(entry => {
      const baseLocation = entry.location.split(' - ')[0];
      locationCounts[baseLocation] = (locationCounts[baseLocation] || 0) + 1;
    });

    const topLocations = Object.entries(locationCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    console.log('\n🏆 Top locations by entry count:');
    topLocations.forEach(([location, count], index) => {
      console.log(`${index + 1}. ${location}: ${count} entries`);
    });

    // Show improvement comparison
    console.log('\n🔄 Comparison with previous import:');
    console.log('   Previous: 1,325 entries, 881 with quantity > 0 (66.5%)');
    console.log(`   Corrected: ${processedEntries.length} entries, ${nonZeroQuantities} with quantity > 0 (${((nonZeroQuantities/processedEntries.length)*100).toFixed(1)}%)`);

  } catch (err) {
    console.error('❌ Error during corrected import:', err);
  } finally {
    mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB.');
  }
}

seedCorrectedData(); 