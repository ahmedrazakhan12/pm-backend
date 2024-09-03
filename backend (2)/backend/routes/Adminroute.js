const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admincontroller");
const verifyToken = require("../middlewares/Verifytoken");
const multer = require("../middlewares/Multer");

router.post("/login", adminController.adminLogin);
router.get("/decodedToken", verifyToken, adminController.adminData);
router.get("/adminInfo", adminController.adminInfo);
router.put("/editProfile", adminController.adminEditPfpImage);
router.put("/adminSingleProfile/:id", multer, adminController.adminSingleProfilePicUpdate);
router.post("/register", multer, adminController.adminRegister);
router.put("/changePassword", adminController.superAdminChangePassword);
router.get("/team", adminController.getAllAdmins);
router.get("/deletedTeam", adminController.getAllDeletedAdmins);
router.put("/restore/:id", adminController.restore);
router.get("/team/:id", adminController.getAdminById);
router.delete("/delete/:id", adminController.adminDelete);
router.put("/changeAdminPassword/:id", adminController.adminChangePassword);
router.get("/search/:key", adminController.adminSearch);
// router.put("/imageDel/:id"  , adminController.imageDel);

// router.post("/verifyToken", );

module.exports = router;
