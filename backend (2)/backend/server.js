require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require('body-parser');
const http = require('http'); // Import http
const socketIo = require('socket.io'); // Import socket.io


// Routes Import
const adminRoute = require("./routes/Adminroute");
const ProjectRoute = require("./routes/Projectroute");
const TaskRoute = require("./routes/Tasksroute");
const ProjectStatusRoute = require("./routes/Projectstatusroute");
const ProjectPriorityRoute = require("./routes/Projectpriorityroute");
const chatRoute = require("./routes/Chatroute");
const meetingRoute = require("./routes/Meetingroute");
const notifyRoute = require("./routes/Notifyroute");
const generalRoute = require("./routes/Generalroute");
const db = require("./models"); // Adjust the path as necessary



const socketIO = require("socket.io");
const sendMail = require("./middlewares/Sendemail");
const {notificationModel} = require("./models");
const { chatModel, adminModel , groupUserChatting } = require("./models");


// Sync the models with the database
db.sequelize
  .sync()
  .then(() => {
    console.log("All tables created successfully.");
  })
  .catch((err) => {
    console.error("Unable to create tables:", err);
  });

  
const app = express();

const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'token'],
    credentials: true
};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors(corsOptions));
app.use('/public', express.static('public'));


app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, token');
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
});


app.use("/api/admin", adminRoute);
app.use("/api/project", ProjectRoute);
app.use("/api/task", TaskRoute);
app.use("/api/projectStatus", ProjectStatusRoute);
app.use("/api/projectPriority", ProjectPriorityRoute);
app.use("/api/chat", chatRoute);
app.use("/api/meeting", meetingRoute);
app.use("/api/notify", notifyRoute);
app.use("/api/general", generalRoute);


const server = require('http').createServer(app);

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
        loggedUser : notify.loggedUser, 
        route: notify.route || null
    });
    console.log('Notification saved to database:', data);
    return data;
} catch (error) {
    console.error('Error saving notification to database:', error);
    throw error;
}
};


