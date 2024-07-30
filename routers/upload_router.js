const express = require("express");
const router = express.Router();
const Image = require("../models/file");
const multer = require("multer");
const storage = multer.memoryStorage(); //RAM
const upload = multer({ storage: storage });

router
  .route("/multipleimages")
  .get((req, res) => {
    res.render("upload-multiple.hbs", {
      title: "Upload Multiple Images",
    });
  })

  .post(upload.array("files", 100), (req, res) => {
    if (!req.files || req.files.length === 0) {
      return res.status(400).send("No files uploaded.");
    }
    const imagePromises = req.files.map((file) => {
      const newImage = new Image({
        filename: file.originalname,
        contentType: file.mimetype,
        imageBuffer: file.buffer,
      });
      return newImage.save();
    });
    Promise.all(imagePromises)
      .then(() => {
        res.status(200).send("Files uploaded successfully.");
      })
      .catch((error) => {
        console.log(error);
        res.status(500).send("Error saving files to database.");
      });
  });

router
  .route("/singleimage")
  .get((req, res) => {
    res.render("upload", {
      title: "Upload Single Image",
    });
  })
  .post(upload.single("file"), (req, res) => {
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }
    res.render("if-upload-single", {
      message:
        `😃 File uploaded successfully to this location: ` + req.file.path,
    });
  });
module.exports = router;