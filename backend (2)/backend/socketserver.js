const express = require("express");
const http = require("http");
const cors = require("cors");
const { PeerServer } = require('peer');
const bodyParser = require('body-parser');
const socketIO = require("socket.io");
const { chatModel, adminModel , groupUserChatting } = require("./models");
const {notificationModel} = require("./models");
const fs = require('fs');
const path = require('path');
const sendMail = require("./middlewares/Sendemail");
const multer = require("./middlewares/Mediaproject");

const saveFile = require("./middlewares/Chatmedia");
const { where } = require("sequelize");
require('dotenv').config();

const app = express();
const server = http.createServer(app);


// CORS options
const corsOptions = {
    origin: '*',  // Specify your origin or use an array of allowed origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'token'],
    credentials: true
};

// Middleware to handle CORS
app.use(cors(corsOptions));
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');  // Specify your origin or use an array of allowed origins
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, token');
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
});


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors(corsOptions));
// app.use('/uploads', express.static('uploads'));
// 
// Serve static files from the 'uploads' directory
app.use('/backend', express.static('backend'));
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



// Socket.IO setup with CORS options
const io = socketIO(server, {
    cors: corsOptions,
});

const saveMessageToDatabase = async (msg) => {
  try {
      const data = await chatModel.create({
          fromId: msg.fromId,
          toId: msg.toId,
          text: msg.text || null,
          file: msg.file,
          time: new Date(),
          seen: 0
      });
      console.log('Message saved to database:', data);
      return data;
  } catch (error) {
      console.error('Error saving message to database:', error);
      throw error;
  }
};


const saveGroupMessageToDatabase = async (msg) => {
    try {
      
        const data = await groupUserChatting.create({
            fromId: msg.fromId,
            groupId: msg.toId,
            text: msg.text || null,
            time: new Date(),
            seen: []
        });
        console.log('Message saved to database:', data);
        return data;
    } catch (error) {
        console.error('Error saving message to database:', error);
        throw error;
    }
  };
  const updateGcMessageStatusInDatabase = async ({ fromId, groupId }) => {
    try {
        // Step 1: Fetch all messages for the given groupId
        const messages = await groupUserChatting.findAll({
            where: { groupId: groupId },
            attributes: ['id', 'seen'],
            order: [['id', 'ASC']] // Order messages by ID ascending (or timestamp if available)
        });

        if (messages.length === 0) {
            console.log('No messages found for the given groupId.');
            return 0;
        }

        // Update all messages to include 'fromId' in the 'seen' array
        for (const message of messages) {
            let seenArray = message.seen || [];
            if (!seenArray.includes(fromId)) {
                seenArray.push(fromId);
                await groupUserChatting.update(
                    { seen: seenArray },
                    { where: { id: message.id } }
                );
            }
        }

        console.log('Message statuses updated in the database.');
        return messages.length;
    } catch (error) {
        console.error('Error updating message statuses in the database:', error);
        throw error;
    }
};

//   const updateGcMessageStatusInDatabase = async ({ fromId, groupId }) => {
//     try {
//         // Step 1: Fetch all messages for the given groupId
//         const messages = await groupUserChatting.findAll({
//             where: { groupId: groupId },
//             attributes: ['id', 'seen'],
//             order: [['id', 'ASC']] // Order messages by ID ascending (or timestamp if available)
//         });

//         if (messages.length === 0) {
//             console.log('No messages found for the given groupId.');
//             return 0;
//         }

//         // Identify the latest message
//         const latestMessage = messages[messages.length - 1];

//         // Prepare update operations
//         const updatePromises = messages.map(async (message) => {
//             let seenArray = message.seen || [];

//             if (message.id === latestMessage.id) {
//                 // Update the latest message to include 'fromId' in the 'seen' array
//                 if (!seenArray.includes(fromId)) {
//                     seenArray.push(fromId);
//                     await groupUserChatting.update(
//                         { seen: seenArray },
//                         { where: { id: message.id } }
//                     );
//                 }
//             } else {
//                 // Remove 'fromId' from the 'seen' array of previous messages
//                 if (seenArray.includes(fromId)) {
//                     seenArray = seenArray.filter(id => id !== fromId);
//                     await groupUserChatting.update(
//                         { seen: seenArray },
//                         { where: { id: message.id } }
//                     );
//                 }
//             }
//         });

//         // Execute all update operations
//         await Promise.all(updatePromises);

//         console.log('Message statuses updated in the database.');
//         return messages.length;
//     } catch (error) {
//         console.error('Error updating message statuses in the database:', error);
//         throw error;
//     }
// };


// const updateGcMessageStatusInDatabase = async ({ fromId, groupId }) => {
//     try {
//         // Step 1: Fetch the current 'seen' array
//         const message = await groupUserChatting.findOne({
//             where: { groupId: groupId },
//             attributes: ['seen']
//         });

//         if (!message) {
//             console.log('No message found to update.');
//             return 0;
//         }

//         let seenArray = message.seen || [];

//         // Step 2: Check if fromId is already in the array
//         if (!seenArray.includes(fromId)) {
//             seenArray.push(fromId); // Add fromId to the array
//         }

//         // Step 3: Update the 'seen' array in the database
//         const [updatedCount] = await groupUserChatting.update(
//             { seen: seenArray },
//             { where: { groupId: groupId } }
//         );

//         if (updatedCount === 0) {
//             console.log('No message found to update.');
//         } else {
//             console.log('Message status updated in database.');
//         }

//         return updatedCount;
//     } catch (error) {
//         console.error('Error updating message status in database:', error);
//         throw error;
//     }
// };


  
const updateMessageStatusInDatabase = async (msg) => {
    try {
      const [updatedCount] = await chatModel.update(
        { seen: 1 },
        {
          where: {
            fromId: msg.fromId,
            toId: msg.toId,
          },
        }
      );
  
      if (updatedCount === 0) {
        console.log('No message found to update.');
      } else {
        console.log('Message status updated in database.');
      }
  
      return updatedCount;
    } catch (error) {
      console.error('Error updating message status in database:', error);
      throw error;
    }
  };
  
  
  
const saveNotificationToDatabase = async (notify) => {
  try {
      const data = await notificationModel.create({
          text: notify.text || null,
          time: notify.time || null,
          date: notify.time || null,
          userId: notify.userId ,
          route: notify.route || null
      });
      console.log('Notification saved to database:', data);
      return data;
  } catch (error) {
      console.error('Error saving notification to database:', error);
      throw error;
  }
};


  
const users = new Map(); // Using a Map to store user data with socket IDs as keys
// Example function to get socket IDs by user IDs

