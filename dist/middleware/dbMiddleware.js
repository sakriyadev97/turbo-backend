"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureDBConnection = void 0;
const db_1 = require("../config/db/db");
const ensureDBConnection = async (req, res, next) => {
    try {
        // Ensure database is connected before proceeding
        await (0, db_1.connectDB)();
        next();
    }
    catch (error) {
        console.error('Database connection error in middleware:', error);
        return res.status(500).json({
            error: 'Database connection failed',
            details: error
        });
    }
};
exports.ensureDBConnection = ensureDBConnection;
