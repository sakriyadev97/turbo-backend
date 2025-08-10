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
exports.default = emailRouter;