let messageId
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    const broadcastAllUsers = () => {
        io.emit('allusers', Array.from(users.values()));
    };
    

    // const emitActiveUserParams = (id, paramsId) => {
    //     const paramsActiveUser = Array.from(users.values()).filter(id === paramsId);
    //     if (paramsActiveUser.length > 0) {
    //         socket.emit('activeUserParams', { status: 1, user: paramsActiveUser[0] });
    //         console.log("Active user updated:", paramsActiveUser[0]);
    //     } else {
    //         socket.emit('activeUserParams', { status: 0 });
    //         console.log("No active user found for user.paramsId:");
    //     }
    // };

    // Handle when the active user ID is received
    socket.on('receiveActiveId', (id) => {
        try {
            // console.log('Id of logged-in user:', id);

            // Remove existing entry for the user, if any
            for (const [key, user] of users.entries()) {
                if (user.id === id) {
                    users.delete(key);
                    break; // Exit loop early since we've found the user
                }
            }

            // Add the new entry for the user
            users.set(socket.id, { id, socketId: socket.id });

            broadcastAllUsers();

            // console.log('Current users:', Array.from(users.values()));
            
        } catch (error) {
            console.error('Error handling receiveActiveId:', error);
        }
    });
    

    // Handle when paramsId is received
    socket.on('paramsId', (paramsId) => {
        try {
            // console.log('Received paramsId:', paramsId);
            // Store paramsId with the user's socket ID
            if (users.has(socket.id)) {
                users.get(socket.id).paramsId = paramsId;
                
                // emitActiveUserParams(id, null);
            }
        } catch (error) {
            console.error('Error handling paramsId:', error);
        }
    });

    // Handle sending messages
    socket.on('sendMsg', async (msg, callback) => {
        // console.log('Message received:', msg);

        try {
            // Retrieve paramsId for the sender
            console.log(msg);
            
            const sender = users.get(socket.id);
            if (!sender) {
                // console.log('Sender not found in users map.');
                if (callback) {
                    return callback({ status: 'error', msg: 'Sender not found' });
                }
            }

             // Save the message to the database
            const data = await saveMessageToDatabase(msg);
            messageId = data.id;
            const paramsId = sender ? sender.paramsId : null;

            // Find the recipient's socket
            const recipient = Array.from(users.values()).find(user => user.id === msg.toId && user.paramsId !== paramsId);

            console.log("MEssafe Id" , messageId);
            
            if (recipient) {
                io.to(recipient.socketId).emit('receiveMsg', msg ,messageId);
                // console.log('Message sent to recipient:', recipient.socketId);
            } else {
                console.log('Recipient not found');
            }

            // Send the message to the sender as well
            if (sender) {
                io.to(sender.socketId).emit('receiveMsg', msg ,messageId);
                // console.log('Message sent to sender:', sender.socketId);
            } else {
                console.log('Sender not found when trying to send the message back.');
            }

           
            // console.log('Message saved to database:', data);

            // Acknowledge receipt of the message
            if (callback) {
                callback({ status: 'ok', msg: 'Message sent' });
            }
        } catch (error) {
            console.error('Error handling sendMsg:', error);
            if (callback) {
                callback({ status: 'error', msg: 'Failed to send message' });
            }
        }
    });

    socket.on('typing', (typing, callback) => {
        const sender = users.get(socket.id);
        if (!sender) {
            // console.log('Typing sender not found in users map.');
            if (callback) {
                return callback({ status: 'error', typing: 'Sender not found' });
            }
        }

        const paramsId = sender ? sender.paramsId : null;

        // Find the recipient's socket
        const recipient = Array.from(users.values()).find(user => user.id === typing.toId && user.paramsId !== paramsId);

        if (recipient) {
            io.to(recipient.socketId).emit('receiveTyping', typing);
            console.log('Typing sent to recipient:', recipient.socketId);
        } else {
            console.log('Typing recipient not found');
        }

        // Send an acknowledgment back to the client
        if (typeof callback === 'function') {
            callback({ status: 'ok', msg: 'Typing event received' });
        }
    });


  
    socket.on('seenMessages', async (data, callback) => {
        console.log("Seen messages: ", data);
        const sender = users.get(socket.id);
        if (!sender) {
          if (callback) {
            return callback({ status: 'error', typing: 'Sender not found' });
          }
        }
    
        const paramsId = sender ? sender.paramsId : null;
        console.log("paramsId", paramsId);
    
        const recipient = Array.from(users.values()).find(user => user.id === data.fromId && user.paramsId !== paramsId);
    
        if (recipient) {
          io.to(recipient.socketId).emit('receiveSeenMessage', data);
          await updateMessageStatusInDatabase(data);
          console.log('Message sent to recipient:', recipient.socketId);
        } else {
          console.log('Message recipient not found');
        }
    
        if (typeof callback === 'function') {
          callback({ status: 'ok', msg: 'Message event received' });
        }
      });
    
      socket.on('sendLeaveChat', async (data) => {
        console.log("sendLeaveChat: ", data);
        socket.broadcast.emit('receiveLeaveChat', data);
      });   

    // socket.on('seenMessages', async (data, callback) => {
    //     console.log("Seen messages: ", data);
    //     const sender = users.get(socket.id);
    //     if (!sender) {
    //         // console.log('Typing sender not found in users map.');
    //         if (callback) {
    //             return callback({ status: 'error', typing: 'Sender not found' });
    //         }
    //     }


    //     // io.emit('recieveSeenMessage', data );


    //     // const messageId = data.messageId;
        
    //     const paramsId = sender ? sender.paramsId : null;
    //     console.log("paramsId", paramsId);
        

    //     // Find the recipient's socket
    //     const recipient = Array.from(users.values()).find(user => user.id === data.fromId && user.paramsId !== paramsId);

    //     if (recipient) {

    //         io.to(recipient.socketId).emit('recieveSeenMessage', data );
    //         await updateMessageStatusInDatabase(data);

    //         console.log('Messege sent to recipient:', recipient.socketId);
    //     } else {
    //         console.log('Message recipient not found');
    //     }

    //     // Send an acknowledgment back to the client
    //     if (typeof callback === 'function') {
    //         callback({ status: 'ok', msg: 'Message event received' });
    //     }  
    // })

    // socket.on('sendLeaveChat', async (data) => {
    //     console.log("sendLeaveChat: ", data);
    //     socket.broadcast.emit('receiveLeaveChat', data);
    // });
    

    // socket.on('notSeen' , async (data, callback) => {
    //     console.log("Not Seen messages: ", data);
    //     const sender = users.get(socket.id);
    //     if (!sender) {
    //         // console.log('Typing sender not found in users map.');
    //         if (callback) {
    //             return callback({ status: 'error', typing: 'Sender not found' });
    //         }
    //     }

    //     const paramsId = sender ? sender.paramsId : null;
    //     console.log("paramsId", paramsId);
        

    //     // Find the recipient's socket
    //     const recipient = Array.from(users.values()).find(user => user.id === data.fromId && user.paramsId !== paramsId);

    //     if (recipient) {

    //         io.to(recipient.socketId).emit('recieveNotSeenMessage', data );
    //         console.log('Messege sent to recipient:', recipient.socketId);
    //     } else {
    //         console.log('Message recipient not found');
    //     }

    //     // Send an acknowledgment back to the client
    //     if (typeof callback === 'function') {
    //         callback({ status: 'ok', msg: 'Message event received' });
    //     }  
        
        
    // })

    socket.on('newNotification', async (notification) => {
        console.log('New notification received:', notification);
    
        const { usersID, creatorId } = notification;
        console.log("creatorId", creatorId);
    
        const notifyUser = async (userId) => {
            try {
                // Find the user's entry in the users Map by userId
                const recipient = Array.from(users.values()).find(user => user.id == userId);
    
                await saveNotificationToDatabase({ ...notification, userId });
    
                // Fetch admin data asynchronously with the correct where clause
                const adminData = await adminModel.findOne({ where: { id: userId } });
    
                if (adminData) {
                    await sendMail(adminData.email, adminData.name, notification.text); // Use await to handle async call
    
                    if (recipient) {
                        io.to(recipient.socketId).emit('notification', notification);
                        console.log('Notification sent to recipient:', recipient.socketId);
                    } else {
                        console.log('Recipient not found for userId:', userId);
                    }
                } else {
                    console.log(`Admin data not found for userId: ${userId}`);
                }
            } catch (error) {
                console.error(`Error handling notification for userId ${userId}:`, error);
            }
        };
    
        // Notify all users in usersID
        for (const userId of usersID) {
            await notifyUser(userId);
        }
    
        // Also notify the creatorId if not already included in usersID
        if (creatorId ) {
            console.log("Notifying creatorId:", creatorId);
            await notifyUser(creatorId);
        }
    });
          
    socket.on('sendMessageToUsers', async (messageData, callback) => {
        try {
            // Extract user IDs and message from messageData
            const { usersIds, ...message } = messageData;
            console.log("usersIds:", usersIds);

            saveGroupMessageToDatabase(messageData);
            
            const sender = users.get(socket.id);
            if (!sender) {
                console.log('Sender not found in users map.');
                if (callback) {
                    return callback({ status: 'error', msg: 'Sender not found' });
                }
            }
            
            // Send the message to the sender
            // io.to(sender.socketId).emit('userMessage', messageData);
            console.log('Message sent to sender:', sender.socketId);
    
            // Loop through each userId and send the message
            usersIds.forEach(userId => {
                const recipient = Array.from(users.values()).find(user => user.id == userId);
                console.log("recipient for userId", userId, ":", recipient);
    
                if (recipient && recipient.socketId) {
                    io.to(recipient.socketId).emit('userMessage', messageData);
                    console.log(`Message sent to user ${recipient.socketId}:`, messageData);
                } else {
                    console.log(`Recipient with ID ${userId} not found or has no socketId`);
                }
            });
    
            // Provide callback response
            callback({ status: 'ok', msg: 'Message sent successfully' });
        } catch (error) {
            console.error(`Error sending message to users ${messageData.usersIds}:`, error);
            callback({ status: 'error', msg: 'Message delivery failed' });
        }
    });
    
    socket.on('groupTyping', (typing, callback) => {
        const sender = users.get(socket.id);
        if (!sender) {
            // console.log('Typing sender not found in users map.');
            if (callback) {
                return callback({ status: 'error', typing: 'Sender not found' });
            }
        }
    
        const { usersIds } = typing;
        if(!usersIds){
            if (callback) {
                console.log('usersIds not found');
                
                return callback({ status: 'error', typing: 'usersIds not found' });
            }
        }
        // Ensure usersIds is defined and is an array
        if (Array.isArray(usersIds)) {
            // Find the recipient's socket
            usersIds.forEach(userId => {
                const recipient = Array.from(users.values()).find(user => user.id == userId);
                console.log("Recipient for userId", userId, ":", recipient);
    
                if (recipient && recipient.socketId) {
                    io.to(recipient.socketId).emit('groupTyping', typing);
                    console.log(`Typing sent to user ${recipient.socketId}:`, typing);
                } else {
                    console.log(`Recipient with ID ${userId} not found or has no socketId`);
                }
            });
        } else {
            console.error('usersIds is not an array or is undefined');
            if (callback) {
                return callback({ status: 'error', typing: 'Invalid usersIds' });
            }
        }
    
        // Send an acknowledgment back to the client
        if (typeof callback === 'function') {
            callback({ status: 'ok', msg: 'Typing event received' });
        }
    });

    socket.on('groupSeen', async (seen, callback) => {
        const sender = users.get(socket.id);
        if (!sender) {
            if (callback) {
                return callback({ status: 'error', seen: 'Sender not found' });
            }
        }
    
        const { fromId, groupId , usersIds } = seen;
        console.log("fromId:", fromId, "groupId:", groupId);
        
        if (!fromId || !groupId) {
            if (callback) {
                console.log('Invalid data received');
                return callback({ status: 'error', seen: 'Invalid data' });
            }
        }
        
        await updateGcMessageStatusInDatabase({ fromId , groupId });
    
        try {
            if(!usersIds){
                if (callback) {
                    console.log('usersIds not found');
                    
                    return callback({ status: 'error', typing: 'usersIds not found' });
                }
            }
            // Ensure usersIds is defined and is an array
            if (Array.isArray(usersIds)) {
                // Find the recipient's socket
                usersIds.forEach(userId => {
                    const recipient = Array.from(users.values()).find(user => user.id == userId);
                    console.log("Recipient for userId", userId, ":", recipient);
        
                    if (recipient && recipient.socketId) {
                        io.to(recipient.socketId).emit('groupSeenUsers', {fromId , groupId});
                        console.log(`groupSeenUsers sent to user ${recipient.socketId}:`,  {fromId , groupId});
                    } else {
                        console.log(`Recipient with ID ${userId} not found or has no socketId`);
                    }
                });
            } else {
                console.error('usersIds is not an array or is undefined');
                if (callback) {
                    return callback({ status: 'error', typing: 'Invalid usersIds' });
                }
            }
      
    
            if (typeof callback === 'function') {
                callback({ status: 'ok', msg: 'Seen event received' });
            }
        } catch (error) {
            console.error('Error handling groupSeen event:', error);
            if (callback) {
                callback({ status: 'error', seen: 'Internal server error' });
            }
        }
    });
    
    
    
    
    // Function to get socket IDs by user IDs
  
    

   
    socket.on('disconnect', () => {
        try {
            console.log('User disconnected:', socket.id);
            
            if (users.has(socket.id)) {
                users.delete(socket.id);
                console.log(`User with socket ID ${socket.id} disconnected.`);
                console.log('Current users:', Array.from(users.values()));
                
                // Emit the updated list of active users
                socket.emit('users', Array.from(users.values()));
                broadcastAllUsers();
            }

        } catch (error) {
            console.error('Error handling user disconnect:', error);
        }
    });
});


