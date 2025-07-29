import { Request, Response } from 'express';
import Turbo from '../model/turbo';

// Helper function to determine if an item is low stock based on priority
const isLowStockItem = (quantity: number, priority: boolean = false): boolean => {
  if (priority) {
    return quantity <= 5; // Priority items: low stock if 5 or less
  }
  return quantity <= 1; // Regular items: low stock if 1 or less
};

export const addTurbo = async (req: Request, res: Response) => {
  try {
    const { location, hasSizeOption, partNumbers, sizeVariants, quantity, threshold, priority } = req.body;

    if (!location) {
      return res.status(400).json({ error: 'Location is required.' });
    }

    if (hasSizeOption) {
      // If size option is selected, require at least one of big or small
      if (!sizeVariants || (!sizeVariants.big && !sizeVariants.small)) {
        return res.status(400).json({ error: 'At least one of big or small size variant is required.' });
      }
      // Validate each size variant
      for (const size of ['big', 'small'] as const) {
        if (sizeVariants[size]) {
          if (!sizeVariants[size].partNumbers || !Array.isArray(sizeVariants[size].partNumbers) || sizeVariants[size].partNumbers.length === 0) {
            return res.status(400).json({ error: `Model name(s) for ${size} size is required (comma separated).` });
          }
          if (typeof sizeVariants[size].quantity !== 'number' || sizeVariants[size].quantity < 0) {
            return res.status(400).json({ error: `Quantity for ${size} size is required and must be a non-negative number.` });
          }
        }
      }
    } else {
      // No size option, require partNumbers and quantity
      if (!partNumbers || !Array.isArray(partNumbers) || partNumbers.length === 0) {
        return res.status(400).json({ error: 'Model name(s) is required (comma separated).' });
      }
      if (typeof quantity !== 'number' || quantity < 0) {
        return res.status(400).json({ error: 'Quantity is required and must be a non-negative number.' });
      }
    }

    // Create the turbo document
    const turbo = new Turbo({
      location,
      hasSizeOption: !!hasSizeOption,
      priority: !!priority, // Add priority field
      partNumbers: hasSizeOption ? undefined : partNumbers,
      sizeVariants: hasSizeOption ? sizeVariants : undefined,
      quantity: hasSizeOption ? undefined : quantity,
      threshold: threshold || 0,
    });

    await turbo.save();
    return res.status(201).json({ message: 'Turbo added successfully', turbo });
  } catch (error) {
    return res.status(500).json({ error: 'Server error', details: error });
  }
};

export const getTurbo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const turbo = await Turbo.findById(id);
    
    if (!turbo) {
      return res.status(404).json({ error: 'Turbo not found.' });
    }
    
    return res.status(200).json({ turbo });
  } catch (error) {
    return res.status(500).json({ error: 'Server error', details: error });
  }
};

export const updateTurbo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { location, hasSizeOption, partNumbers, sizeVariants, quantity, threshold, priority } = req.body;

    const turbo = await Turbo.findById(id);
    if (!turbo) {
      return res.status(404).json({ error: 'Turbo not found.' });
    }

    if (!location) {
      return res.status(400).json({ error: 'Location is required.' });
    }

    if (hasSizeOption) {
      // If size option is selected, require at least one of big or small
      if (!sizeVariants || (!sizeVariants.big && !sizeVariants.small)) {
        return res.status(400).json({ error: 'At least one of big or small size variant is required.' });
      }
      // Validate each size variant
      for (const size of ['big', 'small'] as const) {
        if (sizeVariants[size]) {
          if (!sizeVariants[size].partNumbers || !Array.isArray(sizeVariants[size].partNumbers) || sizeVariants[size].partNumbers.length === 0) {
            return res.status(400).json({ error: `Model name(s) for ${size} size is required (comma separated).` });
          }
          if (typeof sizeVariants[size].quantity !== 'number' || sizeVariants[size].quantity < 0) {
            return res.status(400).json({ error: `Quantity for ${size} size is required and must be a non-negative number.` });
          }
        }
      }
    } else {
      // No size option, require partNumbers and quantity
      if (!partNumbers || !Array.isArray(partNumbers) || partNumbers.length === 0) {
        return res.status(400).json({ error: 'Model name(s) is required (comma separated).' });
      }
      if (typeof quantity !== 'number' || quantity < 0) {
        return res.status(400).json({ error: 'Quantity is required and must be a non-negative number.' });
      }
    }

    // Update the turbo document
    const updatedTurbo = await Turbo.findByIdAndUpdate(
      id,
      {
        location,
        hasSizeOption: !!hasSizeOption,
        priority: !!priority, // Add priority field
        partNumbers: hasSizeOption ? undefined : partNumbers,
        sizeVariants: hasSizeOption ? sizeVariants : undefined,
        quantity: hasSizeOption ? undefined : quantity,
        threshold: threshold || 0,
      },
      { new: true }
    );

    return res.status(200).json({ message: 'Turbo updated successfully', turbo: updatedTurbo });
  } catch (error) {
    return res.status(500).json({ error: 'Server error', details: error });
  }
};

