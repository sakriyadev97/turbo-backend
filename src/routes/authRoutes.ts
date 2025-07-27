import { Router } from 'express';
import { login } from '../controller/authController';

const authRouter = Router();

// Route to login
authRouter.post('/login', login);

export default authRouter; 