// const users = new Map(); // Using a Map to store user data with socket IDs as keys
//     socket.on('sendFile', (fileData, callback) => {
//     // const { file } = fileData;
//     console.log('Received file name:', fileData);


//     const sender = users.get(socket.id);
//     if (!sender) {
//         // console.log('Sender not found in users map.');
//         if (callback) {
//             return callback({ status: 'error', msg: 'Sender not found' });
//         }
//     }

//     const paramsId = sender ? sender.paramsId : null;

//     // Find the recipient's socket
//     const recipient = Array.from(users.values()).find(user => user.id === fileData.toId && user.paramsId !== paramsId);

//     if (recipient) {
//         io.to(recipient.socketId).emit('fileSaved', fileData);
//         // console.log('Message sent to recipient:', recipient.socketId);
//     } else {
//         console.log('Recipient not found');
//     }

//     // Send the message to the sender as well
//     if (sender) {
//         io.to(sender.socketId).emit('fileSaved', fileData);
//         // console.log('Message sent to sender:', sender.socketId);
//     } else {
//         console.log('Sender not found when trying to send the message back.');
//     }

//     // Acknowledge receipt of the message
//     if (callback) {
//         callback({ status: 'ok', msg: 'File sent' });
//     }
 

//   });            


// socket.broadcast.emit('allusers', Array.from(users.values()));

