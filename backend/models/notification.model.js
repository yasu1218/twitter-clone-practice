import mongoose from 'mongoose';

// Define schema for notification
const notificationSchema = new mongoose.Schema(
    {
        from:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        to:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        type:{
            type: String,
            required: true,
            enum: ['follow', 'like'],
        },
        read: {
            type: Boolean,
            default: false,
        },
    },{timestamps: true}
);


// Create model. Note! mongoose will make the entity plural (notifications)
const Notification = mongoose.model("Notification", notificationSchema);

// Export the model
export default Notification;
