// packages
import bcrypt from 'bcryptjs';
import {v2 as cloudinary} from 'cloudinary';

// models
import User from '../models/user.model.js';
import Notification from '../models/notification.model.js';


//  @desc       Get user profile (username, full name, member since, followers, etc.,)
//  @route      GET /api/users/profile/:username
//  @access     Public 
export const getUserProfile = async (req, res) => {

    const {username} = req.params;  // get the username from parameter;

    try {
        const user = await User.findOne({username}).select("-password");
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json(user);

    } catch (error) {
        console.log("Error in getUserProfile: ", error.message);
        res.status(500).json({ error: error.message });
    }
}


//  @desc       Follow or unfollow user by the id 
//  @route      POST /api/users/follow/:id
//  @access     Public 
export const followUnfollowUser = async (req, res) => {
    
    try {

        const {id} = req.params;  // get the id from parameter;
        const userToModify = await User.findById(id);   // find user to follow/unfollow by the id
        const currentUser = await User.findById(req.user._id);  // find current user from the request

        // validation: you cannot follow / unfollow yourself. 
        if (id === req.user._id.toString()) {
            return res.status(400).json({ error: "You cannot follow/unfollow yourself" });
        }

        // validation: ensure both users exist
        if ( !userToModify || !currentUser ) {
            return res.status(400).json({ error: "User not found" });
        }

        const isFollowing = currentUser.following.includes(id); // check if current user is following the other user

        if (isFollowing) {
            // if following, then unfollow the user.
            //  pull current user's id from the other user's array of followers. 
            await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
            //  pull current the other user's id from the current user's array of 'following'. 
            await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });
            // no notification, return. 
            // TODO: return the id of the user as a response.
            res.status(200).json({ message: "User unfollowed successfully" });

        } else {
            // otherwise start following the user. 
            //  push current user's id to the other user's array of followers. 
            await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
            //  push current the other user's id to the current user's array of 'following'. 
            await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });
            // send a notification to user
            const newNotification = new Notification({
                type: 'follow',
                from: req.user._id,
                to: userToModify._id,
            });
            await newNotification.save();   // register in database
            // TODO: return the id of the user as a response.
            res.status(200).json({ message: "User followed successfully" });
        }


    } catch (error) {
        console.log("Error in followUnfollowUser: ", error.message);
        res.status(500).json({ error: error.message });
    }
}


//  @desc       Get suggested users (not the current user, or users already followed by current user)
//  @route      GET /api/users/suggested
//  @access     Public 
export const getSuggestedUsers = async (req, res) => {

    try {
        const userId = req.user._id;    // current user's id from req

        const usersFollowedByMe = await User.findById(userId).select("following");  // get list of currently following users

        // get 10 users other than the current user. 
        // ne - not equal
        const users = await User.aggregate([
            {
                $match: {
                    _id: {$ne: userId },
                },
            },
            {$sample: { size: 10 } },
        ]);

        const filteredUsers = users.filter(user=>!usersFollowedByMe.following.includes(user._id));  // filter out users already following
        const suggestedUsers = filteredUsers.slice(0,4);    // take 4 out of the filtered results. Here, assumption is that at least 4 out of 10 users picked up are not followed yet. 

        suggestedUsers.forEach((user) => (user.password = null));   // remove password information

        res.status(200).json(suggestedUsers);

    } catch (error) {
        console.log("Error in getSuggestedUsers: ", error.message);
        res.status(500).json({ error: error.message });
    }
};


//  @desc       Update user profile (full name, email, username, password, bio, link, profile/cover image)
//  @route      POST /api/users/update
//  @access     Public 
export const updateUser = async (req, res) => {

    const {fullName, email, username, currentPassword, newPassword, bio, link} = req.body;  // get values from request body. 
    let {profileImg, coverImg} = req.body;  // also get images from request body. These will be handled separately later. 

    const userId = req.user._id;    // get user id from the request

    try {
        let user = await User.findById(userId);
        if(!user) return res.status(404).json({ message: "User not found" });

        // validate that both passwords are entered - only if either one is entered. (if both are empty, then we are simply updating the other profile info)
        if((!newPassword && currentPassword) || (!currentPassword && newPassword)) {
            return res.status(400).json({ error: "Please provide both current password and new password" });
        }

        if(currentPassword && newPassword) {
            // Handle update of password if both current and new passwords are entered. 
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if(!isMatch) {
                return res.status(400).json({ error: "Current password is incorrect" });
            }
            if(newPassword.length < 6) {
                return res.status(400).json({ error: "Password must be at least 6 characters long" });
            }
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
        }

        if(profileImg) {
            // Handle update of profile image if provided
            if(user.profileImg) {
                // if an image already exists, then delete this first. 
                // cloudinary image url looks like: https://res.cloudinary.com/cloudname/image/upload/v1234/aaaaaaaa.png where 'aaaaaaaa' is the ID needed to delete.
                // to do this, we split the image url with "/", pop the last part, split by . and take the first part. 
                await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0]);
            }
            const uploadedResponse = await cloudinary.uploader.upload(profileImg);
            profileImg = uploadedResponse.secure_url;   // update profileImg with the secure url
        }

        if(coverImg) {
            // Handle update of cover image if provided
            if(user.coverImg) {
                await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0]);
            }
            const uploadedResponse = await cloudinary.uploader.upload(coverImg);
            coverImg = uploadedResponse.secure_url; // update coverImg with the secure url
        }

        // update the user's data with input from request if it is available, otherwise keep data
        user.fullName = fullName || user.fullName;
        user.email = email || user.email;
        user.username = username || user.username;
        user.bio = bio || user.bio;
        user.link = link || user.link;
        user.profileImg = profileImg || user.profileImg;
        user.coverImg = coverImg || user.coverImg;

        user = await user.save();   // save data

        user.password = null;   // this is only for returning in the response.

        return res.status(200).json(user);

    } catch (error) {
        console.log("Error in updateUser: ", error.message);
        res.status(500).json({ error: error.message });
    }
}
