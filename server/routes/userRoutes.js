import express from 'express';
import { auth } from '../middlewares/auth.js'; 
import { 
  getUserCreations, 
  getPublishedCreations, 
  toggleLikeCreations, 
  togglePublishCreation 
} from '../controllers/userController.js';

const userRouter = express.Router();

// 1. MAKE THIS PUBLIC: Remove 'auth' so the Community page can load for everyone
userRouter.get('/get-published-creations', getPublishedCreations);

// 2. KEEP THESE PROTECTED: These require a logged-in user
userRouter.get('/get-user-creations', auth, getUserCreations);
userRouter.post('/toggle-like-creations', auth, toggleLikeCreations);
userRouter.post('/toggle-publish', auth, togglePublishCreation); // Added auth back here for security

export default userRouter;