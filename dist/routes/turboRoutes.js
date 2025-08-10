"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const turboController_1 = require("../controller/turboController");
const turboRouter = (0, express_1.Router)();
// Auth routes
// Route to get turbo statistics
turboRouter.get('/turbos/stats', turboController_1.getTurboStats);
// Route to get low stock items
turboRouter.get('/turbos/low-stock', turboController_1.getLowStockItems);
// Route to get all turbos
turboRouter.get('/turbos', turboController_1.getAllTurbos);
// Route to add a turbo
turboRouter.post('/create-turbo', turboController_1.addTurbo);
// Route to update a turbo by part number (MUST come before /:id routes)
turboRouter.put('/turbos/update-by-partnumber', turboController_1.updateTurboByPartNumber);
// Route to delete a turbo by part number (MUST come before /:id routes)
turboRouter.delete('/turbos/delete-by-partnumber/:partNumber', turboController_1.deleteTurboByPartNumber);
// Route to sell a turbo
turboRouter.post('/turbos/sell', turboController_1.sellTurbo);
// Route to get a specific turbo by ID
turboRouter.get('/turbos/:id', turboController_1.getTurbo);
// Route to update a specific turbo by ID
turboRouter.put('/turbos/:id', turboController_1.updateTurbo);
// Route to delete a specific turbo by ID
turboRouter.delete('/turbos/:id', turboController_1.deleteTurbo);
exports.default = turboRouter;
