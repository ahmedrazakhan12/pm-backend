const db = require("../models/index");
const chatModel = db.chatModel;
const adminModel = db.adminModel;
const {uploadMedia} = require("../includes/uploads3");

const fs = require('fs');
const path = require('path');


const {
  validateName,
} = require("../middlewares/Validate");
const {
  validateTime,
} = require("../middlewares/Projectvalidation");

const { Op } = require('sequelize');

exports.GetChats = async (req, res) => {
  try {
    const { fromId, toId } = req.query;

    if (!fromId || !toId) {
      return res.status(400).send('Both fromId and toId are required');
    }

    // Fetch chats where either fromId or toId matches the provided IDs
    const chats = await chatModel.findAll({
      where: {
        [Op.or]: [
          { fromId: fromId, toId: toId },
          { fromId: toId, toId: fromId }
        ]
      }
    });

    // console.log(chats);
    res.send(chats);
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).send('Internal server error');
  }
};

const sequelize = require("../config/database");

// exports.GetChatBarUsers = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Fetch all chats involving the user, ordered by the latest message timestamp
//     const chats = await chatModel.findAll({
//       where: {
//         [Op.or]: [
//           { fromId: id },
//           { toId: id }
//         ]
//       },
//       order: [
//         ['time', 'DESC']  // Order by the timestamp of the latest message
//       ]
//     });

//     // Create a Map to store the latest chat per user
//     const latestChatsMap = new Map();

//     chats.forEach(chat => {
//       const otherUserId = chat.fromId === parseInt(id) ? chat.toId : chat.fromId;
//       // Only store the latest chat for each user
//       if (!latestChatsMap.has(otherUserId)) {
//         latestChatsMap.set(otherUserId, chat);
//       }
//     });

//     // Extract user IDs from the latest chats
//     const userIdsArray = Array.from(latestChatsMap.keys());

//     // Fetch user details based on unique user IDs
//     const users = await adminModel.findAll({
//       where: {
//         id: {
//           [Op.in]: userIdsArray
//         }
//       },
//       // Order users based on the order of user IDs
//       order: [
//         [sequelize.fn('FIELD', sequelize.col('id'), ...userIdsArray)]
//       ]
//     });

//     // Send the user details in the response
//     res.send(users);
//   } catch (error) {
//     console.error('Error fetching chat bar users:', error);
//     res.status(500).send('Internal server error');
//   }
// }

// exports.GetChatBarUsers = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Fetch all chats involving the user, ordered by the latest message timestamp
//     const chats = await chatModel.findAll({
//       where: {
//         [Op.or]: [
//           { fromId: id },
//           { toId: id }
//         ]
//       },
//       order: [
//         ['time', 'DESC']  // Order by the timestamp of the latest message
//       ]
//     });

//     // Create a Map to store the latest chat per user and unseen message count
//     const latestChatsMap = new Map();

//     chats.forEach(chat => {
//       const otherUserId = chat.fromId === parseInt(id) ? chat.toId : chat.fromId;

//       // Initialize the map with an object if it doesn't already exist
//       if (!latestChatsMap.has(otherUserId)) {
//         latestChatsMap.set(otherUserId, { chat, unseenCount: 0 });
//       }

//       // If chat is not yet seen and is from the other user, count it
//       if (chat.seen === 0 && chat.toId === parseInt(id)) {
//         const chatData = latestChatsMap.get(otherUserId);
//         chatData.unseenCount += 1;
//         latestChatsMap.set(otherUserId, chatData);
//       }

//       // Always update the latest chat for each user
//       const chatData = latestChatsMap.get(otherUserId);
//       chatData.chat = chat;
//       latestChatsMap.set(otherUserId, chatData);
//     });

//     // Extract user IDs from the latest chats
//     const userIdsArray = Array.from(latestChatsMap.keys());

//     // Fetch user details based on unique user IDs
//     const users = await adminModel.findAll({
//       where: {
//         id: {
//           [Op.in]: userIdsArray
//         }
//       },
//       // Order users based on the order of user IDs
//       order: [
//         [sequelize.fn('FIELD', sequelize.col('id'), ...userIdsArray)]
//       ]
//     });

//     // Combine users with their respective unseen message count and latest text
//     const usersWithLatestChatInfo = users.map(user => {
//       const { chat, unseenCount } = latestChatsMap.get(user.id);
//       return {
//         ...user.toJSON(),  // Convert the Sequelize model instance to a plain object
//         unseenMessages: unseenCount,
//         latestText: chat.text,  // Include the latest text from the chat
//       };
//     });

//     // Send the user details, unseen message counts, and latest text in the response
//     res.send(usersWithLatestChatInfo);
//   } catch (error) {
//     console.error('Error fetching chat bar users:', error);
//     res.status(500).send('Internal server error');
//   }
// }

exports.GetChatBarUsers = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch all chats involving the user, ordered by the latest message timestamp
    const chats = await chatModel.findAll({
      where: {
        [Op.or]: [
          { fromId: id },
          { toId: id }
        ]
      },
      order: [
        ['time', 'DESC']  // Order by the timestamp of the latest message
      ]
    });

    // Create a Map to store the latest chat per user and unseen message count
    const latestChatsMap = new Map();

    chats.forEach(chat => {
      const otherUserId = chat.fromId === parseInt(id) ? chat.toId : chat.fromId;

      // If there is already a chat stored for this user, compare timestamps to ensure the latest chat is kept
      if (!latestChatsMap.has(otherUserId) || latestChatsMap.get(otherUserId).chat.time < chat.time) {
        latestChatsMap.set(otherUserId, { chat, unseenCount: 0 });
      }

      // If chat is not yet seen and is from the other user, count it
      if (chat.seen === 0 && chat.toId === parseInt(id)) {
        const chatData = latestChatsMap.get(otherUserId);
        chatData.unseenCount += 1;
        latestChatsMap.set(otherUserId, chatData);
      }
    });

    // Extract user IDs from the latest chats
    const userIdsArray = Array.from(latestChatsMap.keys());

    // Fetch user details based on unique user IDs
    const users = await adminModel.findAll({
      where: {
        id: {
          [Op.in]: userIdsArray
        }
      },
      // Order users based on the order of user IDs
      order: [
        [sequelize.fn('FIELD', sequelize.col('id'), ...userIdsArray)]
      ]
    });

    // Combine users with their respective unseen message count and latest text
    const usersWithLatestChatInfo = users.map(user => {
      const { chat, unseenCount } = latestChatsMap.get(user.id);
      return {
        ...user.toJSON(),  // Convert the Sequelize model instance to a plain object
        unseenMessages: unseenCount,
        latestText: chat.text,  // Include the latest text from the chat
        latestChatTime: chat.time,  // Include the timestamp of the latest chat
      };
    });

    // Send the user details, unseen message counts, and latest text in the response
    res.send(usersWithLatestChatInfo);
  } catch (error) {
    console.error('Error fetching chat bar users:', error);
    res.status(500).send('Internal server error');
  }
}


