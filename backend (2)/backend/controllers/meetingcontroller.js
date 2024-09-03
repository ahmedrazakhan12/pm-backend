const db = require("../models/index");
require("dotenv").config();

const meetingModel = db.Meeting;
const meetingUser = db.MeetingUser;
const adminModel = db.adminModel;
const {
    validateTitle,
    validateDate,
    validateUserId,
    validateTime,
    validateLink
  } = require("../middlewares/Projectvalidation");

exports.addMeeting = async (req, res) => {
  try {
    const { title, date, time, creator, userIds , link} = req.body;
    const error =
    validateTitle(title) ||
    validateDate(date) ||
    validateUserId(userIds) ||
    validateLink(link) ||
    validateTime(time);
    
    if (error) {
      return res.status(400).json({
        status: 400,
        data: null,
        message: error,
    });
}

    console.log("Logging: ",  title, date, time, creator, userIds );
    const newMeeting = await meetingModel.create({
     title: title,
     date: date,
     time: time,
     link: link,
     creator: creator,
    });

    await meetingUser.bulkCreate(userIds.map((userId) => ({ meetingId: newMeeting.id, userId: userId })));
    
    console.log(newMeeting);
    

    res.status(200).send("Meeting successfully added.");
    
  }
  catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

exports.getMeeting = async (req, res) => {
  try {
    const meetings = await meetingModel.findAll({
      order: [['createdAt', 'DESC']] // Sort by createdAt in descending order
    });
    

    const data = await Promise.all(meetings.map(async (item) => {
      const user = await meetingUser.findAll({ where: { meetingId: item.id } });
      const creator = await adminModel.findOne({ where: { id: item.creator } });

      const userIds = user.map((user) => user.userId);

      const users = await adminModel.findAll({ where: { id: userIds } });

      return {
        meetings: item,
        users: users,
        creator:creator
      };
    }))

    res.status(200).json(data);

  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

exports.getMemberMeeting = async (req, res) => {
  try {
    const { id } = req.params;

    // Step 1: Find all meeting IDs where the user is a participant
    const meetingUsers = await meetingUser.findAll({ where: { userId: id } });
    const meetingIds = meetingUsers.map(entry => entry.meetingId);

    if (meetingIds.length === 0) {
      // No meetings associated with this user ID
      return res.status(200).json([]);
    }

    // Step 2: Fetch meetings based on the filtered meeting IDs
    const meetings = await meetingModel.findAll({
      where: { id: meetingIds },
      order: [['createdAt', 'DESC']], // Sort by createdAt in descending order
    });

    // Step 3: Fetch and enrich the meeting data
    const data = await Promise.all(meetings.map(async (item) => {
      // Fetch all users associated with the meeting
      const meetingUsers = await meetingUser.findAll({ where: { meetingId: item.id } });
      const userIds = meetingUsers.map((user) => user.userId);
      const users = await adminModel.findAll({ where: { id: userIds } });

      // Fetch the creator of the meeting
      const creator = await adminModel.findOne({ where: { id: item.creator } });

      return {
        meetings: item,
        users: users,
        creator: creator
      };
    }));

    // Step 4: Return the filtered and enriched meeting data
    res.status(200).json(data);

  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};



exports.getMeetingById = async (req, res) => {
    try {
        const { id } = req.params;
        const meetings = await meetingModel.findAll({ where: { id: id } });
    
        const data = await Promise.all(meetings.map(async (item) => {
          const user = await meetingUser.findAll({ where: { meetingId: item.id } });
          const creator = await adminModel.findOne({ where: { id: item.creator } });
    
          const userIds = user.map((user) => user.userId);
    
          const users = await adminModel.findAll({ where: { id: userIds } });
    
          return {
            meetings: item,
            users: users,
            creator:creator
          };
        }))
    
        res.status(200).json(data);
    
      } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
      }
}


exports.EditMeetingById = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, date, time,  userIds , deleteUsers ,link } = req.body;
        const error =
        validateTitle(title) ||
        validateDate(date) ||
        validateUserId(userIds) ||
        validateLink(link) ||
        validateTime(time);
        
        if (error) {
          return res.status(400).json({
            status: 400,
            data: null,
            message: error,
        }); 
          }
    
        console.log("Edit Logging: ", id , title, date, time,userIds, deleteUsers ,link );
          
        await meetingModel.update({ title: title, date: date, time: time , link: link}, { where: { id: id } });
        await meetingUser.bulkCreate(userIds.map((userId) => ({ meetingId: id, userId: userId })));
        await meetingUser.destroy({ where: { meetingId: id, userId: deleteUsers } });
        res.status(200).send("Meeting successfully updated.");
    
    }
    catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
    }
}

exports.deleteMeeting = async (req, res) => {
    try {
        const { id } = req.params;
        await meetingModel.destroy({ where: { id: id } });
        await meetingUser.destroy({ where: { meetingId: id } });
        res.status(200).send("Meeting successfully deleted.");
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
}

const { Op } = require("sequelize");

exports.searchMeeting = async (req, res) => {
  try {
    const { value } = req.params;

    if (!value) {
      return res.status(400).json({
        status: 400,
        data: null,
        message: "Please provide a value to search",
      });
    }
    console.log(value);
    

    const meetings = await meetingModel.findAll({ where: { title: { [Op.like]: `%${value}%` } } });
    const data = await Promise.all(meetings.map(async (item) => {
      const user = await meetingUser.findAll({ where: { meetingId: item.id } });
      const creator = await adminModel.findOne({ where: { id: item.creator } });

      const userIds = user.map((user) => user.userId);

      const users = await adminModel.findAll({ where: { id: userIds } });

      return {
        meetings: item,
        users: users,
        creator:creator
      };
    }))
    res.status(200).json(data);
    console.log(data);
    
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

exports.upcommingMeetings = async (req, res) => {
  try {
    const now = new Date();
    const upcomingMeetings = await meetingModel.findAll({
      where: {
        date: {
          [Op.gte]: now.toISOString().split('T')[0] // Date comparison
        },
        time: {
          [Op.gte]: now.toTimeString().split(' ')[0] // Time comparison
        }
      },
      order: [['date', 'ASC'], ['time', 'ASC']], // Order by date and time
    });
    res.json(upcomingMeetings);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}



exports.upcommingMeetingsofMember = async (req, res) => {
  try {

    const { id } = req.params;

    // Step 1: Find all meeting IDs where the user is a participant
    const meetingUsers = await meetingUser.findAll({ where: { userId: id } });
    const meetingIds = meetingUsers.map(entry => entry.meetingId);

    if (meetingIds.length === 0) {
      // No meetings associated with this user ID
      return res.status(200).json([]);
    }

  
    const now = new Date();
    const upcomingMeetings = await meetingModel.findAll({
      where: {
        id: meetingIds , 
        date: {
          [Op.gte]: now.toISOString().split('T')[0] // Date comparison
        },
        time: {
          [Op.gte]: now.toTimeString().split(' ')[0] // Time comparison
        }
      },
      order: [['date', 'ASC'], ['time', 'ASC']], // Order by date and time
    });
    res.json(upcomingMeetings);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}