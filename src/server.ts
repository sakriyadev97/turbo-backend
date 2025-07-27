import Express from "express";
import { createServer } from "http";
import helmet from "helmet";
import routes from "./routes/index";
import cors from "cors";
import config from "./config";

import db from "./config/db/db";




const app = Express();
const httpServer = createServer(app);

app.use(cors({
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
      'http://localhost:3001',
      'https://turbo-frontend-kappa.vercel.app'
    ];
    
    if (config.app.allowedOrigin) {
      // Handle both single origin and comma-separated origins
      if (config.app.allowedOrigin.includes(',')) {
        allowedOrigins = config.app.allowedOrigin.split(',').map(o => o.trim());
      } else {
        // If it's just a port number, convert to full URL
        if (config.app.allowedOrigin.match(/^\d+$/)) {
          allowedOrigins = [`http://localhost:${config.app.allowedOrigin}`];
        } else {
          // Use the allowed origin from .env
          allowedOrigins = [config.app.allowedOrigin];
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
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
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

app.use('/api',routes)

// Database connection
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.on("close", function () {
  console.log("DB connection is closed");
});
db.once("open", function () {
  console.log("Connected to MongoDB database!!");
});

const port = config.app.port || 5000;
const host = config.app.host || "localhost";

httpServer.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://${host}:${port}`);
});