export const updateTurboByPartNumber = async (req: Request, res: Response) => {
  try {
    console.log('updateTurboByPartNumber called with body:', req.body);
    console.log('Priority field type:', typeof req.body.priority);
    console.log('Priority field value:', req.body.priority);
    const { partNumber, location, hasSizeOption, partNumbers, sizeVariants, quantity, threshold, priority, operation } = req.body;

    if (!partNumber) {
      return res.status(400).json({ error: 'Part number is required.' });
    }

    // Location is only required for update operations, not for "add" operations
    if (operation !== 'add' && !location) {
      return res.status(400).json({ error: 'Location is required.' });
    }

    // Find turbo document that contains this part number
    let turbo = await Turbo.findOne({
      $or: [
        { partNumbers: partNumber },
        { 'sizeVariants.big.partNumbers': partNumber },
        { 'sizeVariants.small.partNumbers': partNumber }
      ]
    });

    if (!turbo) {
      return res.status(404).json({ error: 'Turbo not found with this part number.' });
    }

    // Handle "add" operation for when orders arrive
    if (operation === 'add' && quantity) {
      console.log('Adding quantity to existing turbo:', quantity);
      
      // Find which field contains the part number and add to its quantity
      if (turbo.partNumbers && turbo.partNumbers.includes(partNumber)) {
        // Regular turbo (no size variants)
        const newQuantity = (turbo.quantity || 0) + quantity;
        const updatedTurbo = await Turbo.findByIdAndUpdate(
          turbo._id,
          { quantity: newQuantity },
          { new: true }
        );
        return res.status(200).json({ 
          message: `Quantity added successfully. New total: ${newQuantity}`, 
          turbo: updatedTurbo 
        });
      } else if (turbo.sizeVariants) {
        // Size variants turbo
        let updated = false;
        const updateData: any = {};
        
        if (turbo.sizeVariants.big && turbo.sizeVariants.big.partNumbers.includes(partNumber)) {
          const newQuantity = (turbo.sizeVariants.big.quantity || 0) + quantity;
          updateData['sizeVariants.big.quantity'] = newQuantity;
          updated = true;
        } else if (turbo.sizeVariants.small && turbo.sizeVariants.small.partNumbers.includes(partNumber)) {
          const newQuantity = (turbo.sizeVariants.small.quantity || 0) + quantity;
          updateData['sizeVariants.small.quantity'] = newQuantity;
          updated = true;
        }
        
        if (updated) {
          const updatedTurbo = await Turbo.findByIdAndUpdate(
            turbo._id,
            updateData,
            { new: true }
          );
          return res.status(200).json({ 
            message: `Quantity added successfully.`, 
            turbo: updatedTurbo 
          });
        }
      }
      
      return res.status(400).json({ error: 'Could not add quantity to this turbo.' });
    }

    if (hasSizeOption) {
      // If size option is selected, require at least one of big or small
      if (!sizeVariants || (!sizeVariants.big && !sizeVariants.small)) {
        return res.status(400).json({ error: 'At least one of big or small size variant is required.' });
      }
      // Validate each size variant
      for (const size of ['big', 'small'] as const) {
        if (sizeVariants[size]) {
          if (!sizeVariants[size].partNumbers || !Array.isArray(sizeVariants[size].partNumbers) || sizeVariants[size].partNumbers.length === 0) {
            return res.status(400).json({ error: `Model name(s) for ${size} size is required (comma separated).` });
          }
          if (typeof sizeVariants[size].quantity !== 'number' || sizeVariants[size].quantity < 0) {
            return res.status(400).json({ error: `Quantity for ${size} size is required and must be a non-negative number.` });
          }
        }
      }
    } else {
      // No size option, require partNumbers and quantity
      if (!partNumbers || !Array.isArray(partNumbers) || partNumbers.length === 0) {
        return res.status(400).json({ error: 'Model name(s) is required (comma separated).' });
      }
      if (typeof quantity !== 'number' || quantity < 0) {
        return res.status(400).json({ error: 'Quantity is required and must be a non-negative number.' });
      }
    }

    const updateData = {
      location,
      hasSizeOption: !!hasSizeOption,
      priority: !!priority, // Add priority field
      partNumbers: hasSizeOption ? undefined : partNumbers,
      sizeVariants: hasSizeOption ? sizeVariants : undefined,
      quantity: hasSizeOption ? undefined : quantity,
      threshold: threshold || 0,
    };
    
    console.log('Updating turbo with data:', updateData);
    console.log('Priority value:', priority, 'Converted to:', !!priority);
    
    // Update the turbo document
    const updatedTurbo = await Turbo.findByIdAndUpdate(
      turbo._id,
      updateData,
      { new: true }
    );

    return res.status(200).json({ message: 'Turbo updated successfully', turbo: updatedTurbo });
  } catch (error) {
    return res.status(500).json({ error: 'Server error', details: error });
  }
};

