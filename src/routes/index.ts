import { Router } from 'express';
import authRoutes from './authRoutes';
import turboRoutes from './turboRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use( turboRoutes);

export default router;
