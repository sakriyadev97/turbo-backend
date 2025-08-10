"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateBulkInvoicePDF = void 0;
const puppeteer_1 = __importDefault(require("puppeteer"));
const generateBulkInvoicePDF = async (bulkOrder) => {
    let browser = null;
    try {
        console.log('Starting PDF generation for bulk order:', bulkOrder.orderNumber);
        // Launch puppeteer browser with production-friendly options
        browser = await puppeteer_1.default.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--no-first-run',
                '--no-zygote',
                '--single-process'
            ]
        });
        console.log('Browser launched successfully');
        const page = await browser.newPage();
        console.log('Page created successfully');
        // Create HTML content for the invoice
        const htmlContent = createInvoiceHTML(bulkOrder);
        console.log('HTML content created, length:', htmlContent.length);
        // Set the HTML content
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        console.log('HTML content set on page');
        // Generate PDF
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20px',
                bottom: '20px',
                left: '20px',
                right: '20px'
            }
        });
        console.log('PDF generated successfully, buffer size:', pdfBuffer.length);
        return Buffer.from(pdfBuffer);
    }
    catch (error) {
        console.error('Error generating PDF:', error);
        console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
        throw new Error(`Failed to generate PDF invoice: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    finally {
        if (browser) {
            try {
                await browser.close();
                console.log('Browser closed successfully');
            }
            catch (closeError) {
                console.error('Error closing browser:', closeError);
            }
        }
    }
};
exports.generateBulkInvoicePDF = generateBulkInvoicePDF;
const createInvoiceHTML = (bulkOrder) => {
    const { items, orderDate, orderNumber } = bulkOrder;
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Turbo Order Invoice</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Arial', sans-serif;
          color: #333;
          line-height: 1.6;
          background: white;
        }
        
        .invoice-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 30px;
          background: white;
        }
        
        .invoice-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 3px solid #1e40af;
        }
        
        .company-info {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        
        .company-logo {
          width: 80px;
          height: 80px;
          background: #1e40af;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 24px;
          font-weight: bold;
        }
        
        .company-details h1 {
          color: #1e40af;
          font-size: 24px;
          margin-bottom: 5px;
        }
        
        .company-details p {
          color: #6b7280;
          font-size: 14px;
        }
        
        .invoice-info {
          text-align: right;
        }
        
        .invoice-info h2 {
          color: #1e40af;
          font-size: 28px;
          margin-bottom: 10px;
        }
        
        .invoice-details {
          color: #6b7280;
          font-size: 14px;
        }
        
        .order-summary {
          background: #f8fafc;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
        }
        
        .order-summary h3 {
          color: #374151;
          margin-bottom: 15px;
          font-size: 18px;
        }
        
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        
        .summary-item {
          text-align: center;
          padding: 15px;
          background: white;
          border-radius: 6px;
          border: 1px solid #e5e7eb;
        }
        
        .summary-item .number {
          font-size: 24px;
          font-weight: bold;
          color: #1e40af;
          margin-bottom: 5px;
        }
        
        .summary-item .label {
          font-size: 12px;
          color: #6b7280;
          text-transform: uppercase;
          font-weight: 600;
        }
        
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          border-radius: 8px;
          overflow: hidden;
        }
        
        .items-table thead {
          background: #1e40af;
          color: white;
        }
        
        .items-table th {
          padding: 15px;
          text-align: left;
          font-weight: 600;
          font-size: 14px;
        }
        
        .items-table tbody tr {
          border-bottom: 1px solid #e5e7eb;
        }
        
        .items-table tbody tr:nth-child(even) {
          background: #f9fafb;
        }
        
        .items-table tbody tr:hover {
          background: #f3f4f6;
        }
        
        .items-table td {
          padding: 15px;
          font-size: 14px;
        }
        
        .part-number {
          font-weight: 600;
          color: #1e40af;
        }
        
        .quantity {
          text-align: center;
          font-weight: 600;
          background: #dbeafe;
          color: #1e40af;
          border-radius: 4px;
          padding: 4px 8px;
        }
        
        .footer {
          margin-top: 40px;
          text-align: center;
          color: #6b7280;
          font-size: 12px;
          border-top: 1px solid #e5e7eb;
          padding-top: 20px;
        }
        
        .footer p {
          margin-bottom: 5px;
        }
        
        @media print {
          .invoice-container {
            padding: 0;
            box-shadow: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <!-- Header -->
        <div class="invoice-header">
          <div class="company-info">
            <div class="company-logo">
              🚗
            </div>
            <div class="company-details">
              <h1>Precision Turbo Services</h1>
              <p>Professional Turbo Management Solutions</p>
              <p>Email: turboprecision2@gmail.com</p>
            </div>
          </div>
          <div class="invoice-info">
            <h2>INVOICE</h2>
            <div class="invoice-details">
              <p><strong>Order #:</strong> ${orderNumber}</p>
              <p><strong>Date:</strong> ${orderDate}</p>
              <p><strong>Status:</strong> Pending</p>
            </div>
          </div>
        </div>
        
        <!-- Order Summary -->
        <div class="order-summary">
          <h3>Order Summary</h3>
          <div class="summary-grid">
            <div class="summary-item">
              <div class="number">${items.length}</div>
              <div class="label">Different Models</div>
            </div>
            <div class="summary-item">
              <div class="number">${totalItems}</div>
              <div class="label">Total Quantity</div>
            </div>
            <div class="summary-item">
              <div class="number">${new Set(items.map(item => item.location)).size}</div>
              <div class="label">Locations</div>
            </div>
          </div>
        </div>
        
        <!-- Items Table -->
        <table class="items-table">
          <thead>
            <tr>
              <th>Part Number</th>
              <th>Model</th>
              <th>Location</th>
              <th>Quantity</th>
            </tr>
          </thead>
          <tbody>
            ${items.map((item, index) => `
              <tr>
                <td class="part-number">${item.partNumber}</td>
                <td>${item.model}</td>
                <td>${item.location}</td>
                <td><span class="quantity">${item.quantity}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <!-- Footer -->
        <div class="footer">
          <p><strong>Precision Turbo Services</strong></p>
          <p>This is an automated order request. Please process the above items.</p>
          <p>For questions, contact: turboprecision2@gmail.com</p>
          <p>Generated on ${new Date().toLocaleString()}</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
