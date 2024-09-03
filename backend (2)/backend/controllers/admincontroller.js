const db = require("../models/index");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const privateKey = "panel123";
const adminModel = db.adminModel;
const {uploadMedia} = require("../includes/uploads3");



const fs = require('fs');
const path = require('path');



const {
  validateName,
  validateEmail,
  validateContact,
  validatePassword,
  validateCountry,
  validatePostalCode,
  validateCity,
  validateAddress,
  validateDescription,
  validateStatus,
} = require("../middlewares/Validate");

exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    // console.log("Email:", email, "Password:", password);
    const emailError = validateEmail(email);
    // const passwordError = validatePassword(password);

    if (emailError) {
      return res.status(400).json({
        status: 400,
        data: null,
        message: emailError,
      });
    }

    const user = await adminModel.findOne({  where: { 
      email: email,
      deleted: 0 // Ensure the user is not deleted
    } });

    if (!user) {
      return res.status(400).json({
        status: 400,
        data: null,
        message: "Invalid Credentials.",
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (isPasswordMatch) {
      // console.log("Password matched. Successfully logged in!");

      const token = jwt.sign(
        { id: user.id, name: user.name, email: user.email },
        privateKey,
        { expiresIn: "30d" }
      );

      res.status(200).json({
        status: 200,
        data: { id: user.id, name: user.name, email: user.email },
        token: token,
        message: "User logged in successfully",
      });
    } else {
      console.log("Password does not match!");
      res.status(400).json({
        status: 400,
        data: null,
        message: "Invalid Credentials.",
      });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      status: 500,
      data: null,
      message: "Internal server error.",
    });
  }
};
exports.adminData = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(400).json({
        status: 400,
        message: "Error receiving data from decoded token.",
      });
    }

    res.send({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      pfpImage: req.user.pfpImage,
      description: req.user.description,
    });
  } catch (error) {
    console.error("Error receiving data from decoded token:", error);
    res.status(500).json({
      status: 500,
      data: null,
      message: "Internal server error.",
    });
  }
};

// Controller function to handle edit profile

// Controller function to handle edit profile picture
// controllers/adminController.js
// controllers/adminController.js
// const upload = require("../middlewares/Multer");
// const multer = require("multer");
// controllers/adminController.js

exports.adminEditPfpImage = async (req, res) => {
  try {
    const {
      id,
      name,
      email,
      contact,
      description,
      country,
      postalCode,
      role,
      address,
    } = req.body;
    

    console.log(
      // id,
      // name,
      // email,
      // contact,
      // description,
      // country,
      // postalCode,
      role,
      // address,
    );
    const nameError = validateName(name);
    const emailError = validateEmail(email);
    const contactError = validateContact(contact);
    const countryError = validateCountry(country);
    const postalCodeError = validatePostalCode(postalCode);
    const addressError = validateAddress(address);
    const validateDescriptionError = validateDescription(description);
    const validateStatusError = validateStatus(role);
    if (
      nameError ||
      emailError ||
      contactError ||
      countryError ||
      postalCodeError ||
      addressError ||
      validateDescriptionError ||
      validateStatusError
    ) {
      return res.status(400).json({
        status: 400,
        data: null,
        message:
          nameError ||
          emailError ||
          contactError ||
          validateDescriptionError ||
          countryError ||
          postalCodeError ||
          addressError ||
          validateStatusError,
      });
    }

    await adminModel.update(
      {
        name: name,
        email: email,
        contact: contact,
        description: description,
        country: country,
        postalCode: postalCode,
        role: role,
        address: address,
      },
      {
        where: {
          id: id,
        },
      }
    );

    res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Error in editing profile:", error);
    res.status(500).json({ message: "Failed to update profile" });
  }
};

// Import adminModel from Sequelize setup (assuming Sequelize is correctly configured)
exports.adminInfo = async (req, res) => {
  try {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    const admin = await adminModel.findOne({
      where: { id: authorizationHeader },
    });

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.status(200).json(admin); // Send admin data response
  } catch (error) {
    console.error("Error in fetching admin info:", error);
    res.status(500).json({ message: "Failed to fetch admin info" });
  }
};

const bcrypt = require("bcryptjs"); // Import bcryptjs for password hashing