// exports.GetChatBarUsers = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Fetch all chats involving the user, ordered by the latest message timestamp
//     const chats = await chatModel.findAll({
//       where: {
//         [Op.or]: [
//           { fromId: id },
//           { toId: id }
//         ]
//       },
//       order: [
//         ['time', 'DESC']  // Order by the timestamp of the latest message
//       ]
//     });

//     // Create a Map to store the latest chat per user and unseen message count
//     const latestChatsMap = new Map();

//     chats.forEach(chat => {
//       const otherUserId = chat.fromId === parseInt(id) ? chat.toId : chat.fromId;

//       // If there is already a chat stored for this user, compare timestamps to ensure the latest chat is kept
//       if (!latestChatsMap.has(otherUserId) || latestChatsMap.get(otherUserId).chat.time < chat.time) {
//         latestChatsMap.set(otherUserId, { chat, unseenCount: 0 });
//       }

//       // If chat is not yet seen and is from the other user, count it
//       if (chat.seen === 0 && chat.toId === parseInt(id)) {
//         const chatData = latestChatsMap.get(otherUserId);
//         chatData.unseenCount += 1;
//         latestChatsMap.set(otherUserId, chatData);
//       }
//     });

//     // Extract user IDs from the latest chats
//     const userIdsArray = Array.from(latestChatsMap.keys());

//     // Check if there are any user IDs
//     if (userIdsArray.length === 0) {
//       return res.send([]);  // If no user IDs, return an empty array
//     }

//     // Fetch user details based on unique user IDs
//     const users = await adminModel.findAll({
//       where: {
//         id: {
//           [Op.in]: userIdsArray
//         }
//       },
//       // Order users based on the order of user IDs
//       order: [
//         [sequelize.fn('FIELD', sequelize.col('id'), ...userIdsArray)]
//       ]
//     });

//     // Combine users with their respective unseen message count and latest text
//     const usersWithLatestChatInfo = users.map(user => {
//       const { chat, unseenCount } = latestChatsMap.get(user.id);
//       return {
//         ...user.toJSON(),  // Convert the Sequelize model instance to a plain object
//         unseenMessages: unseenCount,
//         latestText: chat.text,  // Include the latest text from the chat
//         latestChatTime: chat.time,  // Include the timestamp of the latest chat
//       };
//     });

//     // Send the user details, unseen message counts, and latest text in the response
//     res.send(usersWithLatestChatInfo);
//   } catch (error) {
//     console.error('Error fetching chat bar users:', error);
//     res.status(500).send('Internal server error');
//   }
// };



exports.groupChat = async (req, res) => {
  try {
    const { creator, groupName, time } = req.body;
    const usersID = JSON.parse(req.body.usersID); // Parse JSON string back to array
    const groupImage = req.file; // This will have information about the uploaded file

    const error =
    validateName(groupName) ||
    validateTime(time);
    
    if (error) {
      return res.status(400).json({
        status: 400,
        data: null,
        message: error,
      });
    }

    let imagePath = "https://project-mgt.s3.ap-southeast-2.amazonaws.com/image/1725366225218-groupImage.png";
    if (req.file) {
      console.log("File received: ");
      // const photoFileName = req.file.filename;
      // console.log("PhotoFileName: ", photoFileName);
      // imagePath = `http://localhost:5000/public/uploads/pfp/${photoFileName}`;
       // Prepare mediaItem for S3 upload
       const filePath = path.join(__dirname, '..', 'public', 'uploads', 'pfp', req.file.filename);
       const fileContent = fs.readFileSync(filePath);
 
       // Prepare mediaItem for S3 upload
       const mediaItem = {
         filename: req.file.filename,
         data: fileContent,  // File content read from disk
         type: req.file.mimetype
       };
 
       // Upload the file to S3
       const s3Urls = await uploadMedia([mediaItem]);
 
       if (s3Urls && s3Urls.length > 0) {
         imagePath = s3Urls[0]; // Assuming the first URL is the profile picture URL
       } else {
         return res.status(500).json({ message: "Failed to upload image to S3" });
       }
    }
    const data = await db.groupChatModel.create({
      creator: creator,
      groupName: groupName,
      time: time,
      groupImage: imagePath
    });
    const groupId = data.id;

    await db.groupUser.bulkCreate(
      usersID.map((id) => ({ groupId, userId: id })),
    );

    res.status(200).json({ message: "Group created successfully!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server error" });
  }
};exports.addGroupMember = async (req, res) => {
  try {
    const { groupId } = req.body;
    let usersID = JSON.parse(req.body.userId); // Parse JSON string back to its original form

    // Ensure usersID is an array
    if (!Array.isArray(usersID)) {
      usersID = [usersID]; // Convert single value to an array
    }

    // console.log(groupId, usersID);

    // Check for existing group members
    const existingMembers = await db.groupUser.findAll({
      where: {
        groupId: groupId,
        userId: usersID
      }
    });

    // Filter out already existing members
    const existingUserIds = existingMembers.map(member => member.userId);
    const newUserIds = usersID.filter(userId => !existingUserIds.includes(userId));

    // Add only new users
    if (newUserIds.length > 0) {
      const membersToAdd = newUserIds.map(userId => ({ groupId, userId }));

      await db.groupUser.bulkCreate(membersToAdd);
    }

    res.status(200).json({ message: "Group member(s) added successfully!" });
  } catch (error) {
    console.error(error); // Log error details for debugging
    res.status(500).json({ error: "Server error" });
  }
}


