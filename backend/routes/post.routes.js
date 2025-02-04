import express from 'express';

// import controller
import { createPost, deletePost, commentOnPost, likeUnlikePost, getAllPosts, getLikedPosts, getFollowingPosts, getUserPosts } from '../controllers/post.controller.js';

// import middleware
import { protectRoute } from '../middleware/protectRoute.js';

// Use routers
const router = express.Router();

// List up the routers for post
router.get("/all", protectRoute, getAllPosts);              // get all posts
router.get("/following", protectRoute, getFollowingPosts);  // get all posts by other users the user is following
router.get("/likes/:id", protectRoute, getLikedPosts);      // get all posts user likes
router.get("/user/:username", protectRoute, getUserPosts);  // get all posts by a specific user
router.post("/create", protectRoute, createPost);           // create a post
router.post("/like/:id", protectRoute, likeUnlikePost);     // like or unlike post
router.post("/comment/:id", protectRoute, commentOnPost);   // comment on post
router.delete("/:id", protectRoute, deletePost);            // delete a post

// Export router
export default router;
