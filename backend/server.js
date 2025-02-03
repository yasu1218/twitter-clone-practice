import express from "express";  // run the boiler-plate express app 
import dotenv from "dotenv";    // enable use of .env file
import cookieParser from "cookie-parser";   // for parsing cookies

import authRoutes from "./routes/auth.routes.js";   // import routes
import connectMongoDB from './db/connectMongoDB.js';    // import for MongoDB connection

dotenv.config();    // get config from .env file

const app = express();  // define express app
const PORT = process.env.PORT || 5000;  // define port

app.use(express.json());    // use json middleware for parsing application/json
app.use(express.urlencoded({ extended: true }));    // use url encoding middleware to parse form data

app.use(cookieParser());    // use function to parse cookies

// use routes
app.use("/api/auth", authRoutes);   // route for authentication


// start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    // connect to MongoDB
    connectMongoDB();
});