// exports.getGroups = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Step 1: Get all groups created by the user
//     const groups = await db.groupChatModel.findAll({
//       where: { creator: id },
//       order: [['createdAt', 'DESC']]
//     });

//     const groupIds = groups.map(group => group.id);

//     // Step 2: Get all groups the user is a member of
//     const groupUsersData = await db.groupUser.findAll({
//       where: { userId: id },
//       order: [['createdAt', 'DESC']]
//     });

//     const userGroupID = groupUsersData.map(group => group.groupId);

//     // Step 3: Get details of the groups the user is a member of
//     const getUserGroup = await db.groupChatModel.findAll({
//       where: { id: userGroupID }
//     });

//     // Step 4: Get all messages for the user's groups
//     const allMessages = await db.groupUserChatting.findAll({
//       where: {
//         groupId: {
//           [Op.in]: [...groupIds, ...userGroupID]
//         }
//       }
//     });

//     // Step 5: Calculate unseen messages count for each group in `groups`
//     const groupsWithUnseenCount = groups.map(group => {
//       const unseenCount = allMessages.filter(message =>
//         message.groupId === group.id &&
//         !message.seen.includes(id)
//       ).length;
//       return {
//         ...group.toJSON(),  // Convert Sequelize model to plain object
//         unseenMessagesCount: unseenCount
//       };
//     });

//     // Step 6: Calculate unseen messages count for each group in `getUserGroup`
//     const userGroupsWithUnseenCount = getUserGroup.map(group => {
//       const unseenCount = allMessages.filter(message =>
//         message.groupId === group.id &&
//         !message.seen.includes(id)
//       ).length;
//       return {
//         ...group.toJSON(),  // Convert Sequelize model to plain object
//         unseenMessagesCount: unseenCount
//       };
//     });

//     const data = {
//       groups: groupsWithUnseenCount,
//       groupUsers: groupUsersData,
//       getUserGroup: userGroupsWithUnseenCount
//     };

//     res.send(data);
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ error: "Server error" });
//   }
// };

// exports.getGroups = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Fetch the groups created by the user
//     const groups = await db.groupChatModel.findAll({
//       where: {
//         creator: id,
//       },
//       order: [['createdAt', 'DESC']]
//     });

//     // Get the IDs of the groups created by the user
//     const groupIds = groups.map(group => group.id);

//     // Fetch all users in those groups
//     const groupUsers = await db.groupUser.findAll({
//       where: {
//         groupId: {
//           [Op.in]: groupIds
//         }
//       }
//     });

//     // Fetch the groups the user is part of
//     const groupUsersData = await db.groupUser.findAll({
//       where: {
//         userId: id,
//       },
//       order: [['createdAt', 'DESC']]
//     });

//     const userGroupIDs = groupUsersData.map(group => group.groupId);

//     // Fetch group details for the groups the user is part of
//     const getUserGroups = await db.groupChatModel.findAll({
//       where: {
//         id: userGroupIDs
//       }
//     });

//     // Calculate unread messages count for each group
//     const unreadMessagesCount = await Promise.all(
//       userGroupIDs.map(async groupId => {
//         const unreadCount = await db.groupUserChatting.count({
//           where: {
//             groupId: groupId,
//             [Op.or]: [
//               // If the seen field is null
//               { seen: null },
//               // If the seen field does not contain the user ID
//               db.Sequelize.where(
//                 db.Sequelize.json('seen'),
//                 {
//                   [Op.notLike]: `%${id}%`
//                 }
//               )
//             ]
//           }
//         });
//         return { groupId, unreadCount };
//       })
//     );
    
   
//     // Add unreadCount to each group in getUserGroups without changing the structure
//     const updatedGroups = getUserGroups.map(group => {
//       const unreadCountData = unreadMessagesCount.find(count => count.groupId === group.id);
//       return {
//         ...group.toJSON(),
//         unreadCount: unreadCountData ? unreadCountData.unreadCount : 0
//       };
//     });

//     // Send the data with the same structure
//     const data = {
//       groups,
//       groupUsers,
//       getUserGroup: updatedGroups
//     };
    
//     res.send(data);
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ error: "Server error" });
//   }
// };

// exports.getGroups = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Fetch the groups created by the user
//     const groups = await db.groupChatModel.findAll({
//       where: {
//         creator: id,
//       },
//       order: [['createdAt', 'DESC']]
//     });

//     // Get the IDs of the groups created by the user
//     const groupIds = groups.map(group => group.id);

//     // Fetch all users in those groups
//     const groupUsers = await db.groupUser.findAll({
//       where: {
//         groupId: {
//           [Op.in]: groupIds
//         }
//       }
//     });

//     // Fetch the groups the user is part of
//     const groupUsersData = await db.groupUser.findAll({
//       where: {
//         userId: id,
//       },
//       order: [['createdAt', 'DESC']]
//     });

//     const userGroupIDs = groupUsersData.map(group => group.groupId);

//     // Fetch group details for the groups the user is part of
//     const getUserGroups = await db.groupChatModel.findAll({
//       where: {
//         id: userGroupIDs
//       }
//     });