const sendMail = require("../middlewares/Sendemail");
// Register Admin
exports.adminRegister = async (req, res) => {
  try {
    const {
      name,
      email,
      contact,
      address,
      postalCode,
      password,
      description,
      role,
      country,
      confirmPassword
    } = req.body;
    console.log(
      "Data: ",
      name,
      email,
      contact,
      address,
      description,
      postalCode,
      password,
      role,
      confirmPassword,
      country
    );

    const nameError = validateName(name);
    const emailError = validateEmail(email);
    const contactError = validateContact(contact);
    const validateStatusError = validateStatus(role);
    const addressError = validateAddress(address);
    const descriptionError = validateDescription(description);
    const countryError = validateCountry(country);
    const postalCodeError = validatePostalCode(postalCode);
    const passwordError = validatePassword(password , confirmPassword);
    if (
      nameError ||
      emailError ||
      contactError ||
      validateStatusError ||
      passwordError ||
      descriptionError ||
      countryError ||
      postalCodeError ||
      addressError 
    ) {
      return res.status(400).json({
        status: 400,
        data: null,
        message:
          nameError ||
          emailError ||
          contactError ||
      descriptionError ||
      countryError ||
          postalCodeError ||
          addressError ||
          passwordError ||
          validateStatusError,
      });
    }
    const imageIs = req.body.pfpImage;
    console.log(imageIs);
    let imagePath = "https://project-mgt.s3.ap-southeast-2.amazonaws.com/image/1725366025376-avatar.jpg";


    // Check if req.file exists (new profile picture uploaded)
    if (req.file) {
      console.log("File received: ");
      // const photoFileName = req.file.filename;
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

   
    const hashedPassword = await bcrypt.hash(password, 10); // Hash password with bcrypt

    // Create admin record
    await adminModel.create({
      name: name,
      email: email,
      contact: contact,
      address: address,
      postalCode: postalCode,
      description: description,
      country: country,
      pfpImage: imagePath,
      password: hashedPassword, // Store hashed password
      role: role,
    });
    const text = `Enter this Email ${email} and the password ${password} to login! `;
    await sendMail(email, name, text); // Use await to handle async call

    console.log("Admin registered successfully");
    // Respond with success message
    res.status(200).json({ message: "Admin registered successfully" });
  } catch (error) {
    // Check if the error is due to duplicate email
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        message: `Email: ${error.fields.email} is already registered.`,
      });
    }

    console.error("Error in registering admin:", error);
    res.status(500).json({ message: "Failed to register admin" });
  }
};

// Change Password
exports.superAdminChangePassword = async (req, res) => {
  try {
    const { currentPassword, password , confirmPassword } = req.body;
    const id = req.headers.authorization;

    if (!id) {
      return res
        .status(400)
        .json({ message: "Internal server error" });
    }

    const user = await adminModel.findOne({ where: { id: id } })
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if(!currentPassword){
      return res.status(400).json({ message: "Current password is required" });
    }
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }
    
    const validatePasswordError = validatePassword(password , confirmPassword);
    if (validatePasswordError) {
      return res.status(400).json({ message: validatePasswordError });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await adminModel.update(
      { password: hashedPassword },
      { where: { id: id } }
    );

    console.log("Password changed successfully");
    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error in changing password:", error);
    return res.status(500).json({ message: "Failed to change password" });
  }
};
exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await adminModel.findAll({
      where: { deleted: 0 }, // Filter to include only records where deleted is 0
      order: [["id", "ASC"]] // Order by id in ascending order
    });
    

    const adminsWithProjectsAndTasks = await Promise.all(
      admins.map(async (admin) => {
        // Fetch projects for each admin
        const adminProjects = await db.projectUsersModel.findAll({
          where: { userId: admin.id  },
        });

        // Fetch tasks for each admin
        const adminTasks = await db.taskUsersModel.findAll({
          where: { userId: admin.id },
        });

        return {
          ...admin.dataValues,
          projectCount: adminProjects.length,
          taskCount: adminTasks.length,
        };
      })
    );

    res.status(200).json({
      admins: adminsWithProjectsAndTasks,
    });
  } catch (error) {
    console.error("Error in finding admins:", error);
    return res.status(500).json({ message: "Failed to find admins" });
  }
};


exports.getAllDeletedAdmins = async (req, res) => {
  try {
    const admins = await adminModel.findAll({
      where: { deleted: 1 }, // Filter to include only records where deleted is 0
      order: [["id", "ASC"]] // Order by id in ascending order
    });
    

    const adminsWithProjectsAndTasks = await Promise.all(
      admins.map(async (admin) => {
        // Fetch projects for each admin
        const adminProjects = await db.projectUsersModel.findAll({
          where: { userId: admin.id  },
        });

        // Fetch tasks for each admin
        const adminTasks = await db.taskUsersModel.findAll({
          where: { userId: admin.id },
        });

        return {
          ...admin.dataValues,
          projectCount: adminProjects.length,
          taskCount: adminTasks.length,
        };
      })
    );

    res.status(200).json({
      admins: adminsWithProjectsAndTasks,
    });
  } catch (error) {
    console.error("Error in finding admins:", error);
    return res.status(500).json({ message: "Failed to find admins" });
  }
};

