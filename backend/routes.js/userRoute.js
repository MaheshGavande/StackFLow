import {Router} from 'express';
import{authMiddleware} from '../middleware/authMiddleware.js';
import {getProfile} from '../controllers/userController.js';

const userRouter = Router();

userRouter.get('/profile', authMiddleware, getProfile);

export default userRouter; 