//     // Calculate unread messages count for all groups
//     const unreadMessagesCount = await Promise.all(
//       [...groupIds, ...userGroupIDs].map(async groupId => {
//         const unreadCount = await db.groupUserChatting.count({
//           where: {
//             groupId: groupId,
//             [Op.or]: [
//               // If the seen field is null
//               { seen: null },
//               // If the seen field does not contain the user ID
//               db.Sequelize.where(
//                 db.Sequelize.json('seen'),
//                 {
//                   [Op.notLike]: `%${id}%`
//                 }
//               )
//             ]
//           }
//         });
//         return { groupId, unreadCount };
//       })
//     );

//     // Add unreadCount to each group in groups
//     const updatedGroups = groups.map(group => {
//       const unreadCountData = unreadMessagesCount.find(count => count.groupId === group.id);
//       return {
//         ...group.toJSON(),
//         unreadCount: unreadCountData ? unreadCountData.unreadCount : 0
//       };
//     });

//     // Add unreadCount to each group in getUserGroups
//     const updatedUserGroups = getUserGroups.map(group => {
//       const unreadCountData = unreadMessagesCount.find(count => count.groupId === group.id);
//       return {
//         ...group.toJSON(),
//         unreadCount: unreadCountData ? unreadCountData.unreadCount : 0
//       };
//     });

//     // Send the data with the same structure
//     const data = {
//       groups: updatedGroups,
//       groupUsers,
//       getUserGroup: updatedUserGroups
//     };

//     res.send(data);
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ error: "Server error" });
//   }
// };

// exports.getGroups = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Fetch the groups created by the user
//     const groups = await db.groupChatModel.findAll({
//       where: {
//         creator: id,
//       }
//     });

//     // Get the IDs of the groups created by the user
//     const groupIds = groups.map(group => group.id);

//     // Fetch all users in those groups
//     const groupUsers = await db.groupUser.findAll({
//       where: {
//         groupId: {
//           [Op.in]: groupIds
//         }
//       }
//     });

//     // Fetch the groups the user is part of
//     const groupUsersData = await db.groupUser.findAll({
//       where: {
//         userId: id,
//       }
//     });

//     const userGroupIDs = groupUsersData.map(group => group.groupId);

//     // Fetch group details for the groups the user is part of
//     const getUserGroups = await db.groupChatModel.findAll({
//       where: {
//         id: userGroupIDs
//       }
//     });

//     // Fetch the latest message timestamp for each group
//     const latestMessages = await db.groupUserChatting.findAll({
//       where: {
//         groupId: {
//           [Op.in]: [...groupIds, ...userGroupIDs]
//         }
//       },
//       attributes: ['groupId', [db.Sequelize.fn('MAX', db.Sequelize.col('createdAt')), 'latestMessageTime']],
//       group: ['groupId']
//     });

//     const latestMessageMap = latestMessages.reduce((map, msg) => {
//       map[msg.groupId] = msg.dataValues.latestMessageTime;
//       return map;
//     }, {});

//     // Calculate unread messages count for all groups
//     const unreadMessagesCount = await Promise.all(
//       [...groupIds, ...userGroupIDs].map(async groupId => {
//         const unreadCount = await db.groupUserChatting.count({
//           where: {
//             groupId: groupId,
//             [Op.or]: [
//               { seen: null },
//               db.Sequelize.where(
//                 db.Sequelize.json('seen'),
//                 { [Op.notLike]: `%${id}%` }
//               )
//             ]
//           }
//         });
//         return { groupId, unreadCount };
//       })
//     );

//     // Add unreadCount and latestMessageTime to each group in groups
//     const updatedGroups = groups.map(group => {
//       const unreadCountData = unreadMessagesCount.find(count => count.groupId === group.id);
//       return {
//         ...group.toJSON(),
//         unreadCount: unreadCountData ? unreadCountData.unreadCount : 0,
//         latestMessageTime: latestMessageMap[group.id] || group.createdAt
//       };
//     });

//     // Add unreadCount and latestMessageTime to each group in getUserGroups
//     const updatedUserGroups = getUserGroups.map(group => {
//       const unreadCountData = unreadMessagesCount.find(count => count.groupId === group.id);
//       return {
//         ...group.toJSON(),
//         unreadCount: unreadCountData ? unreadCountData.unreadCount : 0,
//         latestMessageTime: latestMessageMap[group.id] || group.createdAt
//       };
//     });

//     // Sort the groups based on latestMessageTime in descending order
//     const sortedGroups = updatedGroups.sort((a, b) => new Date(b.latestMessageTime) - new Date(a.latestMessageTime));
//     const sortedUserGroups = updatedUserGroups.sort((a, b) => new Date(b.latestMessageTime) - new Date(a.latestMessageTime));

//     // Send the data with the same structure
//     const data = {
//       groups: sortedGroups,
//       groupUsers,
//       getUserGroup: sortedUserGroups
//     };

//     res.send(data);
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ error: "Server error" });
//   }
// };

