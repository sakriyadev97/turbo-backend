import mongoose, { ConnectOptions } from "mongoose";
import dbConfig from '../index';

const MONGO_URL = dbConfig.db.mongoURL || '';

// Create a connection promise
let connectionPromise: Promise<typeof mongoose> | null = null;

const connectDB = async () => {
    if (connectionPromise) {
        await connectionPromise;
        return;
    }
    
    connectionPromise = mongoose.connect(MONGO_URL, {
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
    } catch (error) {
        console.error('MongoDB connection error:', error);
        connectionPromise = null; // Reset on error
        throw error;
    }
};

const db = mongoose.connection;

// Database connection event handlers
db.on("error", (error) => {
    console.error("MongoDB connection error:", error);
});

db.on("close", function () {
    console.log("DB connection is closed");
});

export { connectDB };
export default db;