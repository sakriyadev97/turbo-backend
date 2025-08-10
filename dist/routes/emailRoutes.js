"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const emailController_1 = require("../controller/emailController");
const emailRouter = express_1.default.Router();
// Route to send order emails
emailRouter.post('/send-order-email', emailController_1.sendOrderEmail);
emailRouter.post('/send-bulk-order-email', emailController_1.sendBulkOrderEmailWithPDF);
// Add the endpoint the frontend is actually calling
emailRouter.post('/send-order-email-with-pdf', emailController_1.sendIndividualOrderEmailWithPDF);
exports.default = emailRouter;