exports.getGroups = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch the groups created by the user
    const groups = await db.groupChatModel.findAll({
      where: {
        creator: id,
      }
    });

    // Get the IDs of the groups created by the user
    const groupIds = groups.map(group => group.id);

    // Fetch all users in those groups
    const groupUsers = await db.groupUser.findAll({
      where: {
        groupId: {
          [Op.in]: groupIds
        }
      }
    });

    // Fetch the groups the user is part of
    const groupUsersData = await db.groupUser.findAll({
      where: {
        userId: id,
      }
    });

    const userGroupIDs = groupUsersData.map(group => group.groupId);

    // Fetch group details for the groups the user is part of
    const getUserGroups = await db.groupChatModel.findAll({
      where: {
        id: userGroupIDs
      }
    });

    // Fetch the latest message timestamp for each group
    const latestMessages = await db.groupUserChatting.findAll({
      where: {
        groupId: {
          [Op.in]: [...groupIds, ...userGroupIDs]
        }
      },
      attributes: ['groupId', [db.Sequelize.fn('MAX', db.Sequelize.col('time')), 'latestMessageTime']],
      group: ['groupId']
    });

    // Fetch the last text message for each group
    const lastMessages = await db.groupUserChatting.findAll({
      where: {
        groupId: {
          [Op.in]: [...groupIds, ...userGroupIDs]
        }
      },
      attributes: ['groupId', 'text', 'time'],
      order: [['time', 'DESC']]
    });

    const latestMessageMap = latestMessages.reduce((map, msg) => {
      map[msg.groupId] = msg.dataValues.latestMessageTime;
      return map;
    }, {});

    const lastMessageMap = lastMessages.reduce((map, msg) => {
      // Only keep the latest message per group
      if (!map[msg.groupId] || new Date(msg.time) > new Date(map[msg.groupId].time)) {
        map[msg.groupId] = { text: msg.text, time: msg.time };
      }
      return map;
    }, {});

    // Calculate unread messages count for all groups
    const unreadMessagesCount = await Promise.all(
      [...groupIds, ...userGroupIDs].map(async groupId => {
        const unreadCount = await db.groupUserChatting.count({
          where: {
            groupId: groupId,
            [Op.or]: [
              { seen: null },
              db.Sequelize.where(
                db.Sequelize.json('seen'),
                { [Op.notLike]: `%${id}%` }
              )
            ]
          }
        });
        return { groupId, unreadCount };
      })
    );

    // Add unreadCount, latestMessageTime, and lastMessage to each group in groups
    const updatedGroups = groups.map(group => {
      const unreadCountData = unreadMessagesCount.find(count => count.groupId === group.id);
      return {
        ...group.toJSON(),
        unreadCount: unreadCountData ? unreadCountData.unreadCount : 0,
        latestMessageTime: latestMessageMap[group.id] || group.createdAt,
        lastMessage: lastMessageMap[group.id]?.text || null
      };
    });

    // Add unreadCount, latestMessageTime, and lastMessage to each group in getUserGroups
    const updatedUserGroups = getUserGroups.map(group => {
      const unreadCountData = unreadMessagesCount.find(count => count.groupId === group.id);
      return {
        ...group.toJSON(),
        unreadCount: unreadCountData ? unreadCountData.unreadCount : 0,
        latestMessageTime: latestMessageMap[group.id] || group.createdAt,
        lastMessage: lastMessageMap[group.id]?.text || null
      };
    });

    // Sort the groups based on latestMessageTime in descending order
    const sortedGroups = updatedGroups.sort((a, b) => new Date(b.latestMessageTime) - new Date(a.latestMessageTime));
    const sortedUserGroups = updatedUserGroups.sort((a, b) => new Date(b.latestMessageTime) - new Date(a.latestMessageTime));

    // Send the data with the same structure
    const data = {
      groups: sortedGroups,
      groupUsers,
      getUserGroup: sortedUserGroups
    };

    res.send(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server error" });
  }
};


//Old
// exports.getGroups = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const groups = await db.groupChatModel.findAll({
//       where: {
//         creator: id,
//       },
//       order: [['createdAt', 'DESC']] 
//     });
    
//     // console.log('Groups:', groups);

//     const groupIds = groups.map(group => group.id);
//     const groupUsers = await db.groupUser.findAll({
//       where: {
//         groupId: {
//           [Op.in]: groupIds
//         }
//       }
//     });
    
//     const groupUsersData = await db.groupUser.findAll({
//       where: {
//         userId: id,
//       },
//       order: [['createdAt', 'DESC']] 
//     });
    
//     const userGroupID = groupUsersData.map(group => group.groupId);

//     const getUserGroup = await db.groupChatModel.findAll({
//       where: {
//         id: userGroupID
        
//       }
//     });
   


//     // console.log('GroupUsers:', groupUsers);

//     const data = {
//       groups,
//       groupUsers,
//       getUserGroup
//     }
//     res.send(data);
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ error: "Server error" });
//   }
// }

exports.getGroupsChat = async (req, res) => {
  try {
    const { id } = req.params;

    // console.log("id: " , id);
    
    // Fetch the specific group based on the provided ID
    const group = await db.groupChatModel.findOne({
      where: {
        id: id
      }
    });

    // If no group is found, return a 404 error
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    // console.log('Group:', group);

    // Fetch all users in the found group
    const groupUsers = await db.groupUser.findAll({
      where: {
        groupId: group.id
      }
    });
    const creatorId = group.creator;
    const creator = await db.adminModel.findOne({
      where: {
        id: creatorId
      }
    })
    const userIds = groupUsers.map(user => user.userId);
    const users = await db.adminModel.findAll({
      where: {
        id: {
          [Op.in]: userIds
        }
      }
    });

    // console.log('GroupUsers:', groupUsers);

    // Prepare the data to be sent back
    const data = {
      group,
      groupUsers:users,
      creator
    }

    // Send the response
    res.send(data);

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server error" });
  }
}

exports.getChattingById = async (req, res) => {
  try {
    const { id } = req.params;

    // console.log("id: ", id);

    // Fetch the specific group based on the provided ID
    const group = await db.groupUserChatting.findAll({
      where: {
        groupId: id
      }
    });
    if (!group || group.length === 0) {
      return res.status(404).json({ error: "Group not found" });
    }

    const fromIds = group.map(chat => chat.fromId);

    const users = await db.adminModel.findAll({ 
      where: {
        id: fromIds
      }
    });

    if (!users || users.length === 0) {
      return res.status(404).json({ error: "Users not found" });
    }

    // Map users to their respective IDs for easy lookup
    const userMap = users.reduce((acc, user) => {
      acc[user.id] = user;
      return acc;
    }, {});

    // Attach user details to each message
    const messagesWithUserDetails = group.map(chat => ({
      ...chat.dataValues, // Copy all message properties
      user: userMap[chat.fromId] // Attach the user details based on fromId
    }));

    res.send({ data: messagesWithUserDetails });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server error" });
  }
}


