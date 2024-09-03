// routes/project.js
const express = require("express");
const router = express.Router();
const projectController = require('../controllers/projectcontroller');
const mediaUpload = require("../middlewares/Mediaproject");

// router.post("/addProject", projectController.projectData);
router.get("/getAllProject", projectController.getAllProjects);
router.post("/addProject", projectController.projectData);
router.put("/editProject/:id", projectController.editProjectData);
router.delete("/deleteProject/:id", projectController.deleteProject);
router.get("/getProject/:id", projectController.getProjectById);
router.put("/editStatus/:id", projectController.updateStatus);
router.put("/editPriority/:id", projectController.updatePriority);
router.post("/addMedia/:id", mediaUpload, projectController.addMedia);
router.get("/getMedia/:id", projectController.getMedia);
router.delete("/deleteMedia/:id", projectController.deleteMedia);
router.post("/favProject/", projectController.favProject);
router.delete("/favProject/", projectController.deleteFavProject);
router.get("/getFavProject/", projectController.getFavProject);
router.get("/getFavProjectId/", projectController.getFavProjectByID);
router.get("/filter", projectController.getFilterProject);
router.get("/filter/:id", projectController.getMemberFilterProject);
router.get("/filterByDate/", projectController.getFilterByDate);
router.get("/projectStats/", projectController.projectStats);


// For Members

router.get("/getAllMemberProjects/:id", projectController.getAllMemberProjects);
router.get("/projectStatsofMember/:id", projectController.projectStatsofMember);

module.exports = router;



// const express = require("express");
// const router = express.Router();
// const projectController = require('../controllers/projectcontroller');
// const mediaUpload = require("../middlewares/Mediaproject");

// // router.post("/addProject", projectController.projectData);
// router.get("/getAllProject", projectController.getAllProjects);
// router.post("/addProject", (req, res) => {
//   projectController.projectData(req, res);
// });
// router.put("/editProject/:id", projectController.editProjectData);
// router.delete("/deleteProject/:id", projectController.deleteProject);
// router.get("/getProject/:id", projectController.getProjectById);
// router.put("/editStatus/:id", projectController.updateStatus);
// router.put("/editPriority/:id", projectController.updatePriority);
// router.put("/editPriority/:id", projectController.updatePriority);
// router.post("/addMedia/:id",mediaUpload ,  projectController.addMedia);

// module.exports = router;



// const express = require("express");
// const router = express.Router();
// const projectController = require('../controllers/projectcontroller');


// router.get("/getAllProject", projectController.getAllProjects);
// router.post("/addProject", projectController.addProject);
// router.put("/editProject/:id", projectController.updateProject);
// router.delete("/deleteProject/:id", projectController.deleteProject);
// router.get("/getProject/:id", projectController.getProjectById);

// module.exports = router;
