const db = require("../models/index");
require("dotenv").config();

const notificationModel = db.notificationModel;
const dayjs = require('dayjs');
const relativeTime = require('dayjs/plugin/relativeTime');

// Extend dayjs with the relativeTime plugin
dayjs.extend(relativeTime);

exports.getNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const notifications = await notificationModel.findAll({
            where: { userId: id },
            order: [['createdAt', 'DESC']],
            limit: 10
        });

        // Map through the notifications and add the time difference
        const notificationsWithTime = notifications.map(notification => {
            const timeDifference = dayjs(notification.createdAt).fromNow(); // '2 hours ago'
            return {
                ...notification.toJSON(),
                timeAgo: timeDifference
            };
        });

        res.status(200).json({
            status: "success",
            data: notificationsWithTime,
        });
    } catch (error) {
        res.status(400).json({
            status: "fail",
            message: error.message,
        });
    }
}


// exports.getNotification = async (req, res) => {
// try {
//     const { id } = req.params;
//     const notification = await notificationModel.findAll({
//         where: { userId: id },
//         order: [['createdAt', 'DESC']] ,
//         limit: 10 
//       });
      
//     res.status(200).json({
//     status: "success",
//     data: notification,
//     });
// } catch (error) {
//     res.status(400).json({
//     status: "fail",
//     message: error.message,
//     });
// }
// }
exports.getNotificationAll = async (req, res) => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const offset = (page - 1) * limit;

        const notifications = await notificationModel.findAndCountAll({
            where: { userId: id },
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),  // Limit the number of results
            offset: offset,           // Skip past results for pagination
        });

        // Map through the notifications and add the time difference
        const notificationsWithTime = notifications.rows.map(notification => {
            const timeDifference = dayjs(notification.createdAt).fromNow(); // '2 hours ago'
            return {
                ...notification.toJSON(),
                timeAgo: timeDifference
            };
        });

        res.status(200).json({
            status: "success",
            data: notificationsWithTime,
            totalItems: notifications.count,
            currentPage: parseInt(page),
            totalPages: Math.ceil(notifications.count / limit),
        });
    } catch (error) {
        res.status(400).json({
            status: "fail",
            message: error.message,
        });
    }
}

// exports.getNotificationAll = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const { page = 1, limit = 10 } = req.query;

//         const offset = (page - 1) * limit;

//         const notifications = await notificationModel.findAndCountAll({
//             where: { userId: id },
//             order: [['createdAt', 'DESC']],
//             limit: parseInt(limit),  // Limit the number of results
//             offset: offset,           // Skip past results for pagination
//         });

//         res.status(200).json({
//             status: "success",
//             data: notifications.rows,
//             totalItems: notifications.count,
//             currentPage: parseInt(page),
//             totalPages: Math.ceil(notifications.count / limit),
//         });
//     } catch (error) {
//         res.status(400).json({
//             status: "fail",
//             message: error.message,
//         });
//     }
// }

exports.readNotification = async (req, res) => {
    try {
        const { id } = req.params; // User ID from route parameters
        const { textId } = req.body; // Notification ID from request body
        
        console.log(`User ID: ${id}, Notification ID: ${textId}`);

        const [updatedRows] = await notificationModel.update(
            { read: 1 },               // The values to update
            { 
                where: { 
                    userId: id, 
                    id: textId // Filter to update only the specific notification
                } 
            }
        );

        res.status(200).json({
            status: "success",
            updatedRows,   // Number of rows updated
        });
    } catch (error) {
        res.status(400).json({
            status: "fail",
            message: error.message,
        });
    }
}

exports.readAllNotification = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(id);
        

        const notifications = await notificationModel.update(
            { read: 1 },               // The values to update
            { where: { userId: id } }     // The condition to match the rows to be updated
        );

        res.status(200).json({
            status: "success",
            updatedRows: notifications,   // Optional: you can return the number of rows updated
        });
    } catch (error) {
        res.status(400).json({
            status: "fail",
            message: error.message,
        });
    }
}
exports.unreadNotification = async (req, res) => {
    try {
        const { id } = req.params;

        // Assuming you have a Notification model and an isRead field
        const unreadNotifications = await notificationModel.findAll({where : { userId: id, read: 0 }});

        // Send the length of unreadNotifications
        res.status(200).json({
            status: "success",
            unreadCount: unreadNotifications.length
        });
    } catch (error) {
        res.status(400).json({
            status: "fail",
            message: error.message,
        });
    }
};