exports.updateGcName = async (req, res) => {
  const { groupName, id } = req.body;
  // console.log("groupName, id: ", groupName, id);
  
  if (!groupName || !id) {
    return res.status(400).json({ error: 'Group name and ID are required' });
  }

  try {
    // Update the group name in your database
     await db.groupChatModel.update(
      { groupName: groupName },
      { where: { id } }
    )

 
    res.status(200).json({ message: 'Group name updated successfully' });
  } catch (error) {
    console.error('Error updating group name:', error);
    res.status(500).json({ error: 'Internal server error' });
  }

}
exports.updateGcPfp = async (req, res) => {
  const { id } = req.body;
  const file = req.file;

  // console.log("id: ", id , "file: ", file);
  

  if (!id) {
    return res.status(400).json({ error: 'Group ID is required' });
  }
  if (!file) {
    return res.status(400).json({ error: 'File is required' });
  }

  try {
    let imagePath = "https://project-mgt.s3.ap-southeast-2.amazonaws.com/image/1725366225218-groupImage.png";

    if (file) {
      // // console.log("File received: ");
      // const photoFileName = file.filename;
      // console.log("PhotoFileName: ", photoFileName);
      // imagePath = `http://localhost:5000/public/uploads/pfp/${photoFileName}`;

      const filePath = path.join(__dirname, '..', 'public', 'uploads', 'pfp', req.file.filename);
      const fileContent = fs.readFileSync(filePath);

      // Prepare mediaItem for S3 upload
      const mediaItem = {
        filename: req.file.filename,
        data: fileContent,  // File content read from disk
        type: req.file.mimetype
      };

      // Upload the file to S3
      const s3Urls = await uploadMedia([mediaItem]);

      if (s3Urls && s3Urls.length > 0) {
        imagePath = s3Urls[0]; // Assuming the first URL is the profile picture URL
      } else {
        return res.status(500).json({ message: "Failed to upload image to S3" });
      }
    }

    await db.groupChatModel.update(
      { groupImage: imagePath },
      { where: { id: id } }
    );

    res.status(200).json({ message: 'Profile picture updated successfully' });
  } catch (error) {
    console.error('Error updating profile picture:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}


exports.deleteGroup = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: 'Group ID is required' });
  }

  try {
    await db.groupChatModel.destroy({
      where: {
        id: id
      }
    });

    await db.groupUser.destroy({
      where: {
        groupId: id
      }
    })

    await db.groupUserChatting.destroy({
      where: {
        groupId: id
      }
    })
    res.status(200).json({ message: 'Group deleted successfully' });
  } catch (error) {
    console.error('Error deleting group:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// const db = require("../models/index");
// const chatModel = db.chatModel;
// const adminModel = db.adminModel;

// const {
//   validateName,
// } = require("../middlewares/Validate");
// const {
//   validateTime,
// } = require("../middlewares/Projectvalidation");

// const { Op } = require('sequelize');

// exports.GetChats = async (req, res) => {
//   try {
//     const { fromId, toId } = req.query;

//     if (!fromId || !toId) {
//       return res.status(400).send('Both fromId and toId are required');
//     }

//     // Fetch chats where either fromId or toId matches the provided IDs
//     const chats = await chatModel.findAll({
//       where: {
//         [Op.or]: [
//           { fromId: fromId, toId: toId },
//           { fromId: toId, toId: fromId }
//         ]
//       }
//     });

//     // console.log(chats);
//     res.send(chats);
//   } catch (error) {
//     console.error('Error fetching chats:', error);
//     res.status(500).send('Internal server error');
//   }
// };

// const sequelize = require("../config/database");

// // exports.GetChatBarUsers = async (req, res) => {
// //   try {
// //     const { id } = req.params;

// //     // Fetch all chats involving the user, ordered by the latest message timestamp
// //     const chats = await chatModel.findAll({
// //       where: {
// //         [Op.or]: [
// //           { fromId: id },
// //           { toId: id }
// //         ]
// //       },
// //       order: [
// //         ['time', 'DESC']  // Order by the timestamp of the latest message
// //       ]
// //     });

// //     // Create a Map to store the latest chat per user
// //     const latestChatsMap = new Map();

// //     chats.forEach(chat => {
// //       const otherUserId = chat.fromId === parseInt(id) ? chat.toId : chat.fromId;
// //       // Only store the latest chat for each user
// //       if (!latestChatsMap.has(otherUserId)) {
// //         latestChatsMap.set(otherUserId, chat);
// //       }
// //     });

// //     // Extract user IDs from the latest chats
// //     const userIdsArray = Array.from(latestChatsMap.keys());

// //     // Fetch user details based on unique user IDs
// //     const users = await adminModel.findAll({
// //       where: {
// //         id: {
// //           [Op.in]: userIdsArray
// //         }
// //       },
// //       // Order users based on the order of user IDs
// //       order: [
// //         [sequelize.fn('FIELD', sequelize.col('id'), ...userIdsArray)]
// //       ]
// //     });

// //     // Send the user details in the response
// //     res.send(users);
// //   } catch (error) {
// //     console.error('Error fetching chat bar users:', error);
// //     res.status(500).send('Internal server error');
// //   }
// // }

// // exports.GetChatBarUsers = async (req, res) => {
// //   try {
// //     const { id } = req.params;

// //     // Fetch all chats involving the user, ordered by the latest message timestamp
// //     const chats = await chatModel.findAll({
// //       where: {
// //         [Op.or]: [
// //           { fromId: id },
// //           { toId: id }
// //         ]
// //       },
// //       order: [
// //         ['time', 'DESC']  // Order by the timestamp of the latest message
// //       ]
// //     });

// //     // Create a Map to store the latest chat per user and unseen message count
// //     const latestChatsMap = new Map();

// //     chats.forEach(chat => {
// //       const otherUserId = chat.fromId === parseInt(id) ? chat.toId : chat.fromId;

// //       // Initialize the map with an object if it doesn't already exist
// //       if (!latestChatsMap.has(otherUserId)) {
// //         latestChatsMap.set(otherUserId, { chat, unseenCount: 0 });
// //       }

// //       // If chat is not yet seen and is from the other user, count it
// //       if (chat.seen === 0 && chat.toId === parseInt(id)) {
// //         const chatData = latestChatsMap.get(otherUserId);
// //         chatData.unseenCount += 1;
// //         latestChatsMap.set(otherUserId, chatData);
// //       }

// //       // Always update the latest chat for each user
// //       const chatData = latestChatsMap.get(otherUserId);
// //       chatData.chat = chat;
// //       latestChatsMap.set(otherUserId, chatData);
// //     });

// //     // Extract user IDs from the latest chats
// //     const userIdsArray = Array.from(latestChatsMap.keys());

// //     // Fetch user details based on unique user IDs
// //     const users = await adminModel.findAll({
// //       where: {
// //         id: {
// //           [Op.in]: userIdsArray
// //         }
// //       },
// //       // Order users based on the order of user IDs
// //       order: [
// //         [sequelize.fn('FIELD', sequelize.col('id'), ...userIdsArray)]
// //       ]
// //     });

// //     // Combine users with their respective unseen message count and latest text
// //     const usersWithLatestChatInfo = users.map(user => {
// //       const { chat, unseenCount } = latestChatsMap.get(user.id);
// //       return {
// //         ...user.toJSON(),  // Convert the Sequelize model instance to a plain object
// //         unseenMessages: unseenCount,
// //         latestText: chat.text,  // Include the latest text from the chat
// //       };
// //     });

// //     // Send the user details, unseen message counts, and latest text in the response
// //     res.send(usersWithLatestChatInfo);
// //   } catch (error) {
// //     console.error('Error fetching chat bar users:', error);
// //     res.status(500).send('Internal server error');
// //   }
// // }

// exports.GetChatBarUsers = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Fetch all chats involving the user, ordered by the latest message timestamp
//     const chats = await chatModel.findAll({
//       where: {
//         [Op.or]: [
//           { fromId: id },
//           { toId: id }
//         ]
//       },
//       order: [
//         ['time', 'DESC']  // Order by the timestamp of the latest message
//       ]
//     });

//     // Create a Map to store the latest chat per user and unseen message count
//     const latestChatsMap = new Map();

//     chats.forEach(chat => {
//       const otherUserId = chat.fromId === parseInt(id) ? chat.toId : chat.fromId;

//       // If there is already a chat stored for this user, compare timestamps to ensure the latest chat is kept
//       if (!latestChatsMap.has(otherUserId) || latestChatsMap.get(otherUserId).chat.time < chat.time) {
//         latestChatsMap.set(otherUserId, { chat, unseenCount: 0 });
//       }

//       // If chat is not yet seen and is from the other user, count it
//       if (chat.seen === 0 && chat.toId === parseInt(id)) {
//         const chatData = latestChatsMap.get(otherUserId);
//         chatData.unseenCount += 1;
//         latestChatsMap.set(otherUserId, chatData);
//       }
//     });

//     // Extract user IDs from the latest chats
//     const userIdsArray = Array.from(latestChatsMap.keys());

//     // Fetch user details based on unique user IDs
//     const users = await adminModel.findAll({
//       where: {
//         id: {
//           [Op.in]: userIdsArray
//         }
//       },
//       // Order users based on the order of user IDs
//       order: [
//         [sequelize.fn('FIELD', sequelize.col('id'), ...userIdsArray)]
//       ]
//     });

//     // Combine users with their respective unseen message count and latest text
//     const usersWithLatestChatInfo = users.map(user => {
//       const { chat, unseenCount } = latestChatsMap.get(user.id);
//       return {
//         ...user.toJSON(),  // Convert the Sequelize model instance to a plain object
//         unseenMessages: unseenCount,
//         latestText: chat.text,  // Include the latest text from the chat
//         latestChatTime: chat.time,  // Include the timestamp of the latest chat
//       };
//     });

//     // Send the user details, unseen message counts, and latest text in the response
//     res.send(usersWithLatestChatInfo);
//   } catch (error) {
//     console.error('Error fetching chat bar users:', error);
//     res.status(500).send('Internal server error');
//   }
// }



// exports.groupChat = async (req, res) => {
//   try {
//     const { creator, groupName, time } = req.body;
//     const usersID = JSON.parse(req.body.usersID); // Parse JSON string back to array
//     const groupImage = req.file; // This will have information about the uploaded file

//     const error =
//     validateName(groupName) ||
//     validateTime(time);
    
//     if (error) {
//       return res.status(400).json({
//         status: 400,
//         data: null,
//         message: error,
//       });
//     }

//     let imagePath = "http://localhost:5000/public/uploads/pfp/groupImage.png";
//     if (req.file) {
//       console.log("File received: ");
//       const photoFileName = req.file.filename;
//       console.log("PhotoFileName: ", photoFileName);
//       imagePath = `http://localhost:5000/public/uploads/pfp/${photoFileName}`;
//     }
//     const data = await db.groupChatModel.create({
//       creator: creator,
//       groupName: groupName,
//       time: time,
//       groupImage: imagePath
//     });
//     const groupId = data.id;

//     await db.groupUser.bulkCreate(
//       usersID.map((id) => ({ groupId, userId: id })),
//     );

//     res.status(200).json({ message: "Group created successfully!" });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ error: "Server error" });
//   }
// };exports.addGroupMember = async (req, res) => {
//   try {
//     const { groupId } = req.body;
//     let usersID = JSON.parse(req.body.userId); // Parse JSON string back to its original form

//     // Ensure usersID is an array
//     if (!Array.isArray(usersID)) {
//       usersID = [usersID]; // Convert single value to an array
//     }

//     console.log(groupId, usersID);

//     // Check for existing group members
//     const existingMembers = await db.groupUser.findAll({
//       where: {
//         groupId: groupId,
//         userId: usersID
//       }
//     });

//     // Filter out already existing members
//     const existingUserIds = existingMembers.map(member => member.userId);
//     const newUserIds = usersID.filter(userId => !existingUserIds.includes(userId));

//     // Add only new users
//     if (newUserIds.length > 0) {
//       const membersToAdd = newUserIds.map(userId => ({ groupId, userId }));

//       await db.groupUser.bulkCreate(membersToAdd);
//     }

//     res.status(200).json({ message: "Group member(s) added successfully!" });
//   } catch (error) {
//     console.error(error); // Log error details for debugging
//     res.status(500).json({ error: "Server error" });
//   }
// }

// exports.getGroups = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const groups = await db.groupChatModel.findAll({
//       where: {
//         creator: id,
//       },
//       order: [['createdAt', 'DESC']] 
//     });
    
//     // console.log('Groups:', groups);

//     const groupIds = groups.map(group => group.id);
//     const groupUsers = await db.groupUser.findAll({
//       where: {
//         groupId: {
//           [Op.in]: groupIds
//         }
//       }
//     });
    
//     const groupUsersData = await db.groupUser.findAll({
//       where: {
//         userId: id,
//       },
//       order: [['createdAt', 'DESC']] 
//     });
    
//     const userGroupID = groupUsersData.map(group => group.groupId);

//     const getUserGroup = await db.groupChatModel.findAll({
//       where: {
//         id: userGroupID
        
//       }
//     });
   


//     // console.log('GroupUsers:', groupUsers);

//     const data = {
//       groups,
//       groupUsers,
//       getUserGroup
//     }
//     res.send(data);
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ error: "Server error" });
//   }
// }

