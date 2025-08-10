"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sellTurbo = exports.getLowStockItems = exports.getTurboStats = exports.getAllTurbos = exports.deleteTurboByPartNumber = exports.deleteTurbo = exports.updateTurboByPartNumber = exports.updateTurbo = exports.getTurbo = exports.addTurbo = void 0;
const turbo_1 = __importDefault(require("../model/turbo"));
// Helper function to determine if an item is low stock based on priority
const isLowStockItem = (quantity, priority = false) => {
    if (priority) {
        return quantity <= 5; // Priority items: low stock if 5 or less
    }
    return quantity <= 1; // Regular items: low stock if 1 or less
};
const addTurbo = async (req, res) => {
    try {
        const { location, hasSizeOption, partNumbers, sizeVariants, quantity, threshold, priority } = req.body;
        if (!location) {
            return res.status(400).json({ error: 'Location is required.' });
        }
        if (hasSizeOption) {
            // If size option is selected, require at least one of big or small
            if (!sizeVariants || (!sizeVariants.big && !sizeVariants.small)) {
                return res.status(400).json({ error: 'At least one of big or small size variant is required.' });
            }
            // Validate each size variant
            for (const size of ['big', 'small']) {
                if (sizeVariants[size]) {
                    if (!sizeVariants[size].partNumbers || !Array.isArray(sizeVariants[size].partNumbers) || sizeVariants[size].partNumbers.length === 0) {
                        return res.status(400).json({ error: `Model name(s) for ${size} size is required (comma separated).` });
                    }
                    if (typeof sizeVariants[size].quantity !== 'number' || sizeVariants[size].quantity < 0) {
                        return res.status(400).json({ error: `Quantity for ${size} size is required and must be a non-negative number.` });
                    }
                }
            }
        }
        else {
            // No size option, require partNumbers and quantity
            if (!partNumbers || !Array.isArray(partNumbers) || partNumbers.length === 0) {
                return res.status(400).json({ error: 'Model name(s) is required (comma separated).' });
            }
            if (typeof quantity !== 'number' || quantity < 0) {
                return res.status(400).json({ error: 'Quantity is required and must be a non-negative number.' });
            }
        }
        // Create the turbo document
        const turbo = new turbo_1.default({
            location,
            hasSizeOption: !!hasSizeOption,
            priority: !!priority, // Add priority field
            partNumbers: hasSizeOption ? undefined : partNumbers,
            sizeVariants: hasSizeOption ? sizeVariants : undefined,
            quantity: hasSizeOption ? undefined : quantity,
            threshold: threshold || 0,
        });
        await turbo.save();
        return res.status(201).json({ message: 'Turbo added successfully', turbo });
    }
    catch (error) {
        return res.status(500).json({ error: 'Server error', details: error });
    }
};
exports.addTurbo = addTurbo;
const getTurbo = async (req, res) => {
    try {
        const { id } = req.params;
        const turbo = await turbo_1.default.findById(id);
        if (!turbo) {
            return res.status(404).json({ error: 'Turbo not found.' });
        }
        return res.status(200).json({ turbo });
    }
    catch (error) {
        return res.status(500).json({ error: 'Server error', details: error });
    }
};
exports.getTurbo = getTurbo;
const updateTurbo = async (req, res) => {
    try {
        const { id } = req.params;
        const { location, hasSizeOption, partNumbers, sizeVariants, quantity, threshold, priority } = req.body;
        const turbo = await turbo_1.default.findById(id);
        if (!turbo) {
            return res.status(404).json({ error: 'Turbo not found.' });
        }
        if (!location) {
            return res.status(400).json({ error: 'Location is required.' });
        }
        if (hasSizeOption) {
            // If size option is selected, require at least one of big or small
            if (!sizeVariants || (!sizeVariants.big && !sizeVariants.small)) {
                return res.status(400).json({ error: 'At least one of big or small size variant is required.' });
            }
            // Validate each size variant
            for (const size of ['big', 'small']) {
                if (sizeVariants[size]) {
                    if (!sizeVariants[size].partNumbers || !Array.isArray(sizeVariants[size].partNumbers) || sizeVariants[size].partNumbers.length === 0) {
                        return res.status(400).json({ error: `Model name(s) for ${size} size is required (comma separated).` });
                    }
                    if (typeof sizeVariants[size].quantity !== 'number' || sizeVariants[size].quantity < 0) {
                        return res.status(400).json({ error: `Quantity for ${size} size is required and must be a non-negative number.` });
                    }
                }
            }
        }
        else {
            // No size option, require partNumbers and quantity
            if (!partNumbers || !Array.isArray(partNumbers) || partNumbers.length === 0) {
                return res.status(400).json({ error: 'Model name(s) is required (comma separated).' });
            }
            if (typeof quantity !== 'number' || quantity < 0) {
                return res.status(400).json({ error: 'Quantity is required and must be a non-negative number.' });
            }
        }
        // Update the turbo document
        const updatedTurbo = await turbo_1.default.findByIdAndUpdate(id, {
            location,
            hasSizeOption: !!hasSizeOption,
            priority: !!priority, // Add priority field
            partNumbers: hasSizeOption ? undefined : partNumbers,
            sizeVariants: hasSizeOption ? sizeVariants : undefined,
            quantity: hasSizeOption ? undefined : quantity,
            threshold: threshold || 0,
        }, { new: true });
        return res.status(200).json({ message: 'Turbo updated successfully', turbo: updatedTurbo });
    }
    catch (error) {
        return res.status(500).json({ error: 'Server error', details: error });
    }
};
exports.updateTurbo = updateTurbo;
const updateTurboByPartNumber = async (req, res) => {
    try {
        const { partNumber, location, hasSizeOption, partNumbers, sizeVariants, quantity, threshold, priority, operation } = req.body;
        if (!partNumber) {
            return res.status(400).json({ error: 'Part number is required.' });
        }
        // Location is only required for update operations, not for "add" operations
        if (operation !== 'add' && !location) {
            return res.status(400).json({ error: 'Location is required.' });
        }
        // Find turbo document that contains this part number
        let turbo = await turbo_1.default.findOne({
            $or: [
                { partNumbers: partNumber },
                { 'sizeVariants.big.partNumbers': partNumber },
                { 'sizeVariants.small.partNumbers': partNumber }
            ]
        });
        if (!turbo) {
            return res.status(404).json({ error: 'Turbo not found with this part number.' });
        }
        // Handle "add" operation for when orders arrive
        if (operation === 'add' && quantity) {
            // Find which field contains the part number and add to its quantity
            if (turbo.partNumbers && turbo.partNumbers.includes(partNumber)) {
                // Regular turbo (no size variants)
                const newQuantity = (turbo.quantity || 0) + quantity;
                const updatedTurbo = await turbo_1.default.findByIdAndUpdate(turbo._id, { quantity: newQuantity }, { new: true });
                return res.status(200).json({
                    message: `Quantity added successfully. New total: ${newQuantity}`,
                    turbo: updatedTurbo
                });
            }
            else if (turbo.sizeVariants) {
                // Size variants turbo
                let updated = false;
                const updateData = {};
                if (turbo.sizeVariants.big && turbo.sizeVariants.big.partNumbers.includes(partNumber)) {
                    const newQuantity = (turbo.sizeVariants.big.quantity || 0) + quantity;
                    updateData['sizeVariants.big.quantity'] = newQuantity;
                    updated = true;
                }
                else if (turbo.sizeVariants.small && turbo.sizeVariants.small.partNumbers.includes(partNumber)) {
                    const newQuantity = (turbo.sizeVariants.small.quantity || 0) + quantity;
                    updateData['sizeVariants.small.quantity'] = newQuantity;
                    updated = true;
                }
                if (updated) {
                    const updatedTurbo = await turbo_1.default.findByIdAndUpdate(turbo._id, updateData, { new: true });
                    return res.status(200).json({
                        message: `Quantity added successfully.`,
                        turbo: updatedTurbo
                    });
                }
            }
            return res.status(400).json({ error: 'Could not add quantity to this turbo.' });
        }
        if (hasSizeOption) {
            // If size option is selected, require at least one of big or small
            if (!sizeVariants || (!sizeVariants.big && !sizeVariants.small)) {
                return res.status(400).json({ error: 'At least one of big or small size variant is required.' });
            }
            // Validate each size variant
            for (const size of ['big', 'small']) {
                if (sizeVariants[size]) {
                    if (!sizeVariants[size].partNumbers || !Array.isArray(sizeVariants[size].partNumbers) || sizeVariants[size].partNumbers.length === 0) {
                        return res.status(400).json({ error: `Model name(s) for ${size} size is required (comma separated).` });
                    }
                    if (typeof sizeVariants[size].quantity !== 'number' || sizeVariants[size].quantity < 0) {
                        return res.status(400).json({ error: `Quantity for ${size} size is required and must be a non-negative number.` });
                    }
                }
            }
        }
        else {
            // No size option, require partNumbers and quantity
            if (!partNumbers || !Array.isArray(partNumbers) || partNumbers.length === 0) {
                return res.status(400).json({ error: 'Model name(s) is required (comma separated).' });
            }
            if (typeof quantity !== 'number' || quantity < 0) {
                return res.status(400).json({ error: 'Quantity is required and must be a non-negative number.' });
            }
        }
        const updateData = {
            location,
            hasSizeOption: !!hasSizeOption,
            priority: !!priority, // Add priority field
            partNumbers: hasSizeOption ? undefined : partNumbers,
            sizeVariants: hasSizeOption ? sizeVariants : undefined,
            quantity: hasSizeOption ? undefined : quantity,
            threshold: threshold || 0,
        };
        // Update the turbo document
        const updatedTurbo = await turbo_1.default.findByIdAndUpdate(turbo._id, updateData, { new: true });
        return res.status(200).json({ message: 'Turbo updated successfully', turbo: updatedTurbo });
    }
    catch (error) {
        return res.status(500).json({ error: 'Server error', details: error });
    }
};
exports.updateTurboByPartNumber = updateTurboByPartNumber;
const deleteTurbo = async (req, res) => {
    try {
        const { id } = req.params;
        const turbo = await turbo_1.default.findByIdAndDelete(id);
        if (!turbo) {
            return res.status(404).json({ error: 'Turbo not found.' });
        }
        return res.status(200).json({ message: 'Turbo deleted successfully' });
    }
    catch (error) {
        return res.status(500).json({ error: 'Server error', details: error });
    }
};
exports.deleteTurbo = deleteTurbo;
const deleteTurboByPartNumber = async (req, res) => {
    try {
        const { partNumber } = req.params;
        // Find and delete the turbo document that contains this part number
        const turbo = await turbo_1.default.findOneAndDelete({
            $or: [
                { 'partNumbers': partNumber },
                { 'sizeVariants.big.partNumbers': partNumber },
                { 'sizeVariants.small.partNumbers': partNumber }
            ]
        });
        if (!turbo) {
            return res.status(404).json({ error: 'Turbo not found.' });
        }
        return res.status(200).json({ message: 'Turbo deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting turbo by part number:', error);
        return res.status(500).json({ error: 'Server error', details: error });
    }
};
exports.deleteTurboByPartNumber = deleteTurboByPartNumber;
const getAllTurbos = async (req, res) => {
    try {
        const turbos = await turbo_1.default.find({});
        return res.status(200).json({ turbos });
    }
    catch (error) {
        return res.status(500).json({ error: 'Server error', details: error });
    }
};
exports.getAllTurbos = getAllTurbos;
const getTurboStats = async (req, res) => {
    try {
        // Get total items (count of all turbo documents)
        const totalItems = await turbo_1.default.countDocuments({});
        // Calculate total quantity
        const turbos = await turbo_1.default.find({});
        let totalQuantity = 0;
        turbos.forEach(turbo => {
            if (turbo.hasSizeOption && turbo.sizeVariants) {
                // Sum quantities from size variants
                if (turbo.sizeVariants.big) {
                    totalQuantity += turbo.sizeVariants.big.quantity || 0;
                }
                if (turbo.sizeVariants.small) {
                    totalQuantity += turbo.sizeVariants.small.quantity || 0;
                }
            }
            else {
                // Add quantity from single turbo
                totalQuantity += turbo.quantity || 0;
            }
        });
        // Calculate low stock items based on priority
        let lowStockItems = 0;
        turbos.forEach(turbo => {
            if (turbo.hasSizeOption && turbo.sizeVariants) {
                // Check big size variant
                if (turbo.sizeVariants.big && isLowStockItem(turbo.sizeVariants.big.quantity || 0, turbo.priority || false)) {
                    lowStockItems += turbo.sizeVariants.big.partNumbers ? turbo.sizeVariants.big.partNumbers.length : 0;
                }
                // Check small size variant
                if (turbo.sizeVariants.small && isLowStockItem(turbo.sizeVariants.small.quantity || 0, turbo.priority || false)) {
                    lowStockItems += turbo.sizeVariants.small.partNumbers ? turbo.sizeVariants.small.partNumbers.length : 0;
                }
            }
            else {
                // For items without size options, check the main quantity
                if (isLowStockItem(turbo.quantity || 0, turbo.priority || false)) {
                    lowStockItems += turbo.partNumbers ? turbo.partNumbers.length : 0;
                }
            }
        });
        return res.status(200).json({
            totalItems,
            totalQuantity,
            lowStockItems
        });
    }
    catch (error) {
        return res.status(500).json({ error: 'Server error', details: error });
    }
};
exports.getTurboStats = getTurboStats;
const getLowStockItems = async (req, res) => {
    try {
        const lowStockItemsList = [];
        const turbos = await turbo_1.default.find({});
        turbos.forEach(turbo => {
            if (turbo.hasSizeOption && turbo.sizeVariants) {
                // Check big size variant
                if (turbo.sizeVariants.big && isLowStockItem(turbo.sizeVariants.big.quantity || 0, turbo.priority || false)) {
                    turbo.sizeVariants.big.partNumbers.forEach(partNumber => {
                        lowStockItemsList.push({
                            id: partNumber,
                            location: turbo.location,
                            quantity: turbo.sizeVariants.big.quantity,
                            status: turbo.sizeVariants.big.quantity === 0 ? 'OUT OF STOCK' : `${turbo.sizeVariants.big.quantity} left`
                        });
                    });
                }
                // Check small size variant
                if (turbo.sizeVariants.small && isLowStockItem(turbo.sizeVariants.small.quantity || 0, turbo.priority || false)) {
                    turbo.sizeVariants.small.partNumbers.forEach(partNumber => {
                        lowStockItemsList.push({
                            id: partNumber,
                            location: turbo.location,
                            quantity: turbo.sizeVariants.small.quantity,
                            status: turbo.sizeVariants.small.quantity === 0 ? 'OUT OF STOCK' : `${turbo.sizeVariants.small.quantity} left`
                        });
                    });
                }
            }
            else if (turbo.partNumbers && turbo.partNumbers.length > 0) {
                // For items without size options, check the main quantity
                if (isLowStockItem(turbo.quantity || 0, turbo.priority || false)) {
                    turbo.partNumbers.forEach(partNumber => {
                        lowStockItemsList.push({
                            id: partNumber,
                            location: turbo.location,
                            quantity: turbo.quantity || 0,
                            status: (turbo.quantity || 0) === 0 ? 'OUT OF STOCK' : `${turbo.quantity} left`
                        });
                    });
                }
            }
        });
        return res.status(200).json({ lowStockItems: lowStockItemsList });
    }
    catch (error) {
        return res.status(500).json({ error: 'Server error', details: error });
    }
};
exports.getLowStockItems = getLowStockItems;
const sellTurbo = async (req, res) => {
    try {
        const { partNumber, quantity } = req.body;
        if (!partNumber) {
            return res.status(400).json({ error: 'Part number is required' });
        }
        if (!quantity || quantity <= 0) {
            return res.status(400).json({ error: 'Valid quantity is required' });
        }
        // Find the turbo by part number
        const turbo = await turbo_1.default.findOne({
            $or: [
                { 'partNumbers': partNumber },
                { 'sizeVariants.big.partNumbers': partNumber },
                { 'sizeVariants.small.partNumbers': partNumber }
            ]
        });
        if (!turbo) {
            return res.status(404).json({ error: 'Turbo not found' });
        }
        let currentQuantity = 0;
        let updatePath = '';
        // Determine which quantity to update based on where the part number is found
        if (turbo.partNumbers && turbo.partNumbers.includes(partNumber)) {
            // Regular turbo item
            currentQuantity = turbo.quantity || 0;
            updatePath = 'quantity';
        }
        else if (turbo.sizeVariants?.big?.partNumbers?.includes(partNumber)) {
            // Big variant
            currentQuantity = turbo.sizeVariants.big.quantity || 0;
            updatePath = 'sizeVariants.big.quantity';
        }
        else if (turbo.sizeVariants?.small?.partNumbers?.includes(partNumber)) {
            // Small variant
            currentQuantity = turbo.sizeVariants.small.quantity || 0;
            updatePath = 'sizeVariants.small.quantity';
        }
        // Check if we have enough stock
        if (currentQuantity < quantity) {
            return res.status(400).json({
                error: 'Not enough quantity to sell',
                available: currentQuantity,
                requested: quantity
            });
        }
        // Calculate new quantity
        const newQuantity = currentQuantity - quantity;
        // Update the turbo
        const updateQuery = {};
        updateQuery[updatePath] = newQuantity;
        const updatedTurbo = await turbo_1.default.findByIdAndUpdate(turbo._id, updateQuery, { new: true });
        if (!updatedTurbo) {
            return res.status(500).json({ error: 'Failed to update turbo' });
        }
        return res.status(200).json({
            message: `Successfully sold ${quantity} turbo(s)`,
            remainingQuantity: newQuantity,
            soldQuantity: quantity,
            partNumber: partNumber
        });
    }
    catch (error) {
        return res.status(500).json({ error: 'Server error', details: error });
    }
};
exports.sellTurbo = sellTurbo;
