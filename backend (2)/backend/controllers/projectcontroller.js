const db = require("../models/index");
const projectModel = db.projectModel;
const projectUsersModel = db.projectUsersModel;
const adminModel = db.adminModel;
const projectTagsModel = db.projectTagsModel;
const projectStatusModel = db.projectStatusModel;
const projectFilesModel = db.projectFilesModel
const taskModel = db.taskModel;
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
const { taskUsersModel } = require("../models/taskUsersModel");
const { taskFilesModel } = require("../models/Taskfilemodel");



exports.projectData = async (req, res) => {
  try {
    const { 
      projectName, 
      projectDescription, 
      status, 
      priority, 
      budget, 
      startAt, 
      endAt, 
      usersID, 
      tags, 
      note, 
      username, 
      activeId 
    } = req.body;

    console.log("status: ", status);
    console.log("priority: ", status);
    const tagsArray = tags.map(tag => tag.name);



    const error =
    validateTitle(projectName) ||
    validateDescription(projectDescription) ||
    validateStatus(status) ||
    validatePriority(priority) ||
    validateBudget(budget) ||
    validateDate(startAt) ||
    validateTags(tagsArray) ||
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
    const user = await projectModel.create({
      creator: activeId,
      projectName,
      projectDescription,
      status,
      priority,
      budget,
      startAt,
      endAt,
      note,
    });

    const latestId = user.id;

    const existingEntries = await projectUsersModel.findAll({
      where: {
        projectId: latestId,
      },
      attributes: ['userId']
    });
    
    // Extract existing user IDs
    const existingUserIds = existingEntries.map(entry => entry.userId);
    
    // Filter out user IDs that are already associated with the project
    const newUsersId = usersID.filter(userId => !existingUserIds.includes(userId));
    
    // Create new entries for users that are not yet associated with the project
    const projectUserEntries = newUsersId.map(userId => ({
      projectId: latestId,
      userId: userId,
    }));
    
    // Bulk create new entries
    await projectUsersModel.bulkCreate(projectUserEntries);
    // const existingEntries = await projectUsersModel.findAll({
    //   where: {
    //     projectId: latestId,
    //   },
    // });
    
    
    // // Iterate over each userID and create a new entry in projectUsersModel
    // const projectUserEntries = usersID.map(userId => ({
    //   projectId: latestId,
    //   userId: userId,
    // }));

    // await projectUsersModel.bulkCreate(projectUserEntries);


    const projectTagsEntries = tags.map(tags => ({
      projectId: latestId,
      tagName: tags.name,
      tagColor: tags.colorName,
    }));

    await projectTagsModel.bulkCreate(projectTagsEntries);

    // Emit the project addition event to all connected clients
    
    console.log("Done");

    res.status(200).send("Project successfully added.");

  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}



exports.editProjectData = async (req, res) => {
  const { id } = req.params;
  try {
    const { 
      projectName, 
      projectDescription, 
      status, 
      priority, 
      budget, 
      startAt, 
      endAt, 
      usersID, 
      tags, 
      note, 
      username, 
      activeId ,
      deleteUsers,
      deleteTags
    } = req.body;

    const tagsArray = tags.map(tag => tag.name);

    // console.log("tags: " ,tagsArray );
    console.log("deleteUsers: ", deleteUsers);

    const error =
    validateTitle(projectName) ||
    validateDescription(projectDescription) ||
    validateStatus(status) ||
    validatePriority(priority) ||
    validateBudget(budget) ||
    validateDate(startAt) ||
    validateDate(endAt) ||
    validateTags(tagsArray);
    // validateDescription(note);
    // validateUserId(usersID)

    if (error) {
      return res.status(400).json({
        status: 400,
        data: null,
        message: error,
      });
    }


    if (Array.isArray(deleteUsers) && deleteUsers.length > 0) {
      await projectUsersModel.destroy({
        where: {
          userId: deleteUsers, // This matches any userId in the deleteUsers array
          projectId: id // This matches the given projectId
        }
      });

      await taskUsersModel.destroy({
        where: {
          userId: deleteUsers, // This matches any userId in the deleteUsers array
          projectId: id // This matches the given projectId
        }
      });
    }
    
    
    
    if (Array.isArray(deleteTags) && deleteTags.length > 0) {
      await projectTagsModel.destroy({
        where: { id: deleteTags }
      });
    }
    // Create the project
    await projectModel.update(
      {
      projectName,
      projectDescription,
      status,
      priority,
      budget,
      startAt,
      endAt,
      note,
    },
    {
      where: {
        id: id
      }
    });

    const latestId = id;

   
   
    const projectUserEntries = usersID.map(userId => ({
      projectId: latestId,
      userId: userId,
  }));
  await Promise.all(
    projectUserEntries.map(async (entry) => {
        try {
            const [updatedCount] = await projectUsersModel.create(
                entry
            );

            // if (updatedCount === 0) {
            //     // Entry doesn't exist, create it
            //     await projectUsersModel.create(entry);
            //     console.log(`Created entry for userId: ${entry.userId}`);
            // } else {
            //     console.log(`Updated entry for userId: ${entry.userId}`);
            // }
        } catch (error) {
            console.error(`Error processing userId ${entry.userId}:`, error);
        }
    })
);
  


// console.log("tags02: ", tags);


const projectTagsEntries = tags.map(tag => ({
  projectId: latestId,
  tagName: tag.name,
  tagColor:tag.colorName,


}));
await Promise.all(
projectTagsEntries.map(async (entry) => {
    try {
        const [updatedCount] = await projectTagsModel.update(
            { projectId: entry.projectId },
            { where: { tagName: entry.tagName , tagColor: entry.tagColor } }
        );

        if (updatedCount === 0) {
            // Entry doesn't exist, create it
            await projectTagsModel.create(entry);
            console.log(`Created entry for userId: ${entry.tagName}`);
        } else {
            console.log(`Updated entry for userId: ${entry.tagName}`);
        }
    } catch (error) {
        console.error(`Error processing userId ${entry.tagName}:`, error);
    }
})
);




    
    res.status(200).send("Project successfully added.");

  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}


// Delete Project
exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("ID: ", id);

    const project = await projectModel.findOne({ where: { id: id } });
    if (!project) {
      return res.status(404).json({
        status: 404,
        data: null,
        message: "Project not found",
      });
    }

    // Delete the admin
    await projectModel.destroy({ where: { id: id } });
    await projectUsersModel.destroy({ where: { projectId: id } });
    await projectFilesModel.destroy({ where: { projectId: id } });
    await db.favoriteProjectModel.destroy({ where: { projectId: id } });
    await projectTagsModel.destroy({ where: { projectId: id } });
    await taskFilesModel.destroy({ where: { projectId: id } });
    await taskModel.destroy({ where: { projectId: id } });
    await taskUsersModel.destroy({ where: { projectId: id } });

    console.log("Project successfully deleted.");
    res.status(200).json({ message: "Project deleted successfully" });
    
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};


// exports.getAllProjects = async (req, res) => {
//   try {
//     const projects = await projectModel.findAll();
//     const users = await projectUsersModel.findAll();
//     const tags = await projectTagsModel.findAll();
//     const status = await projectStatusModel.findAll();
//     const creator = await adminModel.findAll();
//     const tasks = await taskModel.findAll();

//     const data = await Promise.all(projects.map(async (project) => {
//       const filteredUsersIds = users.filter(user => user.projectId === project.id);
//       const filteredCreatorIds = creator.filter(creator => creator.id === project.creator );
//       const filteredUsers = await adminModel.findAll({ where: { id: filteredUsersIds.map(user => user.userId) } });
//       const filteredStasus = status.filter(user => user.id === project.status);
//       const filteredPriorities = status.filter(user => user.id === project.priority);
//       const filteredTags = tags.filter(tag => tag.projectId === project.id);
//       const filterTasks = tasks.filter(task => task.projectId === project.id);

//       return {
//         project: project,
//         creator: filteredCreatorIds,
//         users: filteredUsers,
//         tags: filteredTags,
//         status:filteredStasus,
//         priority:filteredPriorities,
//         tasks:filterTasks
        
//       };
//     }));

//     res.status(200).json(data);
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Internal Server Error");
//   }
// }

exports.getAllProjects = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query; // Get page and limit from query params
    const offset = (page - 1) * limit;

    // Fetch the projects with pagination
    const projects = await projectModel.findAndCountAll({
      limit: parseInt(limit),
      offset: offset,
    });

    // Fetch related data as before
    const users = await projectUsersModel.findAll();
    const tags = await projectTagsModel.findAll();
    const status = await projectStatusModel.findAll();
    const creator = await adminModel.findAll();
    const tasks = await taskModel.findAll();

    const data = await Promise.all(projects.rows.map(async (project) => {
      const filteredUsersIds = users.filter(user => user.projectId === project.id);
      const filteredCreatorIds = creator.filter(creator => creator.id === project.creator);
      const filteredUsers = await adminModel.findAll({ where: { id: filteredUsersIds.map(user => user.userId) } });
      const filteredStasus = status.filter(user => user.id === project.status);
      const filteredPriorities = status.filter(user => user.id === project.priority);
      const filteredTags = tags.filter(tag => tag.projectId === project.id);
      const filterTasks = tasks.filter(task => task.projectId === project.id);
      const taskUsersIds = await taskUsersModel.findAll({ where: { projectId: project.id } });
      const filteredTaskUsers = await adminModel.findAll({ where: { id: taskUsersIds.map(user => user.userId) } });
      
      const userMap = filteredTaskUsers.reduce((map, user) => {
        map[user.id] = user.dataValues;
        return map;
      }, {});
      
      // Attach users to each task
      
      const tasksWithUsers = await Promise.all(filterTasks.map(async task => {
        const allTask = task;
        const status = await projectStatusModel.findOne({ where: { id: task.status } });
                const taskData = {
          ...allTask.dataValues, // Spread the properties of dataValues into taskData
          status: status // Add the status object directly
        };


        // Filter the users associated with the current task
        const taskUserIds = taskUsersIds.filter(taskUser => taskUser.taskId === task.id).map(taskUser => taskUser.userId);
      
        // Fetch worktime data for all users in the current task
        const taskWorktime = await db.Taskworktime.findAll({ where: { taskId: task.id, userId: taskUserIds } });
      
        // Create a map of user worktimes for easier lookup
        const worktimeMap = taskWorktime.reduce((map, worktime) => {
          const { userId } = worktime;
          if (!map[userId]) {
            map[userId] = [];
          }
          map[userId].push(worktime);
          return map;
        }, {});
      
        // Attach user details to the task
        const taskUsers = taskUserIds.map(userId => ({
          ...userMap[userId],
          worktime: worktimeMap[userId] || [] // Attach worktime for each user
        }));
      
        // Return a simplified task object with users
        return {
          task: taskData,
          users: taskUsers
        };
      }));
      

      
      return {
        project: project,
        creator: filteredCreatorIds,
        users: filteredUsers,
        tags: filteredTags,
        status: filteredStasus,
        priority: filteredPriorities,
        tasks: tasksWithUsers,
        // filteredTaskUsers:filteredTaskUsers
      };
    }));

    res.status(200).json({
      data: data,
      totalItems: projects.count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(projects.count / limit)
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}



exports.getAllMemberProjects = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch all project IDs associated with the user
    const userProjects = await projectUsersModel.findAll({
      where: { userId: id },
      attributes: ['projectId']
    });

    const users = await projectUsersModel.findAll();

    const projectIds = userProjects.map(userProject => userProject.projectId);

    // Fetch projects that match the filtered project IDs
    const projects = await projectModel.findAll({
      where: { id: projectIds }
    });

    const tags = await projectTagsModel.findAll();
    const status = await projectStatusModel.findAll();
    const creators = await adminModel.findAll();
    const tasks = await taskModel.findAll();

    const data = await Promise.all(projects.map(async (project) => {
      const filteredCreator = creators.filter(creator => creator.id === project.creator);
      const filteredUsersIds = users.filter(user => user.projectId === project.id);

      const filteredUsers = await adminModel.findAll({ where: { id: filteredUsersIds.map(user => user.userId)  } });
      const filteredStatus = status.filter(s => s.id === project.status);
      const filteredPriority = status.filter(s => s.id === project.priority);
      const filteredTags = tags.filter(tag => tag.projectId === project.id);
      const filteredTasks = tasks.filter(task => task.projectId === project.id);

      return {
        
        project:project,
        creator: filteredCreator,
        users: filteredUsers,
        tags: filteredTags,
        status: filteredStatus,
        priority: filteredPriority,
        tasks: filteredTasks
      };
    }));

    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}



exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
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
    await projectModel.update({ status: status }, { where: { id: id } });
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
    await projectModel.update({ priority: priority }, { where: { id: id } });
    res.status(200).send("Status successfully updated.");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

exports.getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await projectModel.findOne({ where: { id: id } });
    const status = await projectStatusModel.findAll();
    const creator = await adminModel.findAll();
    if (!project) {
      return res.status(404).json({
        status: 404,
        data: null,
        message: "Project not found",
      });
    }

    const users = await projectUsersModel.findAll({ where: { projectId: id } });
    const userIds = users.map(user => user.userId); // Assuming userId is a property of each user
    const filteredStasus = status.filter(user => user.id === project.status);
    const filteredPriorities = status.filter(user => user.id === project.priority);    
    const createrData = creator.filter(user => user.id === project.creator );
    const userData = await adminModel.findAll({
      where: {
        id: userIds,
      },
    });

    const Tags = await projectTagsModel.findAll({ where: { projectId: id } });

    const userTag = Tags.map(user => user); // Assuming userId is a property of each user
        
 
    const data = [{
      project: project,
      creator: createrData,
      users: userData,
      tags : userTag,
      status:filteredStasus,
      priority:filteredPriorities
    }];
    
    

    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}


