import { Request, Response } from 'express';
import nodemailer from 'nodemailer';
import { generateBulkInvoicePDF } from '../utils/pdfGenerator';

// Configure email transporter (you'll need to set up your email credentials)
const createTransporter = () => {
  // Check if environment variables are set
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    throw new Error('Email credentials not configured. Please set EMAIL_USER and EMAIL_PASSWORD environment variables.');
  }

  return nodemailer.createTransport({
    service: 'gmail', // or your email service
    auth: {
      user: process.env.EMAIL_USER,
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
    let transporter;
    try {
      transporter = createTransporter();
    } catch (error) {
      return res.status(500).json({ 
        error: 'Email configuration error',
        details: error instanceof Error ? error.message : 'Email credentials not configured'
      });
    }

    // Email configuration
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'khadkasakriya81@gmail.com', // Set recipient email
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

    // Check email configuration first
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      return res.status(500).json({ 
        error: 'Email configuration error',
        details: 'Email credentials not configured. Please set EMAIL_USER and EMAIL_PASSWORD environment variables.'
      });
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

    // Generate PDF with fallback
    let pdfBuffer = null;
    let pdfGenerated = false;
    
    try {
      console.log('Attempting to generate PDF for bulk order:', finalOrderNumber);
      pdfBuffer = await generateBulkInvoicePDF(bulkOrderData);
      console.log('PDF generated successfully, buffer size:', pdfBuffer.length);
      pdfGenerated = true;
    } catch (pdfError) {
      console.error('PDF generation failed, will send email without attachment:', pdfError);
      pdfGenerated = false;
    }

    // Create transporter
    let transporter;
    try {
      transporter = createTransporter();
    } catch (error) {
      return res.status(500).json({ 
        error: 'Email configuration error',
        details: error instanceof Error ? error.message : 'Email credentials not configured'
      });
    }

    // Calculate totals for email body
    const totalItems = orders.length;
    const totalQuantity = orders.reduce((sum: number, order: any) => sum + order.quantity, 0);

    // Email configuration with conditional PDF attachment
    const mailOptions: any = {
      from: process.env.EMAIL_USER,
      to: 'khadkasakriya81@gmail.com',
      subject: `Bulk Order Request - ${finalOrderNumber}`,
      text: `Bulk order request for ${totalItems} items with total quantity of ${totalQuantity}.${pdfGenerated ? ' PDF invoice attached.' : ' PDF generation failed, but order details are included below.'}`,
      html: `
        <h2>Bulk Order Request</h2>
        <p><strong>Order Number:</strong> ${finalOrderNumber}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        <p><strong>Total Items:</strong> ${totalItems}</p>
        <p><strong>Total Quantity:</strong> ${totalQuantity}</p>
        
        ${pdfGenerated ? '<p>Please find the detailed invoice attached as PDF.</p>' : '<p style="color: #d97706;">⚠️ PDF generation failed, but order details are included below.</p>'}
        
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
      `
    };

    // Add PDF attachment if generated successfully
    if (pdfGenerated && pdfBuffer) {
      mailOptions.attachments = [
        {
          filename: `Bulk_Order_Invoice_${finalOrderNumber}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ];
      console.log('PDF attachment added to email');
    } else {
      mailOptions.attachments = [];
      console.log('No PDF attachment - PDF generation failed');
    }

    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    res.status(200).json({ 
      message: pdfGenerated ? 'Bulk order email with PDF sent successfully' : 'Bulk order email sent successfully (PDF generation failed)',
      messageId: info?.messageId || 'unknown',
      orderNumber: finalOrderNumber,
      totalItems,
      totalQuantity,
      pdfGenerated
    });

  } catch (error) {
    console.error('Error in sendBulkOrderEmailWithPDF:', error);
    res.status(500).json({ 
      error: 'Failed to send bulk order email',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}; 

export const sendIndividualOrderEmailWithPDF = async (req: Request, res: Response) => {
  try {
    const { orders, orderNumber } = req.body;

    if (!orders || !Array.isArray(orders) || orders.length === 0) {
      return res.status(400).json({ error: 'Missing or invalid orders data' });
    }

    // Check email configuration first
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      return res.status(500).json({ 
        error: 'Email configuration error',
        details: 'Email credentials not configured. Please set EMAIL_USER and EMAIL_PASSWORD environment variables.'
      });
    }

    // Generate unique order number if not provided
    const finalOrderNumber = orderNumber || `IO-${Date.now()}`;
    
    // Prepare data for PDF generation
    const orderData = {
      items: orders.map((order: any) => ({
        partNumber: order.partNumber || order.modelName,
        model: order.modelName || order.model,
        location: order.location,
        quantity: order.quantity
      })),
      orderDate: new Date().toLocaleDateString(),
      orderNumber: finalOrderNumber
    };

    // Generate PDF
    let pdfBuffer = null;
    let pdfGenerated = false;
    
    try {
      console.log('Generating PDF for individual order:', finalOrderNumber);
      pdfBuffer = await generateBulkInvoicePDF(orderData);
      console.log('PDF generated successfully, buffer size:', pdfBuffer.length);
      pdfGenerated = true;
    } catch (pdfError) {
      console.error('PDF generation failed:', pdfError);
      pdfGenerated = false;
    }

    // Create transporter
    let transporter;
    try {
      transporter = createTransporter();
    } catch (error) {
      return res.status(500).json({ 
        error: 'Email configuration error',
        details: error instanceof Error ? error.message : 'Email credentials not configured'
      });
    }

    // Calculate totals
    const totalItems = orders.length;
    const totalQuantity = orders.reduce((sum: number, order: any) => sum + order.quantity, 0);

    // Email configuration
    const mailOptions: any = {
      from: process.env.EMAIL_USER,
      to: 'khadkasakriya81@gmail.com',
      subject: `Individual Order Request - ${finalOrderNumber}`,
      text: `Individual order request for ${totalItems} items with total quantity of ${totalQuantity}.${pdfGenerated ? ' PDF invoice attached.' : ' PDF generation failed, but order details are included below.'}`,
      html: `
        <h2>Individual Order Request</h2>
        <p><strong>Order Number:</strong> ${finalOrderNumber}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        <p><strong>Total Items:</strong> ${totalItems}</p>
        <p><strong>Total Quantity:</strong> ${totalQuantity}</p>
        
        ${pdfGenerated ? '<p>Please find the detailed invoice attached as PDF.</p>' : '<p style="color: #d97706;">⚠️ PDF generation failed, but order details are included below.</p>'}
        
        <h3>Order Details:</h3>
        <ul>
          ${orders.map((order: any) => 
            `<li><strong>Part:</strong> ${order.partNumber || order.modelName} | <strong>Model:</strong> ${order.modelName || order.model} | <strong>Qty:</strong> ${order.quantity} | <strong>Location:</strong> ${order.location}</li>`
          ).join('')}
        </ul>
        
        <p>Thank you!</p>
        <hr>
        <p style="font-size: 12px; color: #666;">
          <strong>Precision Turbo Services</strong><br>
          Professional Turbo Management Solutions<br>
          Email: turboprecision2@gmail.com
        </p>
      `
    };

    // Add PDF attachment if generated successfully
    if (pdfGenerated && pdfBuffer) {
      mailOptions.attachments = [
        {
          filename: `Individual_Order_Invoice_${finalOrderNumber}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ];
      console.log('PDF attachment added to individual order email');
    } else {
      mailOptions.attachments = [];
      console.log('No PDF attachment - PDF generation failed');
    }

    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    res.status(200).json({ 
      message: pdfGenerated ? 'Individual order email with PDF sent successfully' : 'Individual order email sent successfully (PDF generation failed)',
      messageId: info?.messageId || 'unknown',
      orderNumber: finalOrderNumber,
      totalItems,
      totalQuantity,
      pdfGenerated
    });

  } catch (error) {
    console.error('Error in sendIndividualOrderEmailWithPDF:', error);
    res.status(500).json({ 
      error: 'Failed to send individual order email',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}; 