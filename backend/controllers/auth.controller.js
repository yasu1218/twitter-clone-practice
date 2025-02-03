import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import { generateTokenAndSetCookie } from '../lib/utils/generateToken.js';


//  @desc       Register new user with username, fullName, email and password
//  @route      POST /api/auth/signup
//  @access     Public 
export const signup = async (req, res) => {

    try {
        
        const {fullName, username, email, password} = req.body; // Get input fields from the request body

        // Email validation: https://uibakery.io/regex-library/email
        //const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        //const emailRegex = /^\S+@\S+\.\S+$/;
        const emailRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "Invalid email format" });
        }

        // Check existing user
        const existingUser = await User.findOne({ username });
        if(existingUser) {
            return res.status(400).json({ error: "Username is already taken" });
        }

        // Check existing email
        const existingEmail = await User.findOne({ email });
        if(existingEmail) {
            return res.status(400).json({ error: "Email is already taken" });
        }

        // Check password length
        if (password.length < 6) {
            return res.status(400).json({ error: "Password must be at least 6 characters long" });
        }


        // Hash password with bcrypt. Most common salt value is 10. Larger values will take longer to process. 
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Create a new user based on the model. Only the password key requires a value pair. This can be omitted for others since the value name is the same as the key (e.g., fullName: fullName)
        const newUser = new User({
            fullName,
            username,
            email,
            password: hashedPassword,
        });

        // If successful, save token and return some of the user object content with status 201.
        if (newUser) {
            generateTokenAndSetCookie(newUser._id, res);
            await newUser.save();

            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                username: newUser.username,
                email: newUser.email,
                followers: newUser.followers,
                following: newUser.following,
                profileImg: newUser.profileImg,
                coverImg: newUser.coverImg,
            })
        } else {
            res.status(400).json({ error: "Invalid user data"});
        }

    } catch (error) {
        console.log("Error in signup controller", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

//  @desc       Login user with usrename and password
//  @route      POST /api/auth/login
//  @access     Public 
export const login = async (req, res) => {

    try {
        
        const {username, password} = req.body;  // get username and password from request body
        const user = await User.findOne({username});    // find user with given username
        const isPasswordCorrect = await bcrypt.compare(password, user?.password || ""); // compare password given with the password of user - if user is found

        // Reject if user is not found, or if password is incorrect.
        if(!user || !isPasswordCorrect) {
            return res.status(400).json({error: "Invalid username or password"});
        }

        generateTokenAndSetCookie(user._id, res);   // Set cookie

        res.status(200).json({
                _id: user._id,
                fullName: user.fullName,
                username: user.username,
                email: user.email,
                followers: user.followers,
                following: user.following,
                profileImg: user.profileImg,
                coverImg: user.coverImg,
        });

    } catch (error) {
        console.log("Error in login controller", error.message);
        res.status(500).json({ error: "Internal Server Error" });        
    }
}

//  @desc       Logout user by forcing the cookie to expire
//  @route      POST /api/auth/logout
//  @access     Public 
export const logout = async (req, res) => {
    try {
        res.cookie("jwt","",{maxAge:0});    // set cookie to expire immediately to destroy
        res.status(200).json({message: "Logged out successfully"});
    } catch (error) {
        console.log("Error in logout controller", error.message);
        res.status(500).json({ error: "Internal Server Error" });                
    }
}

//  @desc       Get 'my' user
//  @route      GET /api/auth/me
//  @access     Private
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        res.status(200).json(user);

    } catch (error) {
        console.log("Error in getMe controller", error.message);
        res.status(500).json({ error: "Internal Server Error" });                        
    }
}