"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const pendingOrderController_1 = require("../controller/pendingOrderController");
const router = express_1.default.Router();
// Get all pending orders
router.get('/all-pending-orders', pendingOrderController_1.getAllPendingOrders);
// Create a new pending order
router.post('/create-order', pendingOrderController_1.createPendingOrder);
// Mark order as arrived
router.put('/:orderId/arrived', pendingOrderController_1.markOrderAsArrived);
// Delete a pending order
router.delete('/:orderId', pendingOrderController_1.deletePendingOrder);
exports.default = router;
