const express = require("express");
const router = express.Router();
const generalController = require("../controllers/Generalcontroller");
const upload = require("../middlewares/GeneralMulter");

router.put("/logo", upload, generalController.logo);
router.put("/favicon", upload, generalController.favicon);

router.get("/logos",  generalController.getLogos);

module.exports = router;
