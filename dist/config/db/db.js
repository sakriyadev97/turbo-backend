"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const index_1 = __importDefault(require("../index"));
const MONGO_URL = index_1.default.db.mongoURL || '';
// Create a connection promise
let connectionPromise = null;
const connectDB = async () => {
    if (connectionPromise) {
        await connectionPromise;
        return;
    }
    connectionPromise = mongoose_1.default.connect(MONGO_URL, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
        socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
        family: 4, // Use IPv4, skip trying IPv6
        maxPoolSize: 10, // Maintain up to 10 socket connections
        serverApi: {
            version: '1',
            strict: true,
            deprecationErrors: true,
        }
    });
    try {
        await connectionPromise;
        console.log('Connected to MongoDB database!!');
    }
    catch (error) {
        console.error('MongoDB connection error:', error);
        connectionPromise = null; // Reset on error
        throw error;
    }
};
exports.connectDB = connectDB;
const db = mongoose_1.default.connection;
// Database connection event handlers
db.on("error", (error) => {
    console.error("MongoDB connection error:", error);
});
db.on("close", function () {
    console.log("DB connection is closed");
});
exports.default = db;
