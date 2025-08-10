import { Request, Response } from 'express';
import nodemailer from 'nodemailer';
import { generateBulkInvoicePDF } from '../utils/pdfGenerator';

// Configure email transporter (you'll need to set up your email credentials)
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail', // or your email service
    auth: {
      user: process.env.EMAIL_USER ,
      pass: process.env.EMAIL_PASSWORD 
    },
    // Add these options for better Gmail compatibility
    secure: true,
    port: 465,
    tls: {
      rejectUnauthorized: false
    }
  });
};

export const sendOrderEmail = async (req: Request, res: Response) => {
  try {
    const { subject, body, orders } = req.body;

    if (!subject || !body || !orders) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create transporter
    const transporter = createTransporter();

    // Email configuration
    const mailOptions = {
      from: process.env.EMAIL_USER ,
      to:'khadkasakriya81@gmail.com', // Set recipient email
      subject: subject,
      text: body,
      html: `
        <h2>New Turbo Order Request</h2>
        <p>Please order the following items:</p>
        <ul>
          ${orders.map((order: any) => 
            `<li><strong>Model:</strong> ${order.modelName}, <strong>Quantity:</strong> ${order.quantity}, <strong>Location:</strong> ${order.location}</li>`
          ).join('')}
        </ul>
        <p>Thank you!</p>
      `
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    res.status(200).json({ 
      message: 'Order email sent successfully',
      messageId: info.messageId 
    });

  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to send order email',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const sendBulkOrderEmailWithPDF = async (req: Request, res: Response) => {
  try {
    const { orders, orderNumber } = req.body;

    if (!orders || !Array.isArray(orders) || orders.length === 0) {
      return res.status(400).json({ error: 'Missing or invalid orders data' });
    }

    // Generate unique order number if not provided
    const finalOrderNumber = orderNumber || `BO-${Date.now()}`;
    
    // Prepare data for PDF generation
    const bulkOrderData = {
      items: orders.map((order: any) => ({
        partNumber: order.partNumber,
        model: order.modelName || order.model, // Handle both modelName and model for backward compatibility
        location: order.location,
        quantity: order.quantity
      })),
      orderDate: new Date().toLocaleDateString(),
      orderNumber: finalOrderNumber
    };

    // Generate PDF
    const pdfBuffer = await generateBulkInvoicePDF(bulkOrderData);

    // Create transporter
    const transporter = createTransporter();

    // Calculate totals for email body
    const totalItems = orders.length;
    const totalQuantity = orders.reduce((sum: number, order: any) => sum + order.quantity, 0);

    // Email configuration with PDF attachment
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'khadkasakriya81@gmail.com',
      subject: `Bulk Order Request - ${finalOrderNumber}`,
      text: `Please find attached the bulk order invoice for ${totalItems} items with total quantity of ${totalQuantity}.`,
      html: `
        <h2>Bulk Order Request</h2>
        <p><strong>Order Number:</strong> ${finalOrderNumber}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        <p><strong>Total Items:</strong> ${totalItems}</p>
        <p><strong>Total Quantity:</strong> ${totalQuantity}</p>
        
        <p>Please find the detailed invoice attached as PDF.</p>
        
        <h3>Order Summary:</h3>
        <ul>
          ${orders.map((order: any) => 
            `<li><strong>Part:</strong> ${order.partNumber} | <strong>Model:</strong> ${order.modelName || order.model} | <strong>Qty:</strong> ${order.quantity} | <strong>Location:</strong> ${order.location}</li>`
          ).join('')}
        </ul>
        
        <p>Thank you!</p>
        <hr>
        <p style="font-size: 12px; color: #666;">
          <strong>Precision Turbo Services</strong><br>
          Professional Turbo Management Solutions<br>
          Email: turboprecision2@gmail.com
        </p>
      `,
      attachments: [
        {
          filename: `Bulk_Order_Invoice_${finalOrderNumber}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    res.status(200).json({ 
      message: 'Bulk order email with PDF sent successfully',
      messageId: info.messageId,
      orderNumber: finalOrderNumber,
      totalItems,
      totalQuantity
    });

  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to send bulk order email',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}; 