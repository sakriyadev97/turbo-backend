import { Request, Response } from 'express';
import nodemailer from 'nodemailer';

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
    console.log('=== EMAIL CONTROLLER CALLED ===');
    console.log('Request body:', req.body);
    
    const { subject, body, orders } = req.body;

    if (!subject || !body || !orders) {
      console.log('Missing required fields');
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log('Creating email transporter...');
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

    console.log('Email configuration:', {
      from: process.env.EMAIL_USER,
      to: 'khadksakriya81@gmail.com',
      subject: subject
    });

    console.log('Sending email...');
    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email sent successfully:', info.messageId);
    console.log('Full email info:', info);
    console.log('Email response:', info.response);
    
    res.status(200).json({ 
      message: 'Order email sent successfully',
      messageId: info.messageId 
    });

  } catch (error) {
    console.error('Error sending order email:', error);
    res.status(500).json({ 
      error: 'Failed to send order email',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}; 