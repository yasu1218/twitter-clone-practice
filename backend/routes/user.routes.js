import express from 'express';
// import the controller
import { getUserProfile, followUnfollowUser, getSuggestedUsers, updateUser } from '../controllers/user.controller.js';
import { protectRoute } from '../middleware/protectRoute.js';
// Use routers
const router = express.Router();

// List up any middleware

// List up the routers for auth
router.get("/profile/:username", protectRoute, getUserProfile); // get profile for username
router.get("/suggested", protectRoute, getSuggestedUsers);
router.post("/follow/:id", protectRoute, followUnfollowUser);
router.post("/update", protectRoute, updateUser);

// Export router for auth
export default router;
