import express from 'express';
import {
  register,
  login,
  refreshToken,
  getProfile,
  updateProfile,
  logout,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { registerRules, loginRules } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.post('/register', registerRules, register);
router.post('/login', loginRules, login);
router.post('/refresh', refreshToken);
router.post('/logout', protect, logout);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

export default router;
