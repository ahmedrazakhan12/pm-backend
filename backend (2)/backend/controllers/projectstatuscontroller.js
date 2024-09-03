const db = require("../models/index");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const privateKey = process.env.PRIVATE_KEY;
const projectStatusModel = db.projectStatusModel;

const { validateStatus } = require("../middlewares/Validate");

exports.addStatus = async (req, res) => {
  try {
    const { status, preview } = req.body;
    console.log("Status:", status, "Preview:", preview);
    const statusError = validateStatus(status);
    const previewError = validateStatus(preview);

    if (statusError || previewError) {
      return res.status(400).json({
        status: 400,
        data: null,
        message: statusError || previewError,
      });
    }

    const newStatus = await projectStatusModel.create({
      status: status,
      preview: preview,
      statusName : 'status' 

    });

    console.log("Status added successfully");
    return res.status(200).json({
      status: 200,
      data: newStatus,
      message: "Status added successfully",
    });
  } catch (error) {
    console.log("Status not added");
    return res.status(500).json({
      status: 500,
      data: null,
      message: error.message,
    });
  }
};





// Update Project
exports.updateStatus = async (req, res) => {
    try {
      const { id } = req.params;
      const { status, preview } = req.body;

      const statusError = validateStatus(status);
      const previewError = validateStatus(preview);
  
      if (statusError || previewError) {
        return res.status(400).json({
          status: 400,
          data: null,
          message: statusError || previewError,
        });
      }
  
  
      await projectStatusModel.update(
        {
            status: status,
            preview: preview,
        },
        {
          where: {
            id: id,
            statusName : 'status'
          },
        }
      );
      res.status(200).send("Status successfully updated.");
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  };
  
  // Delete Task
  exports.deleteStatus = async (req, res) => {
    try {
      const { id } = req.params;
  
      const status = await projectStatusModel.findOne({ where: { id: id  , statusName : 'status'} });
      if (!status) {
        return res.status(404).json({
          status: 404,
          data: null,
          message: "Status not found",
        });
      }
  
      // Delete the admin
      await projectStatusModel.destroy({ where: { id: id } });
      console.log("Status successfully deleted.");
      res.status(200).json({ message: "Status deleted successfully" });
      
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  };
  
  
  exports.getAllStatus = async (req, res) => {
    try {
      const status = await projectStatusModel.findAll({
        where: {
          statusName : 'status'
        }
      });
      res.status(200).json(status);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  }
  
  
  exports.getStatusById = async (req, res) => {
    try {
      const { id } = req.params;
      console.log("id:", id);
      const status = await projectStatusModel.findOne({ where: { id: id  , statusName : 'status'} });
      if (!status) {
        return res.status(404).json({
          status: 404,
          data: null,
          message: "Status not found",
        });
      }
      res.status(200).json(status);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  }