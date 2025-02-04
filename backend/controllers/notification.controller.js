// models
import User from '../models/user.model.js';
import Notification from '../models/notification.model.js';
import Post from '../models/post.model.js';


//  @desc       Get notifications
//  @route      GET /api/notifications
//  @access     Public 
export const getNotifications = async (req, res) => {

    try {
        const userId = req.user._id;    // get user id from request

        // get the list of notifications TO the user, and also populate the user name + profile image of the sender of the notification. 
        const notifications = await Notification.find({ to: userId })
        .populate({
            "path": "from",
            select: "username profileImg"
        });

        // after fetching, the notifications are updated to be read
        await Notification.updateMany({ to: userId}, { read: true });

        res.status(200).json(notifications);

    } catch (error) {
        console.log("Error in getNotifications controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}


//  @desc       Delete notifications
//  @route      DELETE /api/notifications
//  @access     Public 
export const deleteNotifications = async (req, res) => {

    try {
        const userId = req.user._id;    // get user id from request

        await Notification.deleteMany( { to: userId }); // delete notifications sent to the user

        res.status(200).json( { message: "Notifications deleted successfully "});

    } catch (error) {
        console.log("Error in deleteNotifications controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}


//  @desc       Delete the specified notification
//  @route      DELETE /api/notifications/:id
//  @access     Public 
export const deleteNotification = async (req, res) => {

    try {
        const notificationId = req.params.id;   // get the notification id to delete from parameter

        const userId = req.user._id;    // get user id from request

        // check if notification exists
        const notification = await Notification.findById(notificationId);

        if(!notification){
            return res.status(404).json({ error: "Notification not found" });
        }

        if(notification.to.toString() !== userId.toString()) {
            return res.status(403).json({ error: "You are not allowed to delete this notification" });
        }

        await Notification.findByIdAndDelete(notificationId); // delete notification

        res.status(200).json( { message: "Notification deleted successfully "});

    } catch (error) {
        console.log("Error in deleteNotification controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}