// io.on('connection', (socket) => {
// console.log('A user connected:', socket.id);


    
// // Handle when the active user ID is received
// socket.on('receiveActiveId', (id) => {
// try {
// console.log('Id of logged-in user:', id);

// // Remove existing entry for the user, if any
// for (const [key, user] of users.entries()) {
// if (user.id === id) {
// users.delete(key);
// break; // Exit loop early since we've found the user
// }


// // Handle when paramsId is received
// socket.on('paramsId', (paramsId) => {
//     try {
//     console.log('Received paramsId:', paramsId);
//     // Store paramsId with the user's socket ID
//     if (users.has(socket.id)) {
//     users.get(socket.id).paramsId = paramsId;
//     }

// socket.emit('users' , Array.from(users.values()));
// console.log("Data: ",id , paramsId);
// const paramsActiveUser = Array.from(users.values()).filter(user => user?.id === paramsId);
// // console.log('Params active user:', paramsActiveUser);

// if (paramsActiveUser.length > 0) {
//     socket.emit('activeUserParams', { status: 1, user: paramsActiveUser[0] });
//     console.log("Active updated;");
// } else {
//     socket.emit('activeUserParams', { status: 0 });
// }

    
// } catch (error) {
//     console.error('Error handling paramsId:', error);
//     }


// });

// console.log('Current users:', Array.from(users.values()));

// }

// // Add the new entry for the user
// users.set(socket.id, { id, socketId: socket.id });

// console.log('Current users:', Array.from(users.values()));
// } catch (error) {
// console.error('Error handling receiveActiveId:', error);
// }
// });



// // Handle when paramsId is received
// socket.on('paramsId', (paramsId) => {
//     try {
//     console.log('Received paramsId:', paramsId);
//     // Store paramsId with the user's socket ID
//     if (users.has(socket.id)) {
//     users.get(socket.id).paramsId = paramsId;
//     }
//     } catch (error) {
//     console.error('Error handling paramsId:', error);
//     }
// });

// // Handle sending messages
// socket.on('sendMsg', async (msg, callback) => {
//     console.log('Message received:', msg);

//     try {
//         // Retrieve paramsId for the sender
//         const sender = users.get(socket.id);
//         if (!sender) {
//             console.log('Sender not found in users map.');
//             if (callback) {
//                 return callback({ status: 'error', msg: 'Sender not found' });
//             }
//         }

//         const paramsId = sender ? sender.paramsId : null;

//         // Find the recipient's socket
//         const recipient = Array.from(users.values()).find(user => user.id === msg.toId && user.paramsId !== paramsId);

//         if (recipient) {
//             io.to(recipient.socketId).emit('receiveMsg', msg);
//             console.log('Message sent to recipient:', recipient.socketId);
//         } else {
//             console.log('Recipient not found');
//         }

//         // Send the message to the sender as well
//         if (sender) {
//             io.to(sender.socketId).emit('receiveMsg', msg);
//             console.log('Message sent to sender:', sender.socketId);
//         } else {
//             console.log('Sender not found when trying to send the message back.');
//         }

//         // Save the message to the database
//         const data = await saveMessageToDatabase(msg);
//         console.log('Message saved to database:', data);

//         // Acknowledge receipt of the message
//         if (callback) {
//             callback({ status: 'ok', msg: 'Message sent' });
//         }
//     } catch (error) {
//         console.error('Error handling sendMsg:', error);
//         if (callback) {
//             callback({ status: 'error', msg: 'Failed to send message' });
//         }
//     }
// });