// exports.getGroupsChat = async (req, res) => {
//   try {
//     const { id } = req.params;

//     console.log("id: " , id);
    
//     // Fetch the specific group based on the provided ID
//     const group = await db.groupChatModel.findOne({
//       where: {
//         id: id
//       }
//     });

//     // If no group is found, return a 404 error
//     if (!group) {
//       return res.status(404).json({ error: "Group not found" });
//     }

//     // console.log('Group:', group);

//     // Fetch all users in the found group
//     const groupUsers = await db.groupUser.findAll({
//       where: {
//         groupId: group.id
//       }
//     });
//     const creatorId = group.creator;
//     const creator = await db.adminModel.findOne({
//       where: {
//         id: creatorId
//       }
//     })
//     const userIds = groupUsers.map(user => user.userId);
//     const users = await db.adminModel.findAll({
//       where: {
//         id: {
//           [Op.in]: userIds
//         }
//       }
//     });

//     console.log('GroupUsers:', groupUsers);

//     // Prepare the data to be sent back
//     const data = {
//       group,
//       groupUsers:users,
//       creator
//     }

//     // Send the response
//     res.send(data);

//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ error: "Server error" });
//   }
// }

// exports.getChattingById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     console.log("id: ", id);

//     // Fetch the specific group based on the provided ID
//     const group = await db.groupUserChatting.findAll({
//       where: {
//         groupId: id
//       }
//     });
//     if (!group || group.length === 0) {
//       return res.status(404).json({ error: "Group not found" });
//     }