exports.restore = async (req, res) => {
  try {
    const id = req.params.id;
    // Delete the admin
    await adminModel.update(
      { deleted: 0 }, // Set the deleted column to 0
      { where: { id: id } } // Specify which record to update
    );

    console.log("Admin restored successfully");

    res.status(200).json({ message: "Admin restored successfully" });
  } catch (error) {
    console.error("Error in restoring admin:", error);
    return res.status(500).json({ message: "Failed to restored admin" });
  }
};

exports.getAdminById = async (req, res) => {
  try {
    const id = req.params.id;
    const admin = await adminModel.findOne({ where: { id: id   , deleted: 0 } });
    res.status(200).json(admin);
  } catch (error) {
    console.error("Error in Finding admins:", error);
    return res.status(500).json({ message: "Failed to find admins" });
  }
};

exports.adminDelete = async (req, res) => {
  try {
    const id = req.params.id;
    // Delete the admin
    await adminModel.update(
      { deleted: 1 }, // Set the deleted column to 0
      { where: { id: id } } // Specify which record to update
    );
    await db.projectUsersModel.destroy({ where: { userId: id } });
    await db.taskUsersModel.destroy({ where: { userId: id } });
    
    console.log("Admin deleted successfully");

    res.status(200).json({ message: "Admin deleted successfully" });
  } catch (error) {
    console.error("Error in deleting admin:", error);
    return res.status(500).json({ message: "Failed to delete admin" });
  }
};

exports.adminChangePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { password , confirmPassword   } = req.body;

    const validatePasswordError = validatePassword(password , confirmPassword);
    if (validatePasswordError) {
      return res.status(400).json({ message: validatePasswordError });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await adminModel.update(
      { password: hashedPassword },
      { where: { id: id } }
    );

    console.log("Password changed successfully");
    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error in changing admin password:", error);
    return res.status(500).json({ message: "Failed to change admin password" });
  }
};
const { Op } = require("sequelize");

exports.adminSearch = async (req, res) => {
  try {
    const { key } = req.params;
    const admins = await adminModel.findAll({
      where: {
        [Op.and]: [
          { name: { [Op.like]: `%${key}%` } },
          { deleted: 0 }
        ]
      }
    });
    
    res.status(200).json(admins);
  } catch (error) {
    console.error("Error in finding admins:", error);
    return res.status(500).json({ message: "Failed to find admins" });
  }
};

exports.imageDel = async (req, res) => {
  try {
    const { id } = req.params;
    await adminModel.update({ pfpImage: null }, { where: { id: id } });
    console.log("image deleted");
    return res.status(200).json({ message: "Image changed successfully" });
  } catch (err) {
    console.log(err);
    return res.status(200).json({ message: "Error updating profile pic." });

  }
};


exports.adminSingleProfilePicUpdate = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if req.file exists and is not empty
    if (!req.file || req.file === "") {
      return res.status(400).json({ message: "No file uploaded" });
    }

    let imagePath = null;

    // Process the uploaded file
    if (req.file) {
      console.log("File received: ", req.file.filename);

      // Read the file from the disk
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

    // Update the profile image in the database
    await adminModel.update({ pfpImage: imagePath }, { where: { id: id } });
    console.log("Image updated");

    res.status(200).json({ message: "Profile Image updated successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};


// exports.adminSingleProfilePicUpdate = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Check if req.file exists and is not empty
//     if (!req.file || req.file === "") {
//       return res.status(400).json({ message: "No file uploaded" });
//     }

//     let imagePath = null;

//     // Process the uploaded file
//     if (req.file) {
//       console.log("File received: ", req.file.filename);
//       const photoFileName = req.file.filename;
//       console.log("PhotoFileName: ", photoFileName);
//       imagePath = `http://localhost:5000/public/uploads/pfp/${photoFileName}`;
//     }
//     const s3Urls = await uploadMedia(mediaItems);


//     await adminModel.update({ pfpImage: imagePath }, { where: { id: id } });
//     console.log("image updated");
//     res.status(200).json({ message: "Profile Image updated successfully" });
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ message: "Internal server error" });
//   }
// }
