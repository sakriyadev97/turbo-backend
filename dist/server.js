"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const helmet_1 = __importDefault(require("helmet"));
const index_1 = __importDefault(require("./routes/index"));
const cors_1 = __importDefault(require("cors"));
const config_1 = __importDefault(require("./config"));
const db_1 = __importDefault(require("./config/db/db"));
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        console.log('CORS request from origin:', origin);
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) {
            console.log('No origin, allowing request');
            return callback(null, true);
        }
        // Get allowed origins from config, with fallbacks
        let allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:3001'
        ];
        if (config_1.default.app.allowedOrigin) {
            // Handle both single origin and comma-separated origins
            if (config_1.default.app.allowedOrigin.includes(',')) {
                allowedOrigins = config_1.default.app.allowedOrigin.split(',').map(o => o.trim());
            }
            else {
                // If it's just a port number, convert to full URL
                if (config_1.default.app.allowedOrigin.match(/^\d+$/)) {
                    allowedOrigins = [`http://localhost:${config_1.default.app.allowedOrigin}`];
                }
                else {
                    // Use the allowed origin from .env
                    allowedOrigins = [config_1.default.app.allowedOrigin];
                }
            }
        }
        console.log('Allowed origins:', allowedOrigins);
        console.log('Request origin:', origin);
        // Check if origin matches any allowed origin
        const isAllowed = allowedOrigins.some(allowedOrigin => {
            // Handle wildcard patterns for Vercel
            if (allowedOrigin.includes('*')) {
                const pattern = allowedOrigin.replace(/\*/g, '.*');
                return new RegExp(pattern).test(origin);
            }
            return allowedOrigin === origin;
        });
        if (isAllowed) {
            console.log('Origin allowed');
            callback(null, true);
        }
        else {
            console.log('CORS blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express_1.default.json());
app.use((0, helmet_1.default)());
app.use('/api', index_1.default);
// Database connection
db_1.default.on("error", console.error.bind(console, "MongoDB connection error:"));
db_1.default.on("close", function () {
    console.log("DB connection is closed");
});
db_1.default.once("open", function () {
    console.log("Connected to MongoDB database!!");
});
const port = config_1.default.app.port || 5000;
const host = config_1.default.app.host || "localhost";
httpServer.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://${host}:${port}`);
});
