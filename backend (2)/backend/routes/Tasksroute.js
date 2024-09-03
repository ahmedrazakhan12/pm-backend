const express = require("express");
const router = express.Router();
const taskController = require('../controllers/taskcontroller');
const mediaUpload = require("../middlewares/Mediaproject");


router.get("/getAllTasks/:id", taskController.getAllTask);
router.get("/tasks", taskController.tasks);
router.get("/Mtasks/:id", taskController.Mtasks);
router.post("/addTask", taskController.addTask);
router.put("/editTask/:id", taskController.updateTask);
router.put("/editStatus/:id", taskController.updateStatus);
router.put("/editPriority/:id", taskController.updatePriority);
router.put("/editPriorityInGroup/:id", taskController.editPriorityInGroup);
router.put("/editStatusInGroup/:id", taskController.editStatusInGroup);

router.delete("/deleteTask/:id", taskController.deleteTask);
router.get("/getTask/:id", taskController.getTaskById);
router.post("/addMedia/:id", mediaUpload, taskController.addMedia);
router.get("/getMedia/:id", taskController.getMedia);
router.delete("/deleteMedia/:id", taskController.deleteMedia);
router.get("/filter", taskController.getFilterProject);
router.get("/filter/:id", taskController.getFilterProjectMember);
router.post("/addTaskTime", taskController.taskTime);
router.get("/getTaskTime/:taskId", taskController.getTaskTime);
router.delete("/deleteUserTime/:id", taskController.deleteTaskTime);
router.get("/taskStats/", taskController.taskStats);
router.get("/taskStatsofMember/:id", taskController.taskStatsofMember);


module.exports = router;