//     const fromIds = group.map(chat => chat.fromId);

//     const users = await db.adminModel.findAll({ 
//       where: {
//         id: fromIds
//       }
//     });

//     if (!users || users.length === 0) {
//       return res.status(404).json({ error: "Users not found" });
//     }

//     // Map users to their respective IDs for easy lookup
//     const userMap = users.reduce((acc, user) => {
//       acc[user.id] = user;
//       return acc;
//     }, {});

//     // Attach user details to each message
//     const messagesWithUserDetails = group.map(chat => ({
//       ...chat.dataValues, // Copy all message properties
//       user: userMap[chat.fromId] // Attach the user details based on fromId
//     }));

//     res.send({ data: messagesWithUserDetails });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ error: "Server error" });
//   }
// }


// exports.updateGcName = async (req, res) => {
//   const { groupName, id } = req.body;
//   console.log("groupName, id: ", groupName, id);
  
//   if (!groupName || !id) {
//     return res.status(400).json({ error: 'Group name and ID are required' });
//   }

//   try {
//     // Update the group name in your database
//      await db.groupChatModel.update(
//       { groupName: groupName },
//       { where: { id } }
//     )

 
//     res.status(200).json({ message: 'Group name updated successfully' });
//   } catch (error) {
//     console.error('Error updating group name:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }

// }
// exports.updateGcPfp = async (req, res) => {
//   const { id } = req.body;
//   const file = req.file;

//   console.log("id: ", id , "file: ", file);
  

//   if (!id) {
//     return res.status(400).json({ error: 'Group ID is required' });
//   }
//   if (!file) {
//     return res.status(400).json({ error: 'File is required' });
//   }

//   try {
//     let imagePath = "http://localhost:5000/public/uploads/pfp/groupImage.png";

//     if (file) {
//       console.log("File received: ");
//       const photoFileName = file.filename;
//       console.log("PhotoFileName: ", photoFileName);
//       imagePath = `http://localhost:5000/public/uploads/pfp/${photoFileName}`;
//     }

//     await db.groupChatModel.update(
//       { groupImage: imagePath },
//       { where: { id: id } }
//     );

//     res.status(200).json({ message: 'Profile picture updated successfully' });
//   } catch (error) {
//     console.error('Error updating profile picture:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// }


// exports.deleteGroup = async (req, res) => {
//   const { id } = req.params;

//   if (!id) {
//     return res.status(400).json({ error: 'Group ID is required' });
//   }

//   try {
//     await db.groupChatModel.destroy({
//       where: {
//         id: id
//       }
//     });

//     await db.groupUser.destroy({
//       where: {
//         groupId: id
//       }
//     })

//     await db.groupUserChatting.destroy({
//       where: {
//         groupId: id
//       }
//     })
//     res.status(200).json({ message: 'Group deleted successfully' });
//   } catch (error) {
//     console.error('Error deleting group:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// }