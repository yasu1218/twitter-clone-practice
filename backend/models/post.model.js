import mongoose from 'mongoose';

// Define schema for post
const postSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    text: {
        type: String,
    },
    img: {
        type: String,
    },
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    ],
    comments: [
        {
            text: {
                type: String,
                required: true,
            },
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true,
            },
        },
    ]
},{timestamps: true});


// Create model
const Post = mongoose.model("Post", postSchema);

// Export the post model
export default Post;