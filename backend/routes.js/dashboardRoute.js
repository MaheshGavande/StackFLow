import {Router} from 'express';
import {authMiddleware } from '../middleware/authMiddleware.js';
import { getDashboard } from '../controllers/dashboardController.js';

const dashboardRouter = Router();

dashboardRouter.get('/', authMiddleware, getDashboard);

export default dashboardRouter;