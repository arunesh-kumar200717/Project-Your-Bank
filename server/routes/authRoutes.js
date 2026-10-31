import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { employeeLogin, verifyOtp, finalizeLogin, refreshToken, logout, me } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

export const authRoutes = Router();

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false });
const verifyOtpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many OTP verification attempts. Please wait and request a new OTP.' }
});
const finalizeLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false
});
const refreshLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 40, standardHeaders: true, legacyHeaders: false });

authRoutes.post('/employee-login', loginLimiter, employeeLogin);
authRoutes.post('/verify-otp', verifyOtpLimiter, verifyOtp);
authRoutes.post('/finalize-login/:loginRequestId', finalizeLoginLimiter, finalizeLogin);
authRoutes.post('/refresh-token', refreshLimiter, refreshToken);
authRoutes.post('/logout', protect, logout);
authRoutes.get('/me', protect, me);