const saveTasksCommentsToDatabase = async (cmnt) => {
    try {
        console.log("usersIds: " , cmnt.usersIds);
        
        const data = await db.taskCommentsModel.create({
            fromId: cmnt.fromId,
            taskId: cmnt.toId,
            text: cmnt.text || null,
            time: cmnt.time || null,
            usersIds: cmnt.usersIds ,
            loggedUser : cmnt.loggedUser, 
    
    })

    console.log('Task comments saved to database:', data);
    }catch (error) {
    console.error('Error saving task comments to database:', error);
            
}}


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
  
              const notifyId = await  saveNotificationToDatabase({ ...notification, userId });
  
              // Fetch admin data asynchronously with the correct where clause
              const adminData = await adminModel.findOne({ where: { id: userId } });
  
              if (adminData) {
                  await sendMail(adminData.email, adminData.name, notification.text); // Use await to handle async call
                      const id = notifyId.id;
                  if (recipient) {
                    const notificationWithId = { ...notification, id };

                    // Emit the notification with notifyId to the recipient
                    io.to(recipient.socketId).emit('notification', notificationWithId);

                    //   io.to(recipient.socketId).emit('notification', notification);
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
  

 
  socket.on('addComments', async (data, callback) => {
    try {
        // Extract user IDs and message from data
        const { usersIds } = data;
        console.log("usersIds-scoket-comments:", usersIds, data);

        saveTasksCommentsToDatabase(data);

        const sender = users.get(socket.id);
        if (!sender) {
            console.log('Sender not found in users map.');
            if (callback) {
                return callback({ status: 'error', msg: 'Sender not found' });
            }
        }

        // Send the message to the sender
        if (sender && sender.socketId) {
            // io.to(sender.socketId).emit('getUserComment', data);
            console.log('Message sent to sender:', sender.socketId);
        } else {
            console.log('Sender has no socketId.');
        }

        // Loop through each userId and send the message
        usersIds.forEach(userId => {
            const recipient = Array.from(users.values()).find(user => user.id == userId);
            console.log("recipient for userId", userId, ":", recipient);

            if (recipient && recipient.socketId) {
                io.to(recipient.socketId).emit('getUserComment', data);
                console.log(`Message sent to user ${recipient.socketId}:`, data);
            } else {
                console.log(`Recipient with ID ${userId} not found or has no socketId`);
            }
        });

        // Provide callback response
        if (callback) {
            callback({ status: 'ok', msg: 'Message sent successfully' });
        }
    } catch (error) {
        console.error(`Error sending message to users ${data.usersIds}:`, error);
        if (callback) {
            callback({ status: 'error', msg: 'Message delivery failed' });
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

app.get('/', (req, res) => {
    res.send('Hello Management!');
});

const PORT =  5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});



module.exports = { server };


// // Pass io instance to routes
// app.use((req, res, next) => {
//   req.io = io;
//   next();
// });

// Routes

// const chatModel = db.chatModel;

// const app = express();
// const io = socketIo(server, {
//   cors: {
//     origin: "http://localhost:3000", // React app URL
//     methods: ["GET", "POST"]
//   }
// });

// // Middlewares
// app.use(cors());
// app.use(express.json()); // Add this line to parse JSON bodies
// app.use("/public", express.static("public")); // Serve static files

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

// Function

// const saveMessageToDatabase = async (msg) => {
//   try {
//       const data = await chatModel.create({
//           fromId: msg.fromId,
//           toId: msg.toId,
//           text: msg.text,
//           time: new Date()
//       });
//       return data;
//   } catch (error) {
//       console.error('Error saving message to database:', error);
//       throw error;
//   }
// };



// const users = new Map(); // Use a Map to store user data with socket IDs as keys

// io.on('connection', (socket) => {
//     console.log('A user connected');

//     // Handle when the active user ID is received
//     socket.on('receiveActiveId', (id) => {
//         console.log('Id of login user:', id);

//         // Remove existing entry for the user, if any
//         users.forEach((user, key) => {
//             if (user.id === id) {
//                 users.delete(key);
//             }
//         });

//         // Add the new entry for the user
//         users.set(socket.id, { id, socketId: socket.id });

//         console.log('Current users:', Array.from(users.values()));
//     });

//     // Handle when paramsId is received
//     socket.on('paramsId', (paramsId) => {
//         console.log('Received paramsId:', paramsId);
//         // Store paramsId with the user's socket ID
//         if (users.has(socket.id)) {
//             users.get(socket.id).paramsId = paramsId;
//         }
//     });

//     // Handle sending messages
//     socket.on('sendMsg', async (msg, callback) => {
//       console.log('Message received:', msg);

//       try {
//           // Save the message to the database
//           const data = await saveMessageToDatabase(msg);
//           console.log('Message saved to database:', data);

//           // Retrieve paramsId for the sender
//           const sender = users.get(socket.id);
//           const paramsId = sender ? sender.paramsId : null;

//           console.log('Sender paramsId:', paramsId);

//           // Find the recipient's socket
//           const recipient = Array.from(users.values()).find(user => user.id === msg.toId && user.id !== paramsId && user.paramsId === msg.fromId);

//           if (recipient) {
//               io.to(recipient.socketId).emit('receiveMsg', msg);
//           } else {
//               console.log('Recipient not found');
//           }

//           // Send the message to the sender as well
//           if (sender) {
//               io.to(sender.socketId).emit('receiveMsg', msg);
//           }

//           // Acknowledge receipt of the message
//           if (callback) {
//               callback({ status: 'ok', msg: 'Message sent' });
//           }
//       } catch (error) {
//           console.error('Error handling message:', error);
//           if (callback) {
//               callback({ status: 'error', msg: 'Failed to send message' });
//           }
//       }
//   });
//     // Handle user disconnection
//     socket.on('disconnect', () => {
//         console.log('A user disconnected');
//         // Remove the user from the users map
//         users.delete(socket.id);
//         console.log('Current users after disconnection:', Array.from(users.values()));
//     });
// });



// const port = process.env.PORT || 5000;
// server.listen(port, () => {
//   console.log("Server running on port: " + port);
// });





 // console.log('Recipient found:', recipient);
        // if (recipient) {
        //     io.to(recipient.socketId).emit('receiveMsg', msg);
        // } else {
        //     console.log('Recipient not found');
        // }

        // // Send the message to the sender as well
        // const sender = users.find(user => user.id === msg.fromId);
        // if (sender) {
        //     io.to(sender.socketId).emit('receiveMsg', msg);
        // }

        // // Acknowledge receipt of the message
        // if (callback) {
        //     callback({ status: 'ok', msg: 'Message received' });
        // }



// require("dotenv").config();
// const express = require("express");
// const cors = require("cors");
// const app = express();
// // Routes Import
// const adminRoute = require("./routes/Adminroute");
// const ProjectRoute = require("./routes/Projectroute");
// const TaskRoute = require("./routes/Tasksroute");
// const db = require("./models"); // Adjust the path as necessary
// const bodyParser = require('body-parser');

// // Middlewares
// app.use(cors());
// app.use(express.json()); // Add this line to parse JSON bodies
// app.use("/public", express.static("public")); // Serve static files

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
// // Sync the models with the database
// db.sequelize
//   .sync()
//   .then(() => {
//     console.log("All tables created successfully.");
//   })
//   .catch((err) => {
//     console.error("Unable to create tables:", err);
//   });

//   // Routes
// app.use("/admin", adminRoute);
// app.use("/project", ProjectRoute);
// app.use("/tasks", TaskRoute);






// io.on('connection', (socket) => {
//   console.log('New client connected');

//   socket.on('disconnect', () => {
//       console.log('Client disconnected');
//   });
// });





















// const port = process.env.PORT;
// app.listen(port, () => {
//   console.log("Server running on port: " + port);
// });
