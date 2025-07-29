import { Request, Response } from 'express';
import PendingOrder, { IPendingOrder } from '../model/pendingOrder';

// Get all pending orders
export const getAllPendingOrders = async (req: Request, res: Response) => {
  try {
    console.log('Getting all pending orders...');
    const pendingOrders = await PendingOrder.find({}).sort({ orderDate: -1 }); // Most recent first
    console.log('Found pending orders:', pendingOrders.length);
    return res.status(200).json({ pendingOrders });
  } catch (error) {
    console.error('Error getting pending orders:', error);
    return res.status(500).json({ error: 'Server error', details: error });
  }
};

// Create a new pending order
export const createPendingOrder = async (req: Request, res: Response) => {
  try {
    console.log('Creating pending order with body:', req.body);
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
    const newPendingOrder = new PendingOrder({
      partNumber,
      modelName,
      location,
      quantity,
      orderDate: new Date(),
      status: 'pending'
    });

    const savedOrder = await newPendingOrder.save();
    console.log('Created pending order:', savedOrder);
    
    return res.status(201).json({ 
      message: 'Pending order created successfully', 
      pendingOrder: savedOrder 
    });
  } catch (error) {
    console.error('Error creating pending order:', error);
    return res.status(500).json({ error: 'Server error', details: error });
  }
};

// Mark order as arrived
export const markOrderAsArrived = async (req: Request, res: Response) => {
  try {
    console.log('Marking order as arrived with body:', req.body);
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required.' });
    }

    // Find and update the pending order
    const updatedOrder = await PendingOrder.findByIdAndUpdate(
      orderId,
      { status: 'arrived' },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ error: 'Pending order not found.' });
    }

    console.log('Marked order as arrived:', updatedOrder);
    return res.status(200).json({ 
      message: 'Order marked as arrived successfully', 
      pendingOrder: updatedOrder 
    });
  } catch (error) {
    console.error('Error marking order as arrived:', error);
    return res.status(500).json({ error: 'Server error', details: error });
  }
};

// Delete a pending order
export const deletePendingOrder = async (req: Request, res: Response) => {
  try {
    console.log('Deleting pending order with ID:', req.params.orderId);
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required.' });
    }

    const deletedOrder = await PendingOrder.findByIdAndDelete(orderId);

    if (!deletedOrder) {
      return res.status(404).json({ error: 'Pending order not found.' });
    }

    console.log('Deleted pending order:', deletedOrder);
    return res.status(200).json({ 
      message: 'Pending order deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting pending order:', error);
    return res.status(500).json({ error: 'Server error', details: error });
  }
}; 