const express = require("express");
const router = express.Router();
const projectPriorityController = require('../controllers/projectprioritycontroller');


router.post("/addPriority", projectPriorityController.addPriority);
router.get("/getAllPriorities", projectPriorityController.getAllPriorities);
router.put("/editPriority/:id", projectPriorityController.updatePriority);
router.delete("/deletePriority/:id", projectPriorityController.deletePriority);
router.get("/getPriority/:id", projectPriorityController.getPriorityById);

module.exports = router;
