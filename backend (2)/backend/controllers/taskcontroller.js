const db = require("../models/index");
const taskModel = db.taskModel;
const taskUsersModel = db.taskUsersModel;
const adminModel = db.adminModel;
const statusModel = db.projectStatusModel
const {
  validateTitle,
  validateDescription,
  validateStatus,
  validatePriority,
  validateBudget,
  validateDate,
  validateUserId,
  validateTags,

} = require("../middlewares/Projectvalidation");

  exports.addTask = async (req, res) => {
  try {
    const { 
      taskName,
      taskDescription,
      status,
      priority,
      startAt,
      endAt,
      usersID,
      note,
      projectName,
      projectId
    } = req.body;


    console.log("projectId" , projectId);

    const error =
    validateTitle(taskName) ||
    validateDescription(taskDescription) ||
    validateStatus(status) ||
    validatePriority(priority) ||
    validateDate(startAt) ||
    validateDate(endAt) ||
    // validateDescription(note) ||
    validateUserId(usersID);

    if (error) {
      return res.status(400).json({
        status: 400,
        data: null,
        message: error,
      });
    }

    // Create the project
    const user = await taskModel.create({
      taskName:taskName,
      taskDescription:taskDescription,
      projectName:projectName,
      status:status,
      priority:priority,
      startAt:startAt,
      endAt:endAt,
      note:note,
      projectId:projectId,
    });

    const latestId = user.id;

    // Iterate over each userID and create a new entry in taskUsersModel
    const taskUserEntries = usersID.map(userId => ({
      taskId: latestId,
      userId: userId,
      projectId: projectId
    }));

    await taskUsersModel.bulkCreate(taskUserEntries);
    console.log("Done");
    res.status(200).send("Project successfully added.");

  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};
// Update Project
exports.updateTask = async (req, res) => {
  try {
    const {id} = req.params;
    const { 
      taskName,
      taskDescription,
      status,
      priority,
      startAt,
      endAt,
      usersID,
      note,
      deleteUsers,
      projectId
    } = req.body;

    console.log(
      "projectId",projectId
    );

    // Validate input
    const error =
      validateTitle(taskName) ||
      validateDescription(taskDescription) ||
      validateStatus(status) ||
      validatePriority(priority) ||
      validateDate(startAt) ||
      validateDate(endAt) ||
      // validateDescription(note) ||
      validateUserId(usersID);

    if (error) {
      return res.status(400).json({
        status: 400,
        data: null,
        message: error,
      });
    }

       
if (Array.isArray(deleteUsers) && deleteUsers.length > 0) {
  await taskUsersModel.destroy({
    where: {
      userId: deleteUsers, // This matches any userId in the deleteUsers array
      taskId: id // This matches the given projectId
    }
  });
}
    // Update the task
    await taskModel.update(
      {
        taskName: taskName,
        taskDescription: taskDescription,
        status: status,
        priority: priority,
        startAt: startAt,
        endAt: endAt,
        note: note,
      },
      {
        where: {
          id: id,  // ID of the task to update
        },
      }
    );

    

    // Create new task-user entries
    const taskUserEntries = usersID.map(userId => ({
      taskId: id,
      userId: userId,
      projectId: projectId
    }));

    await taskUsersModel.bulkCreate(taskUserEntries);


 




    res.status(200).send("Task successfully updated.");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};


// Delete Task
exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await taskModel.findOne({ where: { id: id } });
    if (!project) {
      return res.status(404).json({
        status: 404,
        data: null,
        message: "Project not found",
      });
    }

    // Delete the admin
    await taskModel.destroy({ where: { id: id } });
    await taskUsersModel.destroy({ where: { taskId: id } });
    await db.taskFilesModel.destroy({ where: { taskId: id } });
    await db.Taskworktime.destroy({ where: { taskId: id } });

    console.log("Project successfully deleted.");
    res.status(200).json({ message: "Project deleted successfully" });
    
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};


exports.getAllTask = async (req, res) => {
  try {
    const { id } = req.params;
  
    const tasks = await taskModel.findAll({
      where: { projectId: id },
    });
    const users = await taskUsersModel.findAll();
    const status = await statusModel.findAll();

       const data = await Promise.all(tasks.map(async (task) => {
      const filteredUsersIds = users.filter(user => user.taskId === task.id);
      const filteredStasus = status.filter(user => user.id === task.status);
      const filteredPriorities = status.filter(user => user.id === task.priority);
      const filteredUsers = await adminModel.findAll({ where: { id: filteredUsersIds.map(user => user.userId) } });

      return {
        task: task,
        users: filteredUsers,
        status: filteredStasus,
        priority: filteredPriorities
      };
    }));

    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}


exports.getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    // const { authorization: headerId } = req.headers; // Use 'authorization' for Authorization header
    // console.log("Headers: ", headerId);
    
    const tasks = await taskModel.findAll({ where: { id: id } });
    const users = await taskUsersModel.findAll({ where: { taskId: id } });
    const status = await statusModel.findAll();
    const project = await db.projectModel.findAll();

       const data = await Promise.all(tasks.map(async (task) => {
      const filteredUsersIds = users.filter(user => user.taskId === task.id);
      const filteredUsers = await adminModel.findAll({ where: { id: filteredUsersIds.map(user => user.userId)

       } 
    

      });

      const filteredProjectUsers = await db.projectUsersModel.findAll({ where: { projectId: task.projectId } });


      const filteredStasus = status.filter(user => user.id === task.status);
      const filteredPriorities = status.filter(user => user.id === task.priority);

      const filteredProjectCreator = project.find(project => project.id === task.projectId);

      return {
        task: task,
        users: filteredUsers,
        status: filteredStasus,
        priority: filteredPriorities,
        filteredProjectUsers:filteredProjectUsers,
        projectCreator: filteredProjectCreator
      };
    }));

    res.status(200).json(data)
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}


exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    console.log(id ,status);
    
    const error =
    validateStatus(status) ;

  if (error) {
    return res.status(400).json({
      status: 400,
      data: null,
      message: error,
    });
  }
    console.log(id ,status);
    await taskModel.update({ status: status }, { where: { projectId: id } });
    res.status(200).send("Status successfully updated.");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}
