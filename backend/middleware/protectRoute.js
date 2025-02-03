/*  Middleware to get and decode token to check if user has been authenticated or not. */
import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';

export const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;  // get token from cookie
        if(!token) {
            return res.status(401).json({ error: "Unauthorized: No Token Provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);  // verify and decode token to get user id (the _id in MongoDB)

        if(!decoded) {
            return res.status(401).json({ error: "Unauthorized: Invalid Token" });
        }

        const user = await User.findById(decoded.userId).select("-password");   // get user from database except password

        if(!user) {
            return res.status(404).json({ error: "Usre not found" });
        }

        req.user = user;    // add user to the request object
        next(); 

    } catch (error) {
        console.log("Error in protectRoute middleware", error.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}