import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  deleteUserAccount
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// User routes
router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);
router.delete('/account', deleteUserAccount);

export default router;