// socket.on('typing', (typing, callback) => {
// // console.log('Received typing event:', messageData);
// // Process the typing event (e.g., broadcast to other users)

// const sender = users.get(socket.id);
// if (!sender) {
// console.log('Typing Sender not found in users map.');
// if (callback) {
// return callback({ status: 'error', typing: 'Sender not found' });
// }
// }

// const paramsId = sender ? sender.paramsId : null;

// // Find the recipient's socket
// const recipient = Array.from(users.values()).find(user => user.id === typing.toId && user.paramsId !== paramsId);

// if (recipient) {
// io.to(recipient.socketId).emit('receiveTyping', typing);
// console.log('Typing sent to recipient:', recipient.socketId);
// } else {
// console.log('Typing Recipient not found');
// }
// // socket.broadcast.emit('typing', messageData);

// // Send an acknowledgment back to the client
// if (typeof callback === 'function') {
// callback({ status: 'ok', msg: 'Typing event received' });
// }
// });

// // Handle user disconnection
// socket.on('disconnect', () => {
// try {
// console.log('User disconnected:', socket.id);

// try {
//     if (users.has(socket.id)) {
//         users.delete(socket.id);
//         console.log(`User with socket ID ${socket.id} disconnected.`);
//         console.log('Current users:', Array.from(users.values()));

//         // Emit the updated list of active users
//         socket.emit('activeUsers', Array.from(users.values()));
//     }
// } catch (error) {
//     console.error('Error handling user disconnect:', error);
// }

// // // Remove the user from the users map
// // users.delete(socket.id);
// // console.log('Current users after disconnection:', Array.from(users.values()));
// } catch (error) {
// console.error('Error handling disconnect:', error);
// }
// });
// });


app.get("/", (req, res) => {
res.json({ message: "Hello" });
});

module.exports = { server };
// const express = require("express");
// const http = require("http");
// const cors = require("cors");
// const { PeerServer } = require('peer');
// const bodyParser = require('body-parser');
// const socketIO = require("socket.io");
// const { chatModel, adminModel , groupUserChatting } = require("./models");
// const {notificationModel} = require("./models");
// const fs = require('fs');
// const path = require('path');
// const sendMail = require("./middlewares/Sendemail");
// const multer = require("./middlewares/Mediaproject");

// const saveFile = require("./middlewares/Chatmedia");
// const { where } = require("sequelize");
// require('dotenv').config();

// const app = express();
// const server = http.createServer(app);


// // CORS options
// const corsOptions = {
//     origin: '*',  // Specify your origin or use an array of allowed origins
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//     allowedHeaders: ['Content-Type', 'Authorization', 'token'],
//     credentials: true
// };

// // Middleware to handle CORS
// app.use(cors(corsOptions));
// app.use((req, res, next) => {
//     res.header('Access-Control-Allow-Origin', '*');  // Specify your origin or use an array of allowed origins
//     res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
//     res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, token');
//     res.header('Access-Control-Allow-Credentials', 'true');
//     next();
// });


// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(cors(corsOptions));
// // app.use('/uploads', express.static('uploads'));
// // 
// // Serve static files from the 'uploads' directory
// app.use('/backend', express.static('backend'));
// // app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



// // Socket.IO setup with CORS options
// const io = socketIO(server, {
//     cors: corsOptions,
// });

// const saveMessageToDatabase = async (msg) => {
//   try {
//       const data = await chatModel.create({
//           fromId: msg.fromId,
//           toId: msg.toId,
//           text: msg.text || null,
//           file: msg.file,
//           time: new Date(),
//           seen: 0
//       });
//       console.log('Message saved to database:', data);
//       return data;
//   } catch (error) {
//       console.error('Error saving message to database:', error);
//       throw error;
//   }
// };


// const saveGroupMessageToDatabase = async (msg) => {
//     try {
      
//         const data = await groupUserChatting.create({
//             fromId: msg.fromId,
//             groupId: msg.toId,
//             text: msg.text || null,
//             time: new Date(),
//         });
//         console.log('Message saved to database:', data);
//         return data;
//     } catch (error) {
//         console.error('Error saving message to database:', error);
//         throw error;
//     }
//   };
  
// const updateMessageStatusInDatabase = async (msg) => {
//     try {
//       const [updatedCount] = await chatModel.update(
//         { seen: 1 },
//         {
//           where: {
//             fromId: msg.fromId,
//             toId: msg.toId,
//           },
//         }
//       );
  
//       if (updatedCount === 0) {
//         console.log('No message found to update.');
//       } else {
//         console.log('Message status updated in database.');
//       }
  
//       return updatedCount;
//     } catch (error) {
//       console.error('Error updating message status in database:', error);
//       throw error;
//     }
//   };
  
  
  
// const saveNotificationToDatabase = async (notify) => {
//   try {
//       const data = await notificationModel.create({
//           text: notify.text || null,
//           time: notify.time || null,
//           date: notify.time || null,
//           userId: notify.userId ,
//           route: notify.route || null
//       });
//       console.log('Notification saved to database:', data);
//       return data;
//   } catch (error) {
//       console.error('Error saving notification to database:', error);
//       throw error;
//   }
// };


  
// const users = new Map(); // Using a Map to store user data with socket IDs as keys
// // Example function to get socket IDs by user IDs

// let messageId
// io.on('connection', (socket) => {
//     console.log('A user connected:', socket.id);

//     const broadcastAllUsers = () => {
//         io.emit('allusers', Array.from(users.values()));
//     };
    

//     // const emitActiveUserParams = (id, paramsId) => {
//     //     const paramsActiveUser = Array.from(users.values()).filter(id === paramsId);
//     //     if (paramsActiveUser.length > 0) {
//     //         socket.emit('activeUserParams', { status: 1, user: paramsActiveUser[0] });
//     //         console.log("Active user updated:", paramsActiveUser[0]);
//     //     } else {
//     //         socket.emit('activeUserParams', { status: 0 });
//     //         console.log("No active user found for user.paramsId:");
//     //     }
//     // };

//     // Handle when the active user ID is received
//     socket.on('receiveActiveId', (id) => {
//         try {
//             // console.log('Id of logged-in user:', id);

//             // Remove existing entry for the user, if any
//             for (const [key, user] of users.entries()) {
//                 if (user.id === id) {
//                     users.delete(key);
//                     break; // Exit loop early since we've found the user
//                 }
//             }

