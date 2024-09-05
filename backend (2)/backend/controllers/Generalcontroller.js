const { where } = require("sequelize");
const db = require("../models/index");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const privateKey = process.env.PRIVATE_KEY;
const adminModel = db.adminModel;

const {uploadMedia} = require("../includes/uploads3");



const fs = require('fs');
const path = require('path');
exports.favicon = async (req, res) => {
  try {
    let imagePath = "https://project-mgt.s3.ap-southeast-2.amazonaws.com/image/1725366291146-1725358152285-1724074854605-ahmed.png";
    let faviconPath = imagePath;

    if (req.files && req.files.favicon && req.files.favicon.length > 0) {
      // const faviconFileName = req.files.favicon[0].filename;
      // faviconPath = `http://localhost:5000/public/uploads/pfp/${faviconFileName}`;

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
        faviconPath = s3Urls[0]; // Assuming the first URL is the profile picture URL
      } else {
        return res.status(500).json({ message: "Failed to upload image to S3" });
      }


    }

    // Save paths to database
    await db.generalModel.update(
      { favicon: faviconPath },
      { where: { id: 1 } }
    );

    res.status(200).json({ message: "Favicon updated successfully" });
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Error updating favicon" });
  }
};

exports.logo = async (req, res) => {
  try {
    let imagePath = "https://project-mgt.s3.ap-southeast-2.amazonaws.com/image/1725366291146-1725358152285-1724074854605-ahmed.png";
    let logoPath = imagePath;

    if (req.files && req.files.logo && req.files.logo.length > 0) {
      // const logoFileName = req.files.logo[0].filename;
      // logoPath = `http://localhost:5000/public/uploads/pfp/${logoFileName}`;

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
        logoPath = s3Urls[0]; // Assuming the first URL is the profile picture URL
      } else {
        return res.status(500).json({ message: "Failed to upload image to S3" });
      }

    } else {
      console.log('No logo file found in request');
      return res.status(400).json({ message: "No logo file uploaded" });
    }

    // Save paths to database
    await db.generalModel.update(
      { logo: logoPath },
      { where: { id: 1 } }
    );

    res.status(200).json({ message: "Logo updated successfully" });
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Error updating logo" });
  }
};

exports.logo = async (req, res) => {
  try {
    let logoPath = "https://project-mgt.s3.ap-southeast-2.amazonaws.com/image/1725366291146-1725358152285-1724074854605-ahmed.png";

    if (req.files && req.files.logo && req.files.logo.length > 0) {
      const file = req.files.logo[0]; // Assuming single file upload
      const filePath = path.join(__dirname, '..', 'public', 'uploads', 'pfp', file.filename);
      
      console.log('File path:', filePath); // Debug log to verify file path

      const fileContent = fs.readFileSync(filePath);

      // Prepare mediaItem for S3 upload
      const mediaItem = {
        filename: file.filename,
        data: fileContent,
        type: file.mimetype,
      };

      // Upload the file to S3
      const s3Urls = await uploadMedia([mediaItem]);

      if (s3Urls && s3Urls.length > 0) {
        logoPath = s3Urls[0]; // Assuming the first URL is the logo URL
      } else {
        return res.status(500).json({ message: "Failed to upload image to S3" });
      }

    } else {
      console.log('No logo file found in request');
      return res.status(400).json({ message: "No logo file uploaded" });
    }

    // Save paths to database
    await db.generalModel.update(
      { logo: logoPath },
      { where: { id: 1 } }
    );

    res.status(200).json({ message: "Logo updated successfully" });
  } catch (err) {
    console.log('Error updating logo:', err);
    res.status(400).json({ message: "Error updating logo" });
  }
};



exports.getLogos = async (req, res) => {
  try {
    const logos = await db.generalModel.findAll();
    res.status(200).json(logos);
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Error retrieving data" });
  }
}