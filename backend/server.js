// import packages
import express from "express";  // run the boiler-plate express app 
import dotenv from "dotenv";    // enable use of .env file
import cookieParser from "cookie-parser";   // for parsing cookies
import {v2 as cloudinary} from "cloudinary";    // for cloudinary
// import routes
import authRoutes from "./routes/auth.route.js";   // import auth routes
import userRoutes from "./routes/user.route.js";   // import user routes
import postRoutes from "./routes/post.route.js";   // import post routes

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

app.use(express.json());    // use json middleware for parsing application/json
app.use(express.urlencoded({ extended: true }));    // use url encoding middleware to parse form data

app.use(cookieParser());    // use function to parse cookies

// use routes
app.use("/api/auth", authRoutes);   // route for authentication
app.use("/api/users", userRoutes);  // route for user
app.use("/api/posts", postRoutes);  // route for post

// start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    // connect to MongoDB
    connectMongoDB();
});
