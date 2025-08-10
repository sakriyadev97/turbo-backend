"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePendingOrder = exports.markOrderAsArrived = exports.createPendingOrder = exports.getAllPendingOrders = void 0;
const pendingOrder_1 = __importDefault(require("../model/pendingOrder"));
// Get all pending orders
const getAllPendingOrders = async (req, res) => {
    try {
        const pendingOrders = await pendingOrder_1.default.find({}).sort({ orderDate: -1 }); // Most recent first
        return res.status(200).json({ pendingOrders });
    }
    catch (error) {
        return res.status(500).json({ error: 'Server error', details: error });
    }
};
exports.getAllPendingOrders = getAllPendingOrders;
// Create a new pending order
const createPendingOrder = async (req, res) => {
    try {
        const { partNumber, modelName, location, quantity } = req.body;
        // Validate required fields
        if (!partNumber || !modelName || !location || !quantity) {
            return res.status(400).json({
                error: 'Part number, model name, location, and quantity are required.'
            });
        }
        if (quantity <= 0) {
            return res.status(400).json({
                error: 'Quantity must be greater than 0.'
            });
        }
        // Create new pending order
        const newPendingOrder = new pendingOrder_1.default({
            partNumber,
            modelName,
            location,
            quantity,
            orderDate: new Date(),
            status: 'pending'
        });
        const savedOrder = await newPendingOrder.save();
        return res.status(201).json({
            message: 'Pending order created successfully',
            pendingOrder: savedOrder
        });
    }
    catch (error) {
        return res.status(500).json({ error: 'Server error', details: error });
    }
};
exports.createPendingOrder = createPendingOrder;
// Mark order as arrived
const markOrderAsArrived = async (req, res) => {
    try {
        const { orderId } = req.params;
        if (!orderId) {
            return res.status(400).json({ error: 'Order ID is required.' });
        }
        // Find and update the pending order
        const updatedOrder = await pendingOrder_1.default.findByIdAndUpdate(orderId, { status: 'arrived' }, { new: true });
        if (!updatedOrder) {
            return res.status(404).json({ error: 'Pending order not found.' });
        }
        return res.status(200).json({
            message: 'Order marked as arrived successfully',
            pendingOrder: updatedOrder
        });
    }
    catch (error) {
        return res.status(500).json({ error: 'Server error', details: error });
    }
};
exports.markOrderAsArrived = markOrderAsArrived;
// Delete a pending order
const deletePendingOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        if (!orderId) {
            return res.status(400).json({ error: 'Order ID is required.' });
        }
        const deletedOrder = await pendingOrder_1.default.findByIdAndDelete(orderId);
        if (!deletedOrder) {
            return res.status(404).json({ error: 'Pending order not found.' });
        }
        return res.status(200).json({
            message: 'Pending order deleted successfully'
        });
    }
    catch (error) {
        return res.status(500).json({ error: 'Server error', details: error });
    }
};
exports.deletePendingOrder = deletePendingOrder;
