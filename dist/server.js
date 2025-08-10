"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const index_1 = __importDefault(require("./routes/index"));
const cors_1 = __importDefault(require("cors"));
const dbMiddleware_1 = require("./middleware/dbMiddleware");
const db_1 = require("./config/db/db");
const app = (0, express_1.default)();
// app.use(cors({
//   origin: function (origin, callback) {
//     console.log('CORS request from origin:', origin);
//     // Allow requests with no origin (like mobile apps or curl requests)
//     if (!origin) {
//       console.log('No origin, allowing request');
//       return callback(null, true);
//     }
//     // Get allowed origins from config, with fallbacks
//     let allowedOrigins = [
//       'http://localhost:3000', 
//       'http://localhost:3001',
//       'https://turbo-frontend-kappa.vercel.app'
//     ];
//     if (config.app.allowedOrigin) {
//       // Handle both single origin and comma-separated origins
//       if (config.app.allowedOrigin.includes(',')) {
//         allowedOrigins = config.app.allowedOrigin.split(',').map(o => o.trim());
//       } else {
//         // If it's just a port number, convert to full URL
//         if (config.app.allowedOrigin.match(/^\d+$/)) {
//           allowedOrigins = [`http://localhost:${config.app.allowedOrigin}`];
//         } else {
//           // Use the allowed origin from .env
//           allowedOrigins = [config.app.allowedOrigin];
//         }
//       }
//     }
//     console.log('Allowed origins:', allowedOrigins);
//     console.log('Request origin:', origin);
//     // Check if origin matches any allowed origin
//     const isAllowed = allowedOrigins.some(allowedOrigin => {
//       // Handle wildcard patterns for Vercel
//       if (allowedOrigin.includes('*')) {
//         const pattern = allowedOrigin.replace(/\*/g, '.*');
//         return new RegExp(pattern).test(origin);
//       }
//       return allowedOrigin === origin;
//     });
//     if (isAllowed) {
//       console.log('Origin allowed');
//       callback(null, true);
//     } else {
//       console.log('CORS blocked origin:', origin);
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization']
// }));
app.use((0, cors_1.default)({
    origin: ["http://localhost:3000", "https://turbo-frontend-kappa.vercel.app"],
    credentials: true,
}));
app.use(express_1.default.json());
app.use((0, helmet_1.default)());
// Root route for testing
app.get('/', (req, res) => {
    res.json({
        message: 'Turbo Backend API is running!',
        endpoints: {
            turbos: '/api/turbos',
            stats: '/api/turbos/stats',
            auth: '/api/auth/login',
            pendingOrders: '/api/pending-orders'
        }
    });
});
app.use('/api', dbMiddleware_1.ensureDBConnection, index_1.default);
// Initialize database connection
const initializeApp = async () => {
    try {
        // Connect to databasea
        await (0, db_1.connectDB)();
        console.log("⚡️[server]: Database connected and server ready");
    }
    catch (error) {
        console.error('Failed to initialize app:', error);
        throw error;
    }
};
// Initialize the app
initializeApp();
// Export the Express app for Vercel serverless functions
exports.default = app;
