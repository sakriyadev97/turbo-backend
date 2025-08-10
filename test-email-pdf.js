// Test script to verify PDF generation and email functionality
const { generateBulkInvoicePDF } = require('./dist/utils/pdfGenerator');

// Test data
const testOrder = {
  items: [
    {
      partNumber: "5435 970 0028",
      model: "Test Turbo Model",
      location: "BAY 1.1 - 5435 970 0028",
      quantity: 1
    }
  ],
  orderDate: new Date().toLocaleDateString(),
  orderNumber: "TEST-001"
};

async function testPDFGeneration() {
  try {
    console.log('🧪 Testing PDF generation...');
    console.log('Test order data:', JSON.stringify(testOrder, null, 2));
    
    const pdfBuffer = await generateBulkInvoicePDF(testOrder);
    
    if (pdfBuffer && pdfBuffer.length > 0) {
      console.log('✅ PDF generated successfully!');
      console.log(`📄 PDF size: ${pdfBuffer.length} bytes`);
      console.log(`📄 PDF size: ${(pdfBuffer.length / 1024).toFixed(2)} KB`);
      
      // Save test PDF
      const fs = require('fs');
      fs.writeFileSync('test-generated-invoice.pdf', pdfBuffer);
      console.log('💾 Test PDF saved as: test-generated-invoice.pdf');
      
    } else {
      console.log('❌ PDF generation failed - no buffer returned');
    }
    
  } catch (error) {
    console.error('❌ PDF generation error:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

async function testEmailConfiguration() {
  console.log('\n📧 Testing email configuration...');
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.log('❌ Email credentials not configured');
    console.log('   EMAIL_USER:', process.env.EMAIL_USER ? '✅ Set' : '❌ Missing');
    console.log('   EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '✅ Set' : '❌ Missing');
    console.log('\n💡 Please create a .env file with your email credentials');
    console.log('   See email-setup.md for detailed instructions');
  } else {
    console.log('✅ Email credentials configured');
    console.log('   EMAIL_USER:', process.env.EMAIL_USER);
    console.log('   EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '✅ Set' : '❌ Missing');
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting Turbo Backend Tests...\n');
  
  await testPDFGeneration();
  await testEmailConfiguration();
  
  console.log('\n🏁 Tests completed!');
  console.log('\n📋 Next steps:');
  console.log('   1. Set up your .env file with email credentials');
  console.log('   2. Restart your backend server');
  console.log('   3. Test the email endpoint with a real order');
}

// Load environment variables if .env file exists
try {
  require('dotenv').config();
} catch (error) {
  console.log('⚠️  dotenv not available, using system environment variables');
}

runTests().catch(console.error);
