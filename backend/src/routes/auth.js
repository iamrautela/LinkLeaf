import express from 'express';
import { 
  register, 
  login, 
  getMe, 
  updateProfile, 
  changePassword 
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { 
  validateUserRegistration, 
  validateUserLogin 
} from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.post('/register', validateUserRegistration, register);
router.post('/login', validateUserLogin, login);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

export default router;
