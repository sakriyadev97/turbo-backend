import { Request, Response } from 'express';

// Static credentials
const STATIC_USERNAME = 'admin';
const STATIC_PASSWORD = 'password123';

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    if (username === STATIC_USERNAME && password === STATIC_PASSWORD) {
      return res.status(200).json({ 
        message: 'Login successful',
        user: { username: STATIC_USERNAME }
      });
    } else {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Server error', details: error });
  }
}; 