import { Router } from 'express';
import authRoutes from './authRoutes';
import turboRoutes from './turboRoutes';
import pendingOrderRoutes from './pendingOrderRoutes';
import emailRoutes from './emailRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use( turboRoutes);
router.use(pendingOrderRoutes);
router.use('/email', emailRoutes);

export default router;
