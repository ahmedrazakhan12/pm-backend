const express = require("express");
const router = express.Router();
const projectStatusController = require('../controllers/projectstatuscontroller');


router.post("/addStatus", projectStatusController.addStatus);
router.get("/getAllStatus", projectStatusController.getAllStatus);
router.put("/editStatus/:id", projectStatusController.updateStatus);
router.delete("/deleteStatus/:id", projectStatusController.deleteStatus);
router.get("/getStatus/:id", projectStatusController.getStatusById);

module.exports = router;