//             // Add the new entry for the user
//             users.set(socket.id, { id, socketId: socket.id });

//             broadcastAllUsers();

//             // console.log('Current users:', Array.from(users.values()));
            
//         } catch (error) {
//             console.error('Error handling receiveActiveId:', error);
//         }
//     });
    

//     // Handle when paramsId is received
//     socket.on('paramsId', (paramsId) => {
//         try {
//             // console.log('Received paramsId:', paramsId);
//             // Store paramsId with the user's socket ID
//             if (users.has(socket.id)) {
//                 users.get(socket.id).paramsId = paramsId;
                
//                 // emitActiveUserParams(id, null);
//             }
//         } catch (error) {
//             console.error('Error handling paramsId:', error);
//         }
//     });

//     // Handle sending messages
//     socket.on('sendMsg', async (msg, callback) => {
//         // console.log('Message received:', msg);

//         try {
//             // Retrieve paramsId for the sender
//             console.log(msg);
            
//             const sender = users.get(socket.id);
//             if (!sender) {
//                 // console.log('Sender not found in users map.');
//                 if (callback) {
//                     return callback({ status: 'error', msg: 'Sender not found' });
//                 }
//             }

//              // Save the message to the database
//             const data = await saveMessageToDatabase(msg);
//             messageId = data.id;
//             const paramsId = sender ? sender.paramsId : null;

//             // Find the recipient's socket
//             const recipient = Array.from(users.values()).find(user => user.id === msg.toId && user.paramsId !== paramsId);

//             console.log("MEssafe Id" , messageId);
            
//             if (recipient) {
//                 io.to(recipient.socketId).emit('receiveMsg', msg ,messageId);
//                 // console.log('Message sent to recipient:', recipient.socketId);
//             } else {
//                 console.log('Recipient not found');
//             }

//             // Send the message to the sender as well
//             if (sender) {
//                 io.to(sender.socketId).emit('receiveMsg', msg ,messageId);
//                 // console.log('Message sent to sender:', sender.socketId);
//             } else {
//                 console.log('Sender not found when trying to send the message back.');
//             }

           
//             // console.log('Message saved to database:', data);

//             // Acknowledge receipt of the message
//             if (callback) {
//                 callback({ status: 'ok', msg: 'Message sent' });
//             }
//         } catch (error) {
//             console.error('Error handling sendMsg:', error);
//             if (callback) {
//                 callback({ status: 'error', msg: 'Failed to send message' });
//             }
//         }
//     });

//     socket.on('typing', (typing, callback) => {
//         const sender = users.get(socket.id);
//         if (!sender) {
//             // console.log('Typing sender not found in users map.');
//             if (callback) {
//                 return callback({ status: 'error', typing: 'Sender not found' });
//             }
//         }

//         const paramsId = sender ? sender.paramsId : null;

//         // Find the recipient's socket
//         const recipient = Array.from(users.values()).find(user => user.id === typing.toId && user.paramsId !== paramsId);

//         if (recipient) {
//             io.to(recipient.socketId).emit('receiveTyping', typing);
//             console.log('Typing sent to recipient:', recipient.socketId);
//         } else {
//             console.log('Typing recipient not found');
//         }

//         // Send an acknowledgment back to the client
//         if (typeof callback === 'function') {
//             callback({ status: 'ok', msg: 'Typing event received' });
//         }
//     });


  
//     socket.on('seenMessages', async (data, callback) => {
//         console.log("Seen messages: ", data);
//         const sender = users.get(socket.id);
//         if (!sender) {
//           if (callback) {
//             return callback({ status: 'error', typing: 'Sender not found' });
//           }
//         }
    
//         const paramsId = sender ? sender.paramsId : null;
//         console.log("paramsId", paramsId);
    
//         const recipient = Array.from(users.values()).find(user => user.id === data.fromId && user.paramsId !== paramsId);
    
//         if (recipient) {
//           io.to(recipient.socketId).emit('receiveSeenMessage', data);
//           await updateMessageStatusInDatabase(data);
//           console.log('Message sent to recipient:', recipient.socketId);
//         } else {
//           console.log('Message recipient not found');
//         }
    
//         if (typeof callback === 'function') {
//           callback({ status: 'ok', msg: 'Message event received' });
//         }
//       });
    
//       socket.on('sendLeaveChat', async (data) => {
//         console.log("sendLeaveChat: ", data);
//         socket.broadcast.emit('receiveLeaveChat', data);
//       });   

//     // socket.on('seenMessages', async (data, callback) => {
//     //     console.log("Seen messages: ", data);
//     //     const sender = users.get(socket.id);
//     //     if (!sender) {
//     //         // console.log('Typing sender not found in users map.');
//     //         if (callback) {
//     //             return callback({ status: 'error', typing: 'Sender not found' });
//     //         }
//     //     }


//     //     // io.emit('recieveSeenMessage', data );


//     //     // const messageId = data.messageId;
        
//     //     const paramsId = sender ? sender.paramsId : null;
//     //     console.log("paramsId", paramsId);
        

//     //     // Find the recipient's socket
//     //     const recipient = Array.from(users.values()).find(user => user.id === data.fromId && user.paramsId !== paramsId);

//     //     if (recipient) {

//     //         io.to(recipient.socketId).emit('recieveSeenMessage', data );
//     //         await updateMessageStatusInDatabase(data);

//     //         console.log('Messege sent to recipient:', recipient.socketId);
//     //     } else {
//     //         console.log('Message recipient not found');
//     //     }

//     //     // Send an acknowledgment back to the client
//     //     if (typeof callback === 'function') {
//     //         callback({ status: 'ok', msg: 'Message event received' });
//     //     }  
//     // })

//     // socket.on('sendLeaveChat', async (data) => {
//     //     console.log("sendLeaveChat: ", data);
//     //     socket.broadcast.emit('receiveLeaveChat', data);
//     // });
    

//     // socket.on('notSeen' , async (data, callback) => {
//     //     console.log("Not Seen messages: ", data);
//     //     const sender = users.get(socket.id);
//     //     if (!sender) {
//     //         // console.log('Typing sender not found in users map.');
//     //         if (callback) {
//     //             return callback({ status: 'error', typing: 'Sender not found' });
//     //         }
//     //     }

//     //     const paramsId = sender ? sender.paramsId : null;
//     //     console.log("paramsId", paramsId);
        