export const deleteTurbo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const turbo = await Turbo.findByIdAndDelete(id);
    
    if (!turbo) {
      return res.status(404).json({ error: 'Turbo not found.' });
    }
    
    return res.status(200).json({ message: 'Turbo deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Server error', details: error });
  }
};

export const deleteTurboByPartNumber = async (req: Request, res: Response) => {
  try {
    const { partNumber } = req.params;
    
    // Find and delete the turbo document that contains this part number
    const turbo = await Turbo.findOneAndDelete({
      $or: [
        { 'partNumbers': partNumber },
        { 'sizeVariants.big.partNumbers': partNumber },
        { 'sizeVariants.small.partNumbers': partNumber }
      ]
    });
    
    if (!turbo) {
      return res.status(404).json({ error: 'Turbo not found.' });
    }
    
    return res.status(200).json({ message: 'Turbo deleted successfully' });
  } catch (error) {
    console.error('Error deleting turbo by part number:', error);
    return res.status(500).json({ error: 'Server error', details: error });
  }
};

export const getAllTurbos = async (req: Request, res: Response) => {
  try {
    console.log('Getting all turbos...');
    const turbos = await Turbo.find({});
    console.log('Found turbos:', turbos.length);
    return res.status(200).json({ turbos });
  } catch (error) {
    console.error('Error getting turbos:', error);
    return res.status(500).json({ error: 'Server error', details: error });
  }
};

export const getTurboStats = async (req: Request, res: Response) => {
  try {
    // Get total items (count of all turbo documents)
    const totalItems = await Turbo.countDocuments({});

    // Calculate total quantity
    const turbos = await Turbo.find({});
    let totalQuantity = 0;

    turbos.forEach(turbo => {
      if (turbo.hasSizeOption && turbo.sizeVariants) {
        // Sum quantities from size variants
        if (turbo.sizeVariants.big) {
          totalQuantity += turbo.sizeVariants.big.quantity || 0;
        }
        if (turbo.sizeVariants.small) {
          totalQuantity += turbo.sizeVariants.small.quantity || 0;
        }
      } else {
        // Add quantity from single turbo
        totalQuantity += turbo.quantity || 0;
      }
    });

    // Calculate low stock items based on priority
    let lowStockItems = 0;
    
    turbos.forEach(turbo => {
      if (turbo.hasSizeOption && turbo.sizeVariants) {
        // Check big size variant
        if (turbo.sizeVariants.big && isLowStockItem(turbo.sizeVariants.big.quantity || 0, turbo.priority || false)) {
          lowStockItems += turbo.sizeVariants.big.partNumbers ? turbo.sizeVariants.big.partNumbers.length : 0;
        }
        // Check small size variant
        if (turbo.sizeVariants.small && isLowStockItem(turbo.sizeVariants.small.quantity || 0, turbo.priority || false)) {
          lowStockItems += turbo.sizeVariants.small.partNumbers ? turbo.sizeVariants.small.partNumbers.length : 0;
        }
      } else {
        // For items without size options, check the main quantity
        if (isLowStockItem(turbo.quantity || 0, turbo.priority || false)) {
          lowStockItems += turbo.partNumbers ? turbo.partNumbers.length : 0;
        }
      }
    });

    return res.status(200).json({
      totalItems,
      totalQuantity,
      lowStockItems
    });
  } catch (error) {
    return res.status(500).json({ error: 'Server error', details: error });
  }
};

