"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLowStockItems = exports.getTurboStats = exports.getAllTurbos = exports.deleteTurbo = exports.updateTurboByPartNumber = exports.updateTurbo = exports.getTurbo = exports.addTurbo = void 0;
const turbo_1 = __importDefault(require("../model/turbo"));
const addTurbo = async (req, res) => {
    try {
        const { location, hasSizeOption, partNumbers, sizeVariants, quantity, threshold } = req.body;
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
        const { location, hasSizeOption, partNumbers, sizeVariants, quantity, threshold } = req.body;
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
        const { partNumber, location, hasSizeOption, partNumbers, sizeVariants, quantity, threshold } = req.body;
        if (!partNumber) {
            return res.status(400).json({ error: 'Part number is required.' });
        }
        if (!location) {
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
        const updatedTurbo = await turbo_1.default.findByIdAndUpdate(turbo._id, {
            location,
            hasSizeOption: !!hasSizeOption,
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
        // Calculate low stock items (items where quantity <= 1)
        let lowStockItems = 0;
        const thresholdForDisplay = 1; // Items with quantity ≤ 1 are considered low stock
        turbos.forEach(turbo => {
            if (turbo.hasSizeOption && turbo.sizeVariants) {
                // Check big size variant
                if (turbo.sizeVariants.big && (turbo.sizeVariants.big.quantity || 0) <= thresholdForDisplay) {
                    lowStockItems += turbo.sizeVariants.big.partNumbers ? turbo.sizeVariants.big.partNumbers.length : 0;
                }
                // Check small size variant
                if (turbo.sizeVariants.small && (turbo.sizeVariants.small.quantity || 0) <= thresholdForDisplay) {
                    lowStockItems += turbo.sizeVariants.small.partNumbers ? turbo.sizeVariants.small.partNumbers.length : 0;
                }
            }
            else {
                // For items without size options, check the main quantity
                if ((turbo.quantity || 0) <= thresholdForDisplay) {
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
            const thresholdForDisplay = 1; // Show items with quantity ≤ 1
            if (turbo.hasSizeOption && turbo.sizeVariants) {
                // Check big size variant
                if (turbo.sizeVariants.big && turbo.sizeVariants.big.quantity <= thresholdForDisplay) {
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
                if (turbo.sizeVariants.small && turbo.sizeVariants.small.quantity <= thresholdForDisplay) {
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
                if ((turbo.quantity || 0) <= thresholdForDisplay) {
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
