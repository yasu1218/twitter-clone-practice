// packages
import {v2 as cloudinary} from 'cloudinary';

// models
import User from '../models/user.model.js';
import Notification from '../models/notification.model.js';
import Post from '../models/post.model.js';


//  @desc       Create a post
//  @route      POST /api/posts/create
//  @access     Public 
export const createPost = async (req, res) => {

    try {
            const { text } = req.body;  // get text from req body. 
            let { img } = req.body;   // get img from req body. (this will be updated later so we use variable)
            const userId = req.user._id.toString(); // get current user id

            // check user
            const user = await User.findById(userId);
            if(!user) {
                return res.status(404).json( { error: "User not found" });
            }

            // check that there is something to post
            if(!text && !img) {
                return res.status(404).json( { error: "Post must have text or image" });
            }

            // if image is available, save it in cloudinary and get url
            if(img) {
                const uploadedResponse = await cloudinary.uploader.upload(img);
                img = uploadedResponse.secure_url;
            }

            // create new Post object
            const newPost = new Post({
                user: userId,
                text,
                img
            });

            // save and return post
            await newPost.save();
            res.status(201).json(newPost);

    } catch (error) {
        console.log("Error in createPost controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}


//  @desc       Like or unlike a post 
//  @route      POST /api/posts/like/:id
//  @access     Public 
export const likeUnlikePost = async (req, res) => {

    try {
        const userId = req.user._id;    // get user id
        const {id:postId} = req.params; // get post id, rename to postId for readability purpose. 

        // find post to comment on
        const post = await Post.findById(postId);
        if(!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        // check if post is already liked
        const userLikedPost = post.likes.includes(userId);

        if (userLikedPost) {
            // Unlike post if already liked
            await Post.updateOne({_id:postId}, {$pull: { likes: userId }}); // remove user id from the likes array of post
            await User.updateOne({_id:userId}, {$pull: { likedPosts: postId }});    // also remove post id from the 'liked posts' array of user
            res.status(200).json({ message: "Post unliked successfully" });
        } else {
            // Else like post + send notification
            post.likes.push(userId);    // add user id to the likes array of post
            await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });   // add post id to the 'liked posts' array of user
            await post.save();

            const notification = new Notification({
                from: userId, 
                to: post.user,
                type: 'like',
            });
            await notification.save();

            res.status(200).json({ message: "Post liked successfully" });
        }

   } catch (error) {
        console.log("Error in likeUnlikePost controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}


//  @desc       Comment on a post
//  @route      POST /api/posts/comment/:id
//  @access     Public 
export const commentOnPost = async (req, res) => {

    try {
        const { text } = req.body;  // get comment on the post from request
        const postId = req.params.id;   // get post id from parameter
        const userId = req.user._id;    // get user's id from req

        // check that comment is available
        if(!text) {
            return res.status(400).json({ error: "Text field is required" });
        }

        // find post to comment on
        const post = await Post.findById(postId);
        if(!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        // create comment object to add to post
        const comment = { user: userId, text };

        // push to post
        post.comments.push(comment);
        await post.save();

        res.status(200).json(post);

   } catch (error) {
        console.log("Error in commentOnPost controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}


//  @desc       Delete a post
//  @route      DELETE /api/posts/:id
//  @access     Public 
export const deletePost = async (req, res) => {

    try {
        // find post by the id (input given in parameter)
        const post = await Post.findById(req.params.id);

        // check that post exists
        if(!post) {
            return res.status(404).json({ error: "Post not found"});
        }

        // check that the post belongs to user
        if(post.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ error: "You are not authorized to delete this post"});
        }

        // delete images, if any
        if(post.img) {
            const imgId = post.img.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(imgId);
        }

        // delete post
        await Post.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: "Post deleted successfully" });

    } catch (error) {
        console.log("Error in deletePost controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}


//  @desc       Get all posts
//  @route      GET /api/posts/all
//  @access     Public 
export const getAllPosts = async (req, res) => {

    try {
        // get all posts with latest ones first. Also populate user based on the userid in the post except password.
        const posts = await Post.find().sort({ createdAt: -1 }).populate({
            path: "user",
            select: "-password",
        })
        .populate({
            path: "comments.user",
            select: "-password",
        });

        if( posts.length === 0) {
            return res.status(200).json([]);
        }

        res.status(200).json(posts);

   } catch (error) {
        console.log("Error in getAllPosts controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}


//  @desc       Get all liked posts
//  @route      GET /api/posts/likes/:id
//  @access     Public 
export const getLikedPosts = async (req, res) => {

    const userId = req.params.id;   // get user id from params

    try {

        // verify user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // get all the posts liked by user
        const likedPosts = await Post.find({_id: {$in: user.likedPosts}})
        .populate({
            path: "user",
            select: "-password",
        })
        .populate({
            path: "comments.user",
            select: "-password",
        });

        if( likedPosts.length === 0) {
            return res.status(200).json([]);
        }

        res.status(200).json(likedPosts);

   } catch (error) {
        console.log("Error in getLikedPosts controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}


//  @desc       Get following posts
//  @route      GET /api/posts/following
//  @access     Public 
export const getFollowingPosts = async (req, res) => {

    try {
        const userId = req.user._id;
        const user = await User.findById(userId);
        if(!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const following = user.following;

        const feedPosts = await Post.find({ user: { $in: following } })
        .sort({ createdAt: -1 })
        .populate({
            path: "user",
            select: "-password",
        })
        .populate({
            path: "comments.user",
            select: "-password",
        });

        if( feedPosts.length === 0) {
            return res.status(200).json([]);
        }

        res.status(200).json(feedPosts);

   } catch (error) {
        console.log("Error in getFollowingPosts controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}


//  @desc       Get user posts
//  @route      GET /api/posts/user/:username
//  @access     Public 
export const getUserPosts = async (req, res) => {

    try {
        const { username } = req.params;
        const user = await User.findOne({ username });
        if(!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const userPosts = await Post.find({ user: user._id })
        .sort({ createdAt: -1 })
        .populate({
            path: "user",
            select: "-password",
        })
        .populate({
            path: "comments.user",
            select: "-password",
        });

        if( userPosts.length === 0) {
            return res.status(200).json([]);
        }

        res.status(200).json(userPosts);

   } catch (error) {
        console.log("Error in getUserPosts controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}
