import { Router } from 'express';
import authRoutes from './authRoutes';
import turboRoutes from './turboRoutes';
import pendingOrderRoutes from './pendingOrderRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use( turboRoutes);
router.use(pendingOrderRoutes);

export default router;