exports.editStatusInGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    console.log(id ,status);
    
    const error =
    validateStatus(status) ;

  if (error) {
    return res.status(400).json({
      status: 400,
      data: null,
      message: error,
    });
  }
    console.log(id ,status);
    await taskModel.update({ status: status }, { where: { id: id } });
    res.status(200).send("Status successfully updated.");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

exports.updatePriority = async (req, res) => {
  try {
    const { id } = req.params;
    const { priority } = req.body;

    const error =
    validateStatus(priority) ;

  if (error) {
    return res.status(400).json({
      status: 400,
      data: null,
      message: error,
    });
  }
    console.log(id ,priority);
    await taskModel.update({ priority: priority }, { where: { projectId: id } });
    res.status(200).send("priority successfully updated.");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}



exports.editPriorityInGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { priority } = req.body;

    const error =
    validateStatus(priority) ;

  if (error) {
    return res.status(400).json({
      status: 400,
      data: null,
      message: error,
    });
  }
    console.log(id ,priority);
    await taskModel.update({ priority: priority }, { where: { id: id } });
    res.status(200).send("priority successfully updated.");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}


const path = require('path');
const fs = require('fs');
const { uploadMedia } = require('../includes/uploads3'); // Adjust the path as needed
exports.addMedia = async (req, res) => {
  try {
    const { id } = req.params;
    const { taskId } = req.body;

    if (req.files && req.files.length > 0) {
      console.log("req.files: ", req.files);

      // Prepare media items for S3 upload
      const mediaItems = req.files.map(file => {
        const filePath = path.join(__dirname, '..', file.path); // Adjust path as needed
        const fileContent = fs.readFileSync(filePath);

        return {
          filename: file.filename,
          data: fileContent, // File content read from disk
          type: file.mimetype,
          projectId: id,
          taskId: taskId
        };
      });

      console.log("Files received: ", mediaItems);

      // Upload files to S3
      const s3Urls = await uploadMedia(mediaItems);

      // Check if all uploads were successful
      if (s3Urls && s3Urls.length === mediaItems.length) {
       
        const mediaFiles = mediaItems.map((item, index) => ({
          filename: item.filename,
          file: s3Urls[index], // Use the correct S3 URL for each file
          mimetype: item.type,
          projectId: id,
          taskId: taskId
        }));

        // Save file information to the database
        await db.taskFilesModel.bulkCreate(mediaFiles);
        console.log("Files uploaded and saved successfully");

        res.status(200).json({ message: "Files uploaded and saved successfully", files: mediaFiles });
      } else {
        res.status(500).json({ message: "Failed to upload all files to S3" });
      }
    } else {
      res.status(400).json({ message: "No files received" });
    }
  } catch (error) {
    console.error("Error in addMedia: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// exports.addMedia = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { taskId } = req.body;

//     if (req.files && req.files.length > 0) {
//       console.log("req.files: " , req.files)
//       // Prepare media items for S3 upload
//       const mediaItems = req.files.map(file => {
//         const filePath = path.join(__dirname, '..', file.path); // Adjust path as needed
//         const fileContent = fs.readFileSync(filePath);

//         return {
//           filename: file.filename,
//           data: fileContent, // File content read from disk
//           type: file.mimetype,
//           projectId: id,
//           taskId: taskId
//         };
//       });

//       console.log("Files received: ", mediaItems);

//       // Upload files to S3
//       const s3Urls = await uploadMedia(mediaItems);

//       // Check if all uploads were successful
//       if (s3Urls && s3Urls.length === mediaItems.length) {
       
//          const mediaFiles = mediaItems.map((item, index) => ({
//           filename: item.filename,
//           file: s3Urls[0], // Use the S3 URL
//           mimetype: item.type,
//           projectId: id,
//           taskId: taskId
//         }));

//         // Save file information to the database
//         await db.taskFilesModel.bulkCreate(mediaFiles);
//         console.log("Files uploaded and saved successfully");

//         res.status(200).json({ message: "Files uploaded and saved successfully", files: mediaFiles });
//       } else {
//         res.status(500).json({ message: "Failed to upload all files to S3" });
//       }
//     } else {
//       res.status(400).json({ message: "No files received" });
//     }
//   } catch (error) {
//     console.error("Error in addMedia: ", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };


// exports.addMedia = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const {taskId} = req.body;
//     if (req.files && req.files.length > 0) {
//       const mediaFiles = req.files.map(file => ({
//         filename: file.filename,
//         file: `http://localhost:5000/${file.path}`,
//         mimetype: file.mimetype,
//         projectId: id ,
//         taskId: taskId // Assuming you have a projectId field to relate to the project
//       }));

//       console.log("Files received: ", mediaFiles);

//       // Save files information to the database
//       await db.taskFilesModel.bulkCreate(mediaFiles);
//       console.log("Files uploaded and saved successfully: ");

//       res.status(200).json({ message: "Files uploaded and saved successfully", files: mediaFiles });
//     } else {
//       res.status(400).json({ message: "No files received" });
//     }
//   } catch (error) {
//     console.error("Error in addMedia: ", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };




exports.getMedia = async (req, res) => {
  try {
    const { id } = req.params;
    const { authorization: taskId } = req.headers;
    
    console.log("Headers: ", taskId , id);

    const media = await db.taskFilesModel.findAll({ 
      where: { 
        projectId: id, 
        taskId: taskId 
      } 
    });
    
    if (!media) {
      return res.status(404).json({
        status: 404,
        data: null,
        message: "Media not found",
      });
    }
    res.status(200).json(media);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}



exports.deleteMedia = async (req, res) => {
  try {
    const { id } = req.params;
    const media = await db.taskFilesModel.destroy({ where: { id: id } });
    if (!media) {
      return res.status(404).json({
        status: 404,
        data: null,
        message: "Media not found",
      });
    }
    res.status(200).json({ message: "Media deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}







exports.tasks = async (req, res) => {
  try {
  
    const tasks = await taskModel.findAll();
    const users = await taskUsersModel.findAll();
    const status = await statusModel.findAll();
    // const projectUsers = await db.projectUsersModel.findAll();

       const data = await Promise.all(tasks.map(async (task) => {
      const filteredUsersIds = users.filter(user => user.taskId === task.id);
      const filteredStasus = status.filter(user => user.id === task.status);
      const filteredPriorities = status.filter(user => user.id === task.priority);
      const filteredUsers = await adminModel.findAll({ where: { id: filteredUsersIds.map(user => user.userId) } });
      const filteredProjectUsers = await db.projectUsersModel.findAll({ where: { projectId: task.projectId } });


      return {
        task: task,
        users: filteredUsers,
        status: filteredStasus,
        priority: filteredPriorities,
        projectUsers: filteredProjectUsers
      };
    }));

    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}


exports.Mtasks = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch all task IDs associated with the user
    const userTasks = await taskUsersModel.findAll({
      where: { userId: id },
      attributes: ['taskId']
    });

    const taskIds = userTasks.map(userTask => userTask.taskId);

    // Fetch tasks that match the filtered task IDs
    const tasks = await taskModel.findAll({
      where: { id: taskIds }
    });

    const status = await statusModel.findAll();
    const users = await taskUsersModel.findAll();
    const allProjectUsers = await db.projectUsersModel.findAll();
    const projectmodel = await db.projectModel.findAll();

    const data = await Promise.all(tasks.map(async (task) => {
      const filteredUserIds = users.filter(user => user.taskId === task.id).map(user => user.userId);
      const filteredUsers = await adminModel.findAll({ where: { id: filteredUserIds } });
      const filteredStatus = status.filter(s => s.id === task.status);
      const filteredPriority = status.filter(s => s.id === task.priority);
      const filteredProjectUsers = allProjectUsers.filter(projectUser => projectUser.projectId === task.projectId);
      const filteredProjectCreator = projectmodel.find(project => project.id === task.projectId);
      return {
        task,
        users: filteredUsers,
        status: filteredStatus,
        priority: filteredPriority,
        projectUsers: filteredProjectUsers,
        projectCreator: filteredProjectCreator
      };
    }));

    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}


exports.getFilterCountProject = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("id: ", id);

    const tasks = await taskModel.findAll({ where: { projectId: id } });
    const status = await statusModel.findAll({where : {id : tasks.map(task => task.status)}});
    const result = {
      tasks: tasks.length,
      status: status
    }
    res.status(200).json({ count: result });

  }catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}



const { Op } = require("sequelize");

exports.getFilterProject = async (req, res) => {
  try {
    const { status, priority, search } = req.query;
    console.log(status, priority, search);

  
    let tasks;
  
    const users = await taskUsersModel.findAll();
    const statusDb = await statusModel.findAll();

    if (status) {
      tasks = await taskModel.findAll({ where: {status: status} });
    } else if (priority) {
      tasks = await taskModel.findAll({ where: {priority: priority} });
    } else if (search) {
      const users = await adminModel.findAll({   where: {
        [Op.or]: [{ name: { [Op.like]: `%${search}%` } }],
      },});
      const userId = await taskUsersModel.findAll({ where: {userId: users.map(user => user.id)} });
      tasks = await taskModel.findAll({ where: {id: userId.map(user => user.taskId)} });
      console.log(users);
    } else {
      tasks = await taskModel.findAll();
    } 


       const data = await Promise.all(tasks.map(async (task) => {
      const filteredUsersIds = users.filter(user => user.taskId === task.id);
      const filteredStasus = statusDb.filter(user => user.id === task.status);
      const filteredPriorities = statusDb.filter(user => user.id === task.priority);
      const filteredUsers = await adminModel.findAll({ where: { id: filteredUsersIds.map(user => user.userId) } });

      return {
        task: task,
        users: filteredUsers,
        status: filteredStasus,
        priority: filteredPriorities
      };
    }));

    let filteredData = data;

   

    res.status(200).json(filteredData);

  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

exports.getFilterProjectMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, priority, search } = req.query;

    // Step 1: Fetch task IDs associated with the given user ID
    const taskUsers = await taskUsersModel.findAll({ where: { userId: id } });
    const taskIds = taskUsers.map(entry => entry.taskId);

    if (taskIds.length === 0) {
      // No tasks associated with this user ID
      return res.status(200).json([]);
    }

    // Step 2: Build the filter object for tasks
    let taskFilter = { id: taskIds };

    if (status) {
      taskFilter.status = status;
    }

    if (priority) {
      taskFilter.priority = priority;
    }

    // Step 3: Fetch tasks based on the constructed filter
    let tasks = await taskModel.findAll({ where: taskFilter });

    // Step 4: Apply additional search filter if provided
    if (search) {
      const users = await adminModel.findAll({
        where: {
          [Op.or]: [{ name: { [Op.like]: `%${search}%` } }],
        },
      });
      const userIds = users.map(user => user.id);
      const userTaskEntries = await taskUsersModel.findAll({
        where: { userId: userIds },
      });
      const filteredTaskIds = userTaskEntries.map(entry => entry.taskId);
      tasks = tasks.filter(task => filteredTaskIds.includes(task.id));
    }

    // Step 5: Fetch related data for the filtered tasks
    const statusDb = await statusModel.findAll();
    const users = await taskUsersModel.findAll();
    const projectmodel = await db.projectModel.findAll();

    // Step 6: Enrich tasks with related data
    const enrichedTasks = await Promise.all(tasks.map(async (task) => {
      const taskUsers = users.filter(user => user.taskId === task.id);
      const taskUsersData = await adminModel.findAll({ where: { id: taskUsers.map(user => user.userId) } });
      const taskStatus = statusDb.filter(status => status.id === task.status);
      const taskPriority = statusDb.filter(priority => priority.id === task.priority);
      const filteredProjectCreator = projectmodel.find(project => project.id === task.projectId);

      return {
        task: task,
        users: taskUsersData,
        status: taskStatus,
        priority: taskPriority, 
        projectCreator: filteredProjectCreator
      };
    }));

    res.status(200).json(enrichedTasks);

  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const cron = require('node-cron');

exports.taskTime = async (req, res) => {
  try{
    const {userId , taskId, hour, min ,date , projectId} = req.body;
    console.log("userId , taskId, hour, min ,date , projectId"  , userId , taskId, hour, min ,date , projectId);
    
    const taskTime = await db.Taskworktime.create({
      userId,
      taskId,
      hour,
      min,
      date,
      projectId
    })

    

    res.status(200).json(taskTime);

  }catch(error){
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}
exports.getTaskTime = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { page = 1, limit = 10 } = req.query; // Default to page 1 and 10 items per page

    if (!taskId) {
      return res.status(400).json({
        error: "Task ID is required",
      });
    }

    const offset = (page - 1) * limit;

    const result = await db.Taskworktime.findAll({
      where: {
        taskId: taskId,
      },
      order: [['updatedAt', 'DESC']], // Sort by most recent update
      limit: parseInt(limit), // Limit number of records
      offset: parseInt(offset), // Skip certain number of records
    });

    // Fetch user data for each userId found in the result
    const userIds = result.map((item) => item.userId);
    const userData = await db.adminModel.findAll({
      where: {
        id: userIds,
      },
    });

    // Create a map for quick user lookup
    const userMap = userData.reduce((acc, user) => {
      acc[user.id] = user;
      return acc;
    }, {});

    // Attach user data to each result entry
    const resultWithUserData = result.map((item) => ({
      ...item.toJSON(), // Convert sequelize instance to plain object
      userData: userMap[item.userId] || [], // Attach user data or null if not found
    }));

    // Send the result to the frontend
    res.status(200).json({
      result: resultWithUserData,
      currentPage: parseInt(page), // Current page number
      totalPages: Math.ceil(result.count / limit), // Calculate total number of pages
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// exports.getTaskTime = async (req, res) => {
//   try {
//     const { taskId } = req.params;
    
//     if (!taskId) {
//       return res.status(400).json({
//         error: "Task ID is required",
//       });
//     }

//     const result = await db.Taskworktime.findAll({
//       where: {
//         taskId: taskId,
//       },
//       order: [['updatedAt', 'DESC']], // Sort by most recent update
//     });

//     // Fetch user data for each userId found in the result
//     const userIds = result.map((item) => item.userId);
//     const userData = await db.adminModel.findAll({
//       where: {
//         id: userIds,
//       },
//     });

//     // Create a map for quick user lookup
//     const userMap = userData.reduce((acc, user) => {
//       acc[user.id] = user;
//       return acc;
//     }, {});

//     // Attach user data to each result entry
//     const resultWithUserData = result.map((item) => ({
//       ...item.toJSON(), // Convert sequelize instance to plain object
//       userData: userMap[item.userId] || [], // Attach user data or null if not found
//     }));

//     // Send the result to the frontend
//     res.status(200).json({
//       result: resultWithUserData,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

// exports.getTaskTime = async (req, res) => {
//   try {
//     const { taskId } = req.params;

//     // Fetch all records that match the taskId
//     const workTimes = await db.Taskworktime.findAll({
//       where: {
//         taskId: taskId,
//       },
//       order: [['updatedAt', 'DESC']], // Sort by most recent update
//     });

//     // Create a map to store total hours, minutes, and last updated time for each user
//     const userTimes = {};

//     workTimes.forEach((workTime) => {
//       const userId = workTime.userId;

//       // Initialize the user time if not already done
//       if (!userTimes[userId]) {
//         userTimes[userId] = {
//           totalHours: 0,
//           totalMinutes: 0,
//           lastUpdated: workTime.updatedAt, // Initialize with the current workTime updatedAt
//         };
//       }

//       // Add the hours and minutes to the user's total
//       userTimes[userId].totalHours += workTime.hour;
//       userTimes[userId].totalMinutes += workTime.min;

//       // Update the last updated time if this workTime is more recent
//       if (workTime.updatedAt > userTimes[userId].lastUpdated) {
//         userTimes[userId].lastUpdated = workTime.updatedAt;
//       }
//     });

//     // Format the time for each user and handle minute overflow
//     const result = await Promise.all(
//       Object.keys(userTimes).map(async (userId) => {
//         let { totalHours, totalMinutes, lastUpdated } = userTimes[userId];

//         // Handle overflow of minutes to hours
//         totalHours += Math.floor(totalMinutes / 60);
//         totalMinutes = totalMinutes % 60;

//         // Format the time as "HH:MM"
//         const formattedTime = `${totalHours}:${totalMinutes.toString().padStart(2, '0')}`;

//         // Separate the date and time
//         const lastUpdatedDate = lastUpdated.toISOString().substring(0, 10); // "YYYY-MM-DD"
//         const lastUpdatedTime = lastUpdated.toISOString().substring(11, 19); // "HH:MM:SS"

//         // Fetch user data
//         const userData = await adminModel.findOne({
//           where: {
//             id: userId
//           }
//         });

//         return {
//           userData,
//           totalTime: formattedTime,
//           lastUpdatedDate,  // Separate date
//           lastUpdatedTime,  // Separate time
//         };
//       })
//     );

//     // Send the result to the frontend
//     res.status(200).json({
//       result,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };


exports.deleteTaskTime = async (req, res) => {
  try {
    const { id } = req.params;

    await db.Taskworktime.destroy({
      where: {
        id: id
      }
    });
    res.status(200).json({ message: "Task time deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}





const { Sequelize } = require('sequelize');

exports.taskStats = async (req, res) => {
  try {
    // Group by status and count the occurrences
    const statusCounts = await taskModel.findAll({
      attributes: [
        'status',
        [Sequelize.fn('COUNT', Sequelize.col('status')), 'count']
      ],
      group: ['status']
    });

    res.status(200).json(statusCounts);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

exports.taskStatsofMember = async (req, res) => {
  try {
    // Group by status and count the occurrences
    const { id } = req.params;

    // Fetch all task IDs associated with the user
    const userTasks = await taskUsersModel.findAll({
      where: { userId: id },
      attributes: ['taskId']
    });

    const taskIds = userTasks.map(userTask => userTask.taskId);

    const statusCounts = await taskModel.findAll({
      where: { id: taskIds } ,
      attributes: [
        'status',
        [Sequelize.fn('COUNT', Sequelize.col('status')), 'count']
      ],
      group: ['status']
    });

    res.status(200).json(statusCounts);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};
const dayjs = require('dayjs');
const relativeTime = require('dayjs/plugin/relativeTime');

// Extend dayjs to use relativeTime
dayjs.extend(relativeTime);
exports.getComments = async (req, res) => {
  try {
    const { taskId, activeId } = req.query;
    console.log("taskId, activeId", taskId, activeId);
    
    if (!taskId) {
      return res.status(400).json({ error: 'TaskId is required' });
    }

    if (!activeId) {
      return res.status(400).json({ error: 'ActiveId is required' });
    }

    // Fetch all records that match the taskId and contain activeId in usersIds array
    const comments = await db.taskCommentsModel.findAll({
      where: {
        taskId: taskId,
        [Sequelize.Op.and]: [
          Sequelize.literal(`JSON_CONTAINS(usersIds, '[${activeId}]')`)
        ]
      },
    });

    // Optionally format the time (if necessary)
    const formattedComments = comments.map(comment => ({
      ...comment.dataValues,
      timeAgo: dayjs(comment.time).fromNow(),
    }));

    res.status(200).json(formattedComments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error' });
  }
};



// exports.getTaskTime = async (req, res) => {
//   try {
//     const { taskId } = req.params;

//     // Fetch all records that match the taskId
//     const workTimes = await db.Taskworktime.findAll({
//       where: {
//         taskId: taskId,
//       },
//       order: [['updatedAt', 'DESC']], // Sort by most recent update
//     });

//     // Create a map to store total hours and minutes for each user
//     const userTimes = {};

//     // Find the latest updated timestamp
//     const lastUpdatedTime = workTimes.length > 0 ? workTimes[0].updatedAt : new Date();

//     workTimes.forEach((workTime) => {
//       const userId = workTime.userId;

//       // Initialize the user time if not already done
//       if (!userTimes[userId]) {
//         userTimes[userId] = {
//           totalHours: 0,
//           totalMinutes: 0,
//         };
//       }

//       // Add the hours and minutes to the user's total
//       userTimes[userId].totalHours += workTime.hour;
//       userTimes[userId].totalMinutes += workTime.min;
//     });

//     // Format the time for each user and handle minute overflow
//     const result = await Promise.all(
//       Object.keys(userTimes).map(async (userId) => {
//         let { totalHours, totalMinutes } = userTimes[userId];

//         // Handle overflow of minutes to hours
//         totalHours += Math.floor(totalMinutes / 60);
//         totalMinutes = totalMinutes % 60;

//         // Format the time as "HH:MM"
//         const formattedTime = `${totalHours}:${totalMinutes.toString().padStart(2, '0')}`;

//         // Fetch user data
//         const userData = await adminModel.findOne({
//           where: {
//             id: userId
//           }
//         });

//         return {
//           userData,
//           totalTime: formattedTime,
//         };
//       })
//     );

//     // Format last updated time as "YYYY-MM-DD HH:MM:SS"
//     const lastUpdatedFormatted = lastUpdatedTime.toISOString().replace('T', ' ').substring(0, 19);

//     // Send the result to the frontend
//     res.status(200).json({
//       result,
//       lastUpdated: lastUpdatedFormatted,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };


// exports.getTaskTime = async (req, res) => {
//   try {
//     const { taskId } = req.params;

//     // Fetch all records that match the taskId
//     const workTimes = await db.Taskworktime.findAll({
//       where: {
//         taskId: taskId,
//       },
//     });

//     // Create a map to store total hours and minutes for each user
//     const userTimes = {};

//     workTimes.forEach((workTime) => {
//       const userId = workTime.userId;

//       // Initialize the user time if not already done
//       if (!userTimes[userId]) {
//         userTimes[userId] = {
//           totalHours: 0,
//           totalMinutes: 0,
//         };
//       }

//       // Add the hours and minutes to the user's total
//       userTimes[userId].totalHours += workTime.hour;
//       userTimes[userId].totalMinutes += workTime.min;
//     });

//     // Format the time for each user and handle minute overflow
//     const result = await Promise.all(
//       Object.keys(userTimes).map(async (userId) => {
//         let { totalHours, totalMinutes } = userTimes[userId];

//         // Handle overflow of minutes to hours
//         totalHours += Math.floor(totalMinutes / 60);
//         totalMinutes = totalMinutes % 60;

//         // Format the time as "HH:MM"
//         const formattedTime = `${totalHours}:${totalMinutes.toString().padStart(2, '0')}`;

//         // Fetch user data
//         const userData = await adminModel.findOne({
//           where: {
//             id: userId
//           }
//         });

//         return {
//           userData,
//           totalTime: formattedTime,
//         };
//       })
//     );

//     // Send the result to the frontend
//     res.status(200).json({
//        result,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