//     //     // Find the recipient's socket
//     //     const recipient = Array.from(users.values()).find(user => user.id === data.fromId && user.paramsId !== paramsId);

//     //     if (recipient) {

//     //         io.to(recipient.socketId).emit('recieveNotSeenMessage', data );
//     //         console.log('Messege sent to recipient:', recipient.socketId);
//     //     } else {
//     //         console.log('Message recipient not found');
//     //     }

//     //     // Send an acknowledgment back to the client
//     //     if (typeof callback === 'function') {
//     //         callback({ status: 'ok', msg: 'Message event received' });
//     //     }  
        
        
//     // })

//     socket.on('newNotification', async (notification) => {
//         console.log('New notification received:', notification);
    
//         const { usersID, creatorId } = notification;
//         console.log("creatorId", creatorId);
    
//         const notifyUser = async (userId) => {
//             try {
//                 // Find the user's entry in the users Map by userId
//                 const recipient = Array.from(users.values()).find(user => user.id == userId);
    
//                 await saveNotificationToDatabase({ ...notification, userId });
    
//                 // Fetch admin data asynchronously with the correct where clause
//                 const adminData = await adminModel.findOne({ where: { id: userId } });
    
//                 if (adminData) {
//                     await sendMail(adminData.email, adminData.name, notification.text); // Use await to handle async call
    
//                     if (recipient) {
//                         io.to(recipient.socketId).emit('notification', notification);
//                         console.log('Notification sent to recipient:', recipient.socketId);
//                     } else {
//                         console.log('Recipient not found for userId:', userId);
//                     }
//                 } else {
//                     console.log(`Admin data not found for userId: ${userId}`);
//                 }
//             } catch (error) {
//                 console.error(`Error handling notification for userId ${userId}:`, error);
//             }
//         };
    
//         // Notify all users in usersID
//         for (const userId of usersID) {
//             await notifyUser(userId);
//         }
    
//         // Also notify the creatorId if not already included in usersID
//         if (creatorId ) {
//             console.log("Notifying creatorId:", creatorId);
//             await notifyUser(creatorId);
//         }
//     });
          
//     socket.on('sendMessageToUsers', async (messageData, callback) => {
//         try {
//             // Extract user IDs and message from messageData
//             const { usersIds, ...message } = messageData;
//             console.log("usersIds:", usersIds);

//             saveGroupMessageToDatabase(messageData);
            
//             const sender = users.get(socket.id);
//             if (!sender) {
//                 console.log('Sender not found in users map.');
//                 if (callback) {
//                     return callback({ status: 'error', msg: 'Sender not found' });
//                 }
//             }
            
//             // Send the message to the sender
//             // io.to(sender.socketId).emit('userMessage', messageData);
//             console.log('Message sent to sender:', sender.socketId);
    
//             // Loop through each userId and send the message
//             usersIds.forEach(userId => {
//                 const recipient = Array.from(users.values()).find(user => user.id == userId);
//                 console.log("recipient for userId", userId, ":", recipient);
    
//                 if (recipient && recipient.socketId) {
//                     io.to(recipient.socketId).emit('userMessage', messageData);
//                     console.log(`Message sent to user ${recipient.socketId}:`, messageData);
//                 } else {
//                     console.log(`Recipient with ID ${userId} not found or has no socketId`);
//                 }
//             });
    
//             // Provide callback response
//             callback({ status: 'ok', msg: 'Message sent successfully' });
//         } catch (error) {
//             console.error(`Error sending message to users ${messageData.usersIds}:`, error);
//             callback({ status: 'error', msg: 'Message delivery failed' });
//         }
//     });
    
//     socket.on('groupTyping', (typing, callback) => {
//         const sender = users.get(socket.id);
//         if (!sender) {
//             // console.log('Typing sender not found in users map.');
//             if (callback) {
//                 return callback({ status: 'error', typing: 'Sender not found' });
//             }
//         }
    
//         const { usersIds } = typing;
//         if(!usersIds){
//             if (callback) {
//                 console.log('usersIds not found');
                
//                 return callback({ status: 'error', typing: 'usersIds not found' });
//             }
//         }
//         // Ensure usersIds is defined and is an array
//         if (Array.isArray(usersIds)) {
//             // Find the recipient's socket
//             usersIds.forEach(userId => {
//                 const recipient = Array.from(users.values()).find(user => user.id == userId);
//                 console.log("Recipient for userId", userId, ":", recipient);
    
//                 if (recipient && recipient.socketId) {
//                     io.to(recipient.socketId).emit('groupTyping', typing);
//                     console.log(`Typing sent to user ${recipient.socketId}:`, typing);
//                 } else {
//                     console.log(`Recipient with ID ${userId} not found or has no socketId`);
//                 }
//             });
//         } else {
//             console.error('usersIds is not an array or is undefined');
//             if (callback) {
//                 return callback({ status: 'error', typing: 'Invalid usersIds' });
//             }
//         }
    
//         // Send an acknowledgment back to the client
//         if (typeof callback === 'function') {
//             callback({ status: 'ok', msg: 'Typing event received' });
//         }
//     });
    
    
//     // Function to get socket IDs by user IDs
  
    

   
//     socket.on('disconnect', () => {
//         try {
//             console.log('User disconnected:', socket.id);
            
//             if (users.has(socket.id)) {
//                 users.delete(socket.id);
//                 console.log(`User with socket ID ${socket.id} disconnected.`);
//                 console.log('Current users:', Array.from(users.values()));
                
//                 // Emit the updated list of active users
//                 socket.emit('users', Array.from(users.values()));
//                 broadcastAllUsers();
//             }

//         } catch (error) {
//             console.error('Error handling user disconnect:', error);
//         }
//     });
// });


// // const users = new Map(); // Using a Map to store user data with socket IDs as keys
// //     socket.on('sendFile', (fileData, callback) => {
// //     // const { file } = fileData;
// //     console.log('Received file name:', fileData);


// //     const sender = users.get(socket.id);
// //     if (!sender) {
// //         // console.log('Sender not found in users map.');
// //         if (callback) {
// //             return callback({ status: 'error', msg: 'Sender not found' });
// //         }
// //     }

// //     const paramsId = sender ? sender.paramsId : null;

// //     // Find the recipient's socket
// //     const recipient = Array.from(users.values()).find(user => user.id === fileData.toId && user.paramsId !== paramsId);

