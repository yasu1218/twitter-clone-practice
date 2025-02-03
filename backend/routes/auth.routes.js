import express from 'express';
// import the controller
import { signup, login, logout, getMe } from '../controllers/auth.controller.js';
import { protectRoute } from '../middleware/protectRoute.js';

// Use routers
const router = express.Router();

// List up any middleware

// List up the routers for auth
router.get("/me", protectRoute, getMe);
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

// Export router for auth
export default router;