export const getLowStockItems = async (req: Request, res: Response) => {
  try {
    const lowStockItemsList: { id: string; location: string; quantity: number; status: string }[] = [];
    const turbos = await Turbo.find({});

    turbos.forEach(turbo => {
      if (turbo.hasSizeOption && turbo.sizeVariants) {
        // Check big size variant
        if (turbo.sizeVariants.big && isLowStockItem(turbo.sizeVariants.big.quantity || 0, turbo.priority || false)) {
          turbo.sizeVariants.big.partNumbers.forEach(partNumber => {
            lowStockItemsList.push({
              id: partNumber,
              location: turbo.location,
              quantity: turbo.sizeVariants!.big!.quantity,
              status: turbo.sizeVariants!.big!.quantity === 0 ? 'OUT OF STOCK' : `${turbo.sizeVariants!.big!.quantity} left`
            });
          });
        }
        // Check small size variant
        if (turbo.sizeVariants.small && isLowStockItem(turbo.sizeVariants.small.quantity || 0, turbo.priority || false)) {
          turbo.sizeVariants.small.partNumbers.forEach(partNumber => {
            lowStockItemsList.push({
              id: partNumber,
              location: turbo.location,
              quantity: turbo.sizeVariants!.small!.quantity,
              status: turbo.sizeVariants!.small!.quantity === 0 ? 'OUT OF STOCK' : `${turbo.sizeVariants!.small!.quantity} left`
            });
          });
        }
      } else if (turbo.partNumbers && turbo.partNumbers.length > 0) {
        // For items without size options, check the main quantity
        if (isLowStockItem(turbo.quantity || 0, turbo.priority || false)) {
          turbo.partNumbers.forEach(partNumber => {
            lowStockItemsList.push({
              id: partNumber,
              location: turbo.location,
              quantity: turbo.quantity || 0,
              status: (turbo.quantity || 0) === 0 ? 'OUT OF STOCK' : `${turbo.quantity} left`
            });
          });
        }
      }
    });

    return res.status(200).json({ lowStockItems: lowStockItemsList });
  } catch (error) {
    return res.status(500).json({ error: 'Server error', details: error });
  }
};

export const sellTurbo = async (req: Request, res: Response) => {
  try {
    console.log('Sell turbo endpoint called');
    console.log('Request body:', req.body);
    console.log('Request method:', req.method);
    console.log('Request URL:', req.url);
    console.log('Part number:', req.body.partNumber);
    console.log('Quantity to sell:', req.body.quantity);
    
    const { partNumber, quantity } = req.body;

    if (!partNumber) {
      return res.status(400).json({ error: 'Part number is required' });
    }

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ error: 'Valid quantity is required' });
    }

    // Find the turbo by part number
    const turbo = await Turbo.findOne({
      $or: [
        { 'partNumbers': partNumber },
        { 'sizeVariants.big.partNumbers': partNumber },
        { 'sizeVariants.small.partNumbers': partNumber }
      ]
    });

    if (!turbo) {
      return res.status(404).json({ error: 'Turbo not found' });
    }

    let currentQuantity = 0;
    let updatePath = '';

    // Determine which quantity to update based on where the part number is found
    if (turbo.partNumbers && turbo.partNumbers.includes(partNumber)) {
      // Regular turbo item
      currentQuantity = turbo.quantity || 0;
      updatePath = 'quantity';
    } else if (turbo.sizeVariants?.big?.partNumbers?.includes(partNumber)) {
      // Big variant
      currentQuantity = turbo.sizeVariants.big.quantity || 0;
      updatePath = 'sizeVariants.big.quantity';
    } else if (turbo.sizeVariants?.small?.partNumbers?.includes(partNumber)) {
      // Small variant
      currentQuantity = turbo.sizeVariants.small.quantity || 0;
      updatePath = 'sizeVariants.small.quantity';
    }

    // Check if we have enough stock
    if (currentQuantity < quantity) {
      return res.status(400).json({ 
        error: 'Not enough quantity to sell', 
        available: currentQuantity,
        requested: quantity 
      });
    }

    // Calculate new quantity
    const newQuantity = currentQuantity - quantity;

    // Update the turbo
    const updateQuery: any = {};
    updateQuery[updatePath] = newQuantity;

    const updatedTurbo = await Turbo.findByIdAndUpdate(
      turbo._id,
      updateQuery,
      { new: true }
    );

    if (!updatedTurbo) {
      return res.status(500).json({ error: 'Failed to update turbo' });
    }

    console.log('Sell operation completed successfully');
    console.log('Remaining quantity:', newQuantity);
    console.log('Sold quantity:', quantity);
    
    return res.status(200).json({
      message: `Successfully sold ${quantity} turbo(s)`,
      remainingQuantity: newQuantity,
      soldQuantity: quantity,
      partNumber: partNumber
    });

  } catch (error) {
    console.error('Error selling turbo:', error);
    return res.status(500).json({ error: 'Server error', details: error });
  }
}; 