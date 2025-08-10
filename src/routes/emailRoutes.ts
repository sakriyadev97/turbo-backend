import express from 'express';
import { sendOrderEmail, sendBulkOrderEmailWithPDF, sendIndividualOrderEmailWithPDF } from '../controller/emailController';

const emailRouter = express.Router();

// Route to send order emails
emailRouter.post('/send-order-email', sendOrderEmail);
emailRouter.post('/send-bulk-order-email', sendBulkOrderEmailWithPDF);

// Add the endpoint the frontend is actually calling
emailRouter.post('/send-order-email-with-pdf', sendIndividualOrderEmailWithPDF);

export default emailRouter; 