// //     if (recipient) {
// //         io.to(recipient.socketId).emit('fileSaved', fileData);
// //         // console.log('Message sent to recipient:', recipient.socketId);
// //     } else {
// //         console.log('Recipient not found');
// //     }

// //     // Send the message to the sender as well
// //     if (sender) {
// //         io.to(sender.socketId).emit('fileSaved', fileData);
// //         // console.log('Message sent to sender:', sender.socketId);
// //     } else {
// //         console.log('Sender not found when trying to send the message back.');
// //     }

// //     // Acknowledge receipt of the message
// //     if (callback) {
// //         callback({ status: 'ok', msg: 'File sent' });
// //     }
 

// //   });            


// // socket.broadcast.emit('allusers', Array.from(users.values()));

// // io.on('connection', (socket) => {
// // console.log('A user connected:', socket.id);


    
// // // Handle when the active user ID is received
// // socket.on('receiveActiveId', (id) => {
// // try {
// // console.log('Id of logged-in user:', id);

// // // Remove existing entry for the user, if any
// // for (const [key, user] of users.entries()) {
// // if (user.id === id) {
// // users.delete(key);
// // break; // Exit loop early since we've found the user
// // }


// // // Handle when paramsId is received
// // socket.on('paramsId', (paramsId) => {
// //     try {
// //     console.log('Received paramsId:', paramsId);
// //     // Store paramsId with the user's socket ID
// //     if (users.has(socket.id)) {
// //     users.get(socket.id).paramsId = paramsId;
// //     }

// // socket.emit('users' , Array.from(users.values()));
// // console.log("Data: ",id , paramsId);
// // const paramsActiveUser = Array.from(users.values()).filter(user => user?.id === paramsId);
// // // console.log('Params active user:', paramsActiveUser);

// // if (paramsActiveUser.length > 0) {
// //     socket.emit('activeUserParams', { status: 1, user: paramsActiveUser[0] });
// //     console.log("Active updated;");
// // } else {
// //     socket.emit('activeUserParams', { status: 0 });
// // }

    
// // } catch (error) {
// //     console.error('Error handling paramsId:', error);
// //     }


// // });

// // console.log('Current users:', Array.from(users.values()));

// // }

// // // Add the new entry for the user
// // users.set(socket.id, { id, socketId: socket.id });

// // console.log('Current users:', Array.from(users.values()));
// // } catch (error) {
// // console.error('Error handling receiveActiveId:', error);
// // }
// // });



// // // Handle when paramsId is received
// // socket.on('paramsId', (paramsId) => {
// //     try {
// //     console.log('Received paramsId:', paramsId);
// //     // Store paramsId with the user's socket ID
// //     if (users.has(socket.id)) {
// //     users.get(socket.id).paramsId = paramsId;
// //     }
// //     } catch (error) {
// //     console.error('Error handling paramsId:', error);
// //     }
// // });

// // // Handle sending messages
// // socket.on('sendMsg', async (msg, callback) => {
// //     console.log('Message received:', msg);

// //     try {
// //         // Retrieve paramsId for the sender
// //         const sender = users.get(socket.id);
// //         if (!sender) {
// //             console.log('Sender not found in users map.');
// //             if (callback) {
// //                 return callback({ status: 'error', msg: 'Sender not found' });
// //             }
// //         }

// //         const paramsId = sender ? sender.paramsId : null;

// //         // Find the recipient's socket
// //         const recipient = Array.from(users.values()).find(user => user.id === msg.toId && user.paramsId !== paramsId);

// //         if (recipient) {
// //             io.to(recipient.socketId).emit('receiveMsg', msg);
// //             console.log('Message sent to recipient:', recipient.socketId);
// //         } else {
// //             console.log('Recipient not found');
// //         }

// //         // Send the message to the sender as well
// //         if (sender) {
// //             io.to(sender.socketId).emit('receiveMsg', msg);
// //             console.log('Message sent to sender:', sender.socketId);
// //         } else {
// //             console.log('Sender not found when trying to send the message back.');
// //         }

// //         // Save the message to the database
// //         const data = await saveMessageToDatabase(msg);
// //         console.log('Message saved to database:', data);

// //         // Acknowledge receipt of the message
// //         if (callback) {
// //             callback({ status: 'ok', msg: 'Message sent' });
// //         }
// //     } catch (error) {
// //         console.error('Error handling sendMsg:', error);
// //         if (callback) {
// //             callback({ status: 'error', msg: 'Failed to send message' });
// //         }
// //     }
// // });



// // socket.on('typing', (typing, callback) => {
// // // console.log('Received typing event:', messageData);
// // // Process the typing event (e.g., broadcast to other users)

// // const sender = users.get(socket.id);
// // if (!sender) {
// // console.log('Typing Sender not found in users map.');
// // if (callback) {
// // return callback({ status: 'error', typing: 'Sender not found' });
// // }
// // }

// // const paramsId = sender ? sender.paramsId : null;

// // // Find the recipient's socket
// // const recipient = Array.from(users.values()).find(user => user.id === typing.toId && user.paramsId !== paramsId);

// // if (recipient) {
// // io.to(recipient.socketId).emit('receiveTyping', typing);
// // console.log('Typing sent to recipient:', recipient.socketId);
// // } else {
// // console.log('Typing Recipient not found');
// // }
// // // socket.broadcast.emit('typing', messageData);

// // // Send an acknowledgment back to the client
// // if (typeof callback === 'function') {
// // callback({ status: 'ok', msg: 'Typing event received' });
// // }
// // });

// // // Handle user disconnection
// // socket.on('disconnect', () => {
// // try {
// // console.log('User disconnected:', socket.id);

// // try {
// //     if (users.has(socket.id)) {
// //         users.delete(socket.id);
// //         console.log(`User with socket ID ${socket.id} disconnected.`);
// //         console.log('Current users:', Array.from(users.values()));

// //         // Emit the updated list of active users
// //         socket.emit('activeUsers', Array.from(users.values()));
// //     }
// // } catch (error) {
// //     console.error('Error handling user disconnect:', error);
// // }

// // // // Remove the user from the users map
// // // users.delete(socket.id);
// // // console.log('Current users after disconnection:', Array.from(users.values()));
// // } catch (error) {
// // console.error('Error handling disconnect:', error);
// // }
// // });
// // });


// app.get("/", (req, res) => {
// res.json({ message: "Hello" });
// });

// module.exports = { server };