// controllers/projectcontroller.js
const path = require('path');
const fs = require('fs');
const { uploadMedia } = require('../includes/uploads3');

exports.addMedia = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.files && req.files.length > 0) {
      const mediaFiles = [];

      for (let file of req.files) {
        // Read file content from disk
        const filePath = path.join(__dirname, '..', file.path);
        const fileContent = fs.readFileSync(filePath);

        // Prepare mediaItem for S3 upload
        const mediaItem = {
          filename: file.filename,
          data: fileContent,  // File content read from disk
          type: file.mimetype,
        };

        // Upload the file to S3
        const s3Urls = await uploadMedia([mediaItem]);

        if (s3Urls && s3Urls.length > 0) {
          const mediaFile = {
            filename: file.filename,
            file: s3Urls[0],  // S3 URL
            mimetype: file.mimetype,
            projectId: id,  // Assuming you have a projectId field to relate to the project
          };
          mediaFiles.push(mediaFile);
        } else {
          return res.status(500).json({ message: "Failed to upload image to S3" });
        }
      }

      console.log("Files received and uploaded: ", mediaFiles);

      // Save files information to the database
      await projectFilesModel.bulkCreate(mediaFiles);
      console.log("Files uploaded and saved successfully");

      res.status(200).json({ message: "Files uploaded and saved successfully", files: mediaFiles });
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
//     if (req.files && req.files.length > 0) {
//       const mediaFiles = req.files.map(file => ({
//         filename: file.filename,
//         file: `http://localhost:5000/${file.path}`,
//         mimetype: file.mimetype,
//         projectId: id  // Assuming you have a projectId field to relate to the project
//       }));

      
//       console.log("Files received: ", mediaFiles);

//       // Save files information to the database
//       await projectFilesModel.bulkCreate(mediaFiles);
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
    const media = await projectFilesModel.findAll({ where: { projectId: id } });
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
    console.log("deleteMedia: " , id);
    
    const media = await db.projectFilesModel.destroy({ where: { id: id } });
    if (!media) {
      console.log("Media not found");
      
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





exports.favProject = async (req, res) => {
  try {
    const { userId , projectId } = req.body;
    console.log(userId , projectId);

    await db.favoriteProjectModel.create({  userId: userId , projectId: projectId });
    res.status(200).send("Fav successfully updated.");
    console.log("fav successfully updated.");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}



exports.deleteFavProject = async (req, res) => {
  try {
    const { userId , projectId } = req.body;
    console.log(userId , projectId);
    await db.favoriteProjectModel.destroy({ where: { userId: userId , projectId: projectId } });
    res.status(200).send("Fav successfully updated.");
    console.log("fav successfully updated.");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
} 

exports.getFavProject = async (req, res) => {
  try {
    const { id } = req.query; // Get id from query parameters
    console.log(id);
    if (!id) {
      return res.status(404).json({
        status: 404,
        data: null,
        message: "Please log in first!",
      });
    }
    const projectId = await db.favoriteProjectModel.findAll({ where: { userId: id } });
    const projects = await projectModel.findAll({where : { id: projectId.map(project => project.projectId) } });

    if (!projects) {
      return res.status(404).json({
        status: 404,
        data: null,
        message: "Projects not found",
      });
    }
    const users = await projectUsersModel.findAll();
    const tags = await projectTagsModel.findAll();
    const status = await projectStatusModel.findAll();
    const creator = await adminModel.findAll();
    const tasks = await taskModel.findAll();

    const data = await Promise.all(projects.map(async (project) => {
      const filteredUsersIds = users.filter(user => user.projectId === project.id);
      const filteredCreatorIds = creator.filter(creator => creator.id === project.creator );
      const filteredUsers = await adminModel.findAll({ where: { id: filteredUsersIds.map(user => user.userId) } });
      const filteredStasus = status.filter(user => user.id === project.status);
      const filteredPriorities = status.filter(user => user.id === project.priority);
      const filteredTags = tags.filter(tag => tag.projectId === project.id);
      const filterTasks = tasks.filter(task => task.projectId === project.id);

      return {
        projectId : projectId,
        project: project,
        creator: filteredCreatorIds,
        users: filteredUsers,
        tags: filteredTags,
        status:filteredStasus,
        priority:filteredPriorities,
        tasks:filterTasks
        
      };
    }));

    res.status(200).json(data);
  

  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};






exports.getFavProjectByID = async (req, res) => {
  try {
    const { id } = req.query;
    console.log(id);
    if (!id) {
      return res.status(404).json({
        status: 404,
        data: null,
        message: "Please log in first!",
      });
    }
    const result = await db.favoriteProjectModel.findAll({ where: { userId: id } });

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};
const { Op } = require("sequelize");

exports.getFilterProject = async (req, res) => {
  try {
    const { status, priority, search } = req.query;
    console.log(status, priority, search);

  
    let projects;
    if (status) {
      projects = await projectModel.findAll({ where: {status: status} });
    } else if (priority) {
      projects = await projectModel.findAll({ where: {priority: priority} });
    } else if (search) {
      const users = await adminModel.findAll({   where: {
        [Op.or]: [{ name: { [Op.like]: `%${search}%` } }],
      },});
      const userId = await projectUsersModel.findAll({ where: {userId: users.map(user => user.id)} });
      projects = await projectModel.findAll({ where: {id: userId.map(user => user.projectId)} });
      console.log(users);
    } else {
      projects = await projectModel.findAll();
    } 

    const users = await projectUsersModel.findAll();
    const tagsModel = await projectTagsModel.findAll();
    const statusModel = await projectStatusModel.findAll();
    const creator = await adminModel.findAll();
    const tasks = await taskModel.findAll();

    const data = await Promise.all(projects.map(async (project) => {
      const filteredUsersIds = users.filter(user => user.projectId === project.id);
      const filteredCreatorIds = creator.filter(creator => creator.id === project.creator);
      const filteredUsers = await adminModel.findAll({ where: { id: filteredUsersIds.map(user => user.userId) } });
      const filteredStatus = statusModel.filter(user => user.id === project.status);
      const filteredPriorities = statusModel.filter(user => user.id === project.priority);
      const filteredTags = tagsModel.filter(tag => tag.projectId === project.id);
      const filterTasks = tasks.filter(task => task.projectId === project.id);
      const taskUsersIds = await taskUsersModel.findAll({ where: { projectId: project.id } });
      const filteredTaskUsers = await adminModel.findAll({ where: { id: taskUsersIds.map(user => user.userId) } });
      
      const userMap = filteredTaskUsers.reduce((map, user) => {
        map[user.id] = user.dataValues;
        return map;
      }, {});
      
      // Attach users to each task
      
      const tasksWithUsers = await Promise.all(filterTasks.map(async task => {
        const allTask = task;
        const status = await projectStatusModel.findOne({ where: { id: task.status } });
                const taskData = {
          ...allTask.dataValues, // Spread the properties of dataValues into taskData
          status: status // Add the status object directly
        };


        // Filter the users associated with the current task
        const taskUserIds = taskUsersIds.filter(taskUser => taskUser.taskId === task.id).map(taskUser => taskUser.userId);
      
        // Fetch worktime data for all users in the current task
        const taskWorktime = await db.Taskworktime.findAll({ where: { taskId: task.id, userId: taskUserIds } });
      
        // Create a map of user worktimes for easier lookup
        const worktimeMap = taskWorktime.reduce((map, worktime) => {
          const { userId } = worktime;
          if (!map[userId]) {
            map[userId] = [];
          }
          map[userId].push(worktime);
          return map;
        }, {});
      
        // Attach user details to the task
        const taskUsers = taskUserIds.map(userId => ({
          ...userMap[userId],
          worktime: worktimeMap[userId] || [] // Attach worktime for each user
        }));
      
        // Return a simplified task object with users
        return {
          task: taskData,
          users: taskUsers
        };
      }));
      return {
        project: project,
        creator: filteredCreatorIds,
        users: filteredUsers,
        tags: filteredTags,
        status: filteredStatus,
        priority: filteredPriorities,
        tasks: tasksWithUsers
      };
    }));

    let filteredData = data;

   

    res.status(200).json(filteredData);

  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};


exports.getMemberFilterProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, priority, search } = req.query;

    // Step 1: Fetch project IDs associated with the given user ID
    const projectUsers = await projectUsersModel.findAll({ where: { userId: id } });
    const projectIds = projectUsers.map(entry => entry.projectId);

    if (projectIds.length === 0) {
      // No projects associated with this user ID
      return res.status(200).json([]);
    }

    // Step 2: Build the filter object for projects
    let projectFilter = { id: projectIds };

    if (status) {
      projectFilter.status = status;
    }

    if (priority) {
      projectFilter.priority = priority;
    }

    // Step 3: Fetch projects based on the constructed filter
    let projects = await projectModel.findAll({ where: projectFilter });

    // Step 4: Apply additional search filter if provided
    if (search) {
      const users = await adminModel.findAll({
        where: {
          [Op.or]: [{ name: { [Op.like]: `%${search}%` } }],
        },
      });
      const userIds = users.map(user => user.id);
      const userProjectEntries = await projectUsersModel.findAll({
        where: { userId: userIds },
      });
      const filteredProjectIds = userProjectEntries.map(entry => entry.projectId);
      projects = projects.filter(project => filteredProjectIds.includes(project.id));
    }

    // Step 5: Fetch related data for the filtered projects
    const users = await projectUsersModel.findAll();
    const tagsModel = await projectTagsModel.findAll();
    const statusModel = await projectStatusModel.findAll();
    const creators = await adminModel.findAll();
    const tasks = await taskModel.findAll();

    // Step 6: Enrich projects with related data
    const enrichedProjects = await Promise.all(projects.map(async (project) => {
      const projectUsers = users.filter(user => user.projectId === project.id);
      const projectCreator = creators.filter(creator => creator.id === project.creator);
      const projectUsersData = await adminModel.findAll({ where: { id: projectUsers.map(user => user.userId) } });
      const projectStatus = statusModel.filter(status => status.id === project.status);
      const projectPriority = statusModel.filter(priority => priority.id === project.priority);
      const projectTags = tagsModel.filter(tag => tag.projectId === project.id);
      const projectTasks = tasks.filter(task => task.projectId === project.id);

      return {
        project: project,
        creator: projectCreator,
        users: projectUsersData,
        tags: projectTags,
        status: projectStatus,
        priority: projectPriority,
        tasks: projectTasks
      };
    }));

    res.status(200).json(enrichedProjects);

  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};


exports.getFilterByDate = async (req, res) => {
  try {
    const { startDate, endDate, status, priority, search } = req.query;

    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter = {
        createdAt: {
          ...(startDate && { [Op.gte]: new Date(startDate) }),
          ...(endDate && { [Op.lte]: new Date(endDate) })
        }
      };
    }

    let projects;
    if (status) {
      projects = await projectModel.findAll({ where: { status: status, ...dateFilter } });
    } else if (priority) {
      projects = await projectModel.findAll({ where: { priority: priority, ...dateFilter } });
    } else if (search) {
      const users = await adminModel.findAll({
        where: {
          [Op.or]: [{ name: { [Op.like]: `%${search}%` } }],
        },
      });
      const userId = await projectUsersModel.findAll({ where: { userId: users.map(user => user.id) } });
      projects = await projectModel.findAll({ where: { id: userId.map(user => user.projectId), ...dateFilter } });
      console.log(users);
    } else {
      projects = await projectModel.findAll({ where: dateFilter });
    }

    const users = await projectUsersModel.findAll();
    const tagsModel = await projectTagsModel.findAll();
    const statusModel = await projectStatusModel.findAll();
    const creator = await adminModel.findAll();
    const tasks = await taskModel.findAll();

    const data = await Promise.all(projects.map(async (project) => {
      const filteredUsersIds = users.filter(user => user.projectId === project.id);
      const filteredCreatorIds = creator.filter(creator => creator.id === project.creator);
      const filteredUsers = await adminModel.findAll({ where: { id: filteredUsersIds.map(user => user.userId) } });
      const filteredStatus = statusModel.filter(user => user.id === project.status);
      const filteredPriorities = statusModel.filter(user => user.id === project.priority);
      const filteredTags = tagsModel.filter(tag => tag.projectId === project.id);
      const filterTasks = tasks.filter(task => task.projectId === project.id);
      const taskUsersIds = await taskUsersModel.findAll({ where: { projectId: project.id } });
      const filteredTaskUsers = await adminModel.findAll({ where: { id: taskUsersIds.map(user => user.userId) } });
      
      const userMap = filteredTaskUsers.reduce((map, user) => {
        map[user.id] = user.dataValues;
        return map;
      }, {});
      
      // Attach users to each task
      
      const tasksWithUsers = await Promise.all(filterTasks.map(async task => {
        const allTask = task;
        const status = await projectStatusModel.findOne({ where: { id: task.status } });
                const taskData = {
          ...allTask.dataValues, // Spread the properties of dataValues into taskData
          status: status // Add the status object directly
        };


        // Filter the users associated with the current task
        const taskUserIds = taskUsersIds.filter(taskUser => taskUser.taskId === task.id).map(taskUser => taskUser.userId);
      
        // Fetch worktime data for all users in the current task
        const taskWorktime = await db.Taskworktime.findAll({ where: { taskId: task.id, userId: taskUserIds } });
      
        // Create a map of user worktimes for easier lookup
        const worktimeMap = taskWorktime.reduce((map, worktime) => {
          const { userId } = worktime;
          if (!map[userId]) {
            map[userId] = [];
          }
          map[userId].push(worktime);
          return map;
        }, {});
      
        // Attach user details to the task
        const taskUsers = taskUserIds.map(userId => ({
          ...userMap[userId],
          worktime: worktimeMap[userId] || [] // Attach worktime for each user
        }));
      
        // Return a simplified task object with users
        return {
          task: taskData,
          users: taskUsers
        };
      }));
      
      return {
        project: project,
        creator: filteredCreatorIds,
        users: filteredUsers,
        tags: filteredTags,
        status: filteredStatus,
        priority: filteredPriorities,
        tasks: tasksWithUsers
      };
    }));

    res.status(200).json(data);

  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};




const { Sequelize } = require('sequelize');

exports.projectStats = async (req, res) => {
  try {
    // Group by status and count the occurrences
    const statusCounts = await projectModel.findAll({
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

exports.projectStatsofMember = async (req, res) => {
  try {
    const { id } = req.params;
    // Group by status and count the occurrences

    // Fetch all project IDs associated with the user
    const userProjects = await projectUsersModel.findAll({
      where: { userId: id },
      attributes: ['projectId']
    });

    const projectIds = userProjects.map(userProject => userProject.projectId);

    const statusCounts = await projectModel.findAll({
      where: { id: projectIds },
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
}

// exports.addProject = async (req, res) => {
//   try {
//     const { projectName, projectDescription, status, priority, budget, startAt, endAt,  tag, note, username, activeId } = req.body; // Make sure username is included
//     console.log(projectName, projectDescription, status, priority, budget, startAt, endAt,  tag, note, username, activeId );

    

//     await projectModel.create({
//       projectName: projectName,
//       projectDescription: projectDescription,
//       status: status,
//       priority: priority,
//       budget: budget,
//       startAt: startAt,
//       endAt: endAt,
//       note: note,
//     });

//     // Emit the project addition event to all connected clients

//     req.io.emit('projectAdded', notification);

//     // Log the notification
//     console.log('Notification sent:', notification);

//     res.status(200).send("Project successfully added.");
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Internal Server Error");
//   }
// };


// exports.addProject = async (req, res) => {
//   try {
//     const { projectName, projectDescription, status } = req.body;
//     console.log(projectName, projectDescription, status);

//     const error =
//       validateTitle(projectName) ||
//       validateDescription(projectDescription) ||
//       validateStatus(status);
//     if (error) {
//       return res.status(400).json({
//         status: 400,
//         data: null,
//         message: error,
//       });
//     }

//     await projectModel.create({
//       projectName: projectName,
//       projectDescription: projectDescription,
//       status: status,
//     });
//     res.status(200).send("Project successfully added.");
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Internal Server Error");
//   }
// };

// Update Project
// exports.updateProject = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { projectName, projectDescription, status } = req.body;

//     const error =
//       validateTitle(projectName) ||
//       validateDescription(projectDescription) ||
//       validateStatus(status);
//     if (error) {
//       return res.status(400).json({
//         status: 400,
//         data: null,
//         message: error,
//       });
//     }

//     await projectModel.update(
//       {
//         projectName: projectName,
//         projectDescription: projectDescription,
//         status: status,
//       },
//       {
//         where: {
//           id: id,
//         },
//       }
//     );
//     res.status(200).send("Project successfully updated.");
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Internal Server Error");
//   }
// };
