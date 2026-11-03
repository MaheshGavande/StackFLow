import {Router} from 'express';
import {authMiddleware} from '../middleware/authMiddleware.js';
import { getSettings, updateSettings } from '../controllers/settingsController.js';

const settingsRouter = Router();

settingsRouter.get('/', authMiddleware, getSettings);
settingsRouter.put('/', authMiddleware, updateSettings);

export default settingsRouter;
