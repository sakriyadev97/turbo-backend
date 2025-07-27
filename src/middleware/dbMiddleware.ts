import { Request, Response, NextFunction } from 'express';
import { connectDB } from '../config/db/db';

export const ensureDBConnection = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Ensure database is connected before proceeding
    await connectDB();
    next();
  } catch (error) {
    console.error('Database connection error in middleware:', error);
    return res.status(500).json({ 
      error: 'Database connection failed', 
      details: error 
    });
  }
}; 