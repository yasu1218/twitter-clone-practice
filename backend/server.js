// run the boiler-plate express app 
import express from "express";
// enable use of .env file
import dotenv from "dotenv";

// import routes
import authRoutes from "./routes/auth.routes.js";

// import for MongoDB connection
import connectMongoDB from './db/connectMongoDB.js';

// get config from .env file
dotenv.config();

// define express app
const app = express();
// define port
const PORT = process.env.PORT || 5000;

// use routes
app.use("/api/auth", authRoutes);


// start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    // connect to MongoDB
    connectMongoDB();
});
