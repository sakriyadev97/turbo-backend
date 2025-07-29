import express from 'express';
import { 
  getAllPendingOrders, 
  createPendingOrder, 
  markOrderAsArrived, 
  deletePendingOrder 
} from '../controller/pendingOrderController';

const router = express.Router();

// Get all pending orders
router.get('/all-pending-orders', getAllPendingOrders);

// Create a new pending order
router.post('/create-order', createPendingOrder);

// Mark order as arrived
router.put('/:orderId/arrived', markOrderAsArrived);

// Delete a pending order
router.delete('/:orderId', deletePendingOrder);

export default router; 