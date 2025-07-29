import express from 'express';
import { sendOrderEmail } from '../controller/emailController';

const emailRouter = express.Router();

// Route to send order emails
emailRouter.post('/send-order-email', sendOrderEmail);

export default emailRouter; 