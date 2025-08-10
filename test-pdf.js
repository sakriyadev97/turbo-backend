const { generateBulkInvoicePDF } = require('./dist/utils/pdfGenerator');

async function testPDFGeneration() {
  try {
    console.log('Testing PDF generation...');
    
    const testOrder = {
      items: [
        {
          partNumber: '5435 970 0028',
          model: '5435 970 0028',
          location: 'BAY 1.1 - 5435 970 0028',
          quantity: 1
        },
        {
          partNumber: '5435 970 0012',
          model: '5435 970 0012',
          location: 'BAY 1.1 - 5435 970 0012',
          quantity: 1
        }
      ],
      orderDate: new Date().toLocaleDateString(),
      orderNumber: 'TEST-001'
    };
    
    console.log('Test order data:', testOrder);
    
    const pdfBuffer = await generateBulkInvoicePDF(testOrder);
    
    console.log('✅ PDF generated successfully!');
    console.log('Buffer size:', pdfBuffer.length);
    console.log('Buffer type:', typeof pdfBuffer);
    
    // Save to file for inspection
    const fs = require('fs');
    fs.writeFileSync('test-invoice.pdf', pdfBuffer);
    console.log('✅ PDF saved as test-invoice.pdf');
    
  } catch (error) {
    console.error('❌ PDF generation failed:', error.message);
    console.error('Error details:', error);
  }
}

testPDFGeneration();
