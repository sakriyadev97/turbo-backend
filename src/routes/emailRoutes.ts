import express from 'express';
import { sendOrderEmail, sendBulkOrderEmailWithPDF } from '../controller/emailController';

const emailRouter = express.Router();

// Route to send order emails
emailRouter.post('/send-order-email', sendOrderEmail);
emailRouter.post('/send-bulk-order-email', sendBulkOrderEmailWithPDF);

export default emailRouter; 