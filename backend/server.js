// import packages
import path from "path";    // path package (builtin node module)
import express from "express";  // run the boiler-plate express app 
import dotenv from "dotenv";    // enable use of .env file
import cookieParser from "cookie-parser";   // for parsing cookies
import {v2 as cloudinary} from "cloudinary";    // for cloudinary
// import routes
import authRoutes from "./routes/auth.route.js";   // import auth routes
import userRoutes from "./routes/user.route.js";   // import user routes
import postRoutes from "./routes/post.route.js";   // import post routes
import notificationRoutes from "./routes/notification.route.js";   // import notification routes

// import utility functions
import connectMongoDB from './db/connectMongoDB.js';    // import for MongoDB connection


dotenv.config();    // get config from .env file

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();  // define express app
const PORT = process.env.PORT || 5000;  // define port
const __dirname = path.resolve(path.dirname(""));

// use json middleware for parsing application/json. 
//      added option to handle up to 5mb for img files (default=100kb?) 
//      note: making this too large will make the service prone to DoS attacks!
app.use(express.json({limit:"5mb"}));    

app.use(express.urlencoded({ extended: true }));    // use url encoding middleware to parse form data

app.use(cookieParser());    // use function to parse cookies

// use routes
app.use("/api/auth", authRoutes);   // route for authentication
app.use("/api/users", userRoutes);  // route for user
app.use("/api/posts", postRoutes);  // route for post
app.use("/api/notifications", notificationRoutes);  // route for notifications

// set path for frontend access
if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "/frontend/dist")));    // for production, user should be directed to the frontend dist folder that gets built
    
    // if this is the production environment, and if none of the endpoints defined earlier gets hit, then show the react application
    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html")); 
    })
}

// start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    // connect to MongoDB
    connectMongoDB();
});
