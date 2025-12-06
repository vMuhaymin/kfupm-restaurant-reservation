/**
 * Authentication routes
 * 
 * What this file does:
 * - Defines authentication API endpoints
 * - Handles user registration, login, and password reset flow
 * 
 * API Endpoints:
 * - POST /api/auth/register - Register new student account
 * - POST /api/auth/login - User login
 * - POST /api/auth/reset - Request password reset code
 * - POST /api/auth/verify - Verify reset code
 * - POST /api/auth/change-password - Change password with reset code
 * 
 * Frontend components using these endpoints:
 * - src/pages/Login.tsx - Uses login endpoint
 * - src/pages/SignUp.tsx - Uses register endpoint
 * - src/pages/ForgotPassword.tsx - Uses reset endpoint
 * - src/pages/CheckEmail.tsx - Uses verify and reset endpoints
 * - src/pages/SetNewPassword.tsx - Uses change-password endpoint
 */
import express from 'express';
import {
  register,
  login,
  requestReset,
  verifyCode,
  changePassword
} from '../controllers/authController.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/reset', requestReset);
router.post('/verify', verifyCode);
router.post('/change-password', changePassword);

export default router;

