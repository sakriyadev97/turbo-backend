import { Router } from 'express';
import { addTurbo, getTurbo, updateTurbo, updateTurboByPartNumber, deleteTurbo, getAllTurbos, getTurboStats, getLowStockItems, sellTurbo } from '../controller/turboController';

const turboRouter = Router();

// Auth routes

// Route to get turbo statistics
turboRouter.get('/turbos/stats', getTurboStats);

// Route to get low stock items
turboRouter.get('/turbos/low-stock', getLowStockItems);

// Route to get all turbos
turboRouter.get('/turbos', getAllTurbos);

// Route to add a turbo
turboRouter.post('/create-turbo', addTurbo);

// Route to update a turbo by part number (MUST come before /:id routes)
turboRouter.put('/turbos/update-by-partnumber', updateTurboByPartNumber);

// Route to sell a turbo
turboRouter.post('/turbos/sell', sellTurbo);

// Route to get a specific turbo by ID
turboRouter.get('/turbos/:id', getTurbo);

// Route to update a specific turbo by ID
turboRouter.put('/turbos/:id', updateTurbo);

// Route to delete a specific turbo by ID
turboRouter.delete('/turbos/:id', deleteTurbo);

export default turboRouter; 