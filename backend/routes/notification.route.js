import express from 'express';
// import the controller
import { getNotifications, deleteNotifications, deleteNotification } from '../controllers/notification.controller.js';
// import middleware
import { protectRoute } from '../middleware/protectRoute.js';

// Use routers
const router = express.Router();

// List up the routers
router.get("/", protectRoute, getNotifications);        // get notifications
router.delete("/", protectRoute, deleteNotifications);  // delete notifications
router.delete("/:id", protectRoute, deleteNotification);  // delete the specified notification

// Export router
export default router;
