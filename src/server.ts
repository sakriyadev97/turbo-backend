import Express from "express";
import helmet from "helmet";
import routes from "./routes/index";
import cors from "cors";
import config from "./config";
import { ensureDBConnection } from "./middleware/dbMiddleware";

import db, { connectDB } from "./config/db/db";




const app = Express();


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

app.use(cors({
  origin:"https://turbo-frontend-kappa.vercel.app", 
  credentials: true, 
}));
app.use(Express.json());
app.use(helmet())



// Root route for testing
app.get('/', (req, res) => {
  res.json({ 
    message: 'Turbo Backend API is running!',
    endpoints: {
      turbos: '/api/turbos',
      stats: '/api/turbos/stats',
      auth: '/api/auth/login'
    }
  });
});

app.use('/api', ensureDBConnection, routes)

// Initialize database connection
const initializeApp = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log("⚡️[server]: Database connected and server ready");
  } catch (error) {
    console.error('Failed to initialize app:', error);
    throw error;
  }
};

// Initialize the app
initializeApp();

// Export the Express app for Vercel serverless functions
export default app;
