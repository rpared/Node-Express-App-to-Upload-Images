const express = require("express");
const router = express.Router();
const Image = require("../models/file");
const multer = require("multer");
const storage = multer.memoryStorage(); //RAM
const upload = multer({ storage: storage });
const sharp = require('sharp'); //To get thumbnails

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
      sharp(file.buffer)
        .resize({ width: 500 })
        .toBuffer()
        .then((thumbnail) => {
          const newImage = new Image({
            filename: file.originalname,
            contentType: file.mimetype,
            imageBuffer: file.buffer,
            imageBufferThumbnail: thumbnail,
          });

          return newImage.save().catch((error) => {
            console.log(error);
            res
              .status(500)
              .send(
                "Error saving files to database. Error in Saving Operation"
              );
          });
        });
    });

    Promise.all(imagePromises)

      .then(() => {
        res.render("if-upload-multiple", {
          message:
            `😃 File uploaded successfully to the database!` ,
        });
      })

      .catch((error) => {
        console.log(error);
        res.status(500).send("Error saving files to database.");
      });
    });


// Upload Single image
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

    sharp(req.file.buffer)
      .resize({ width: 500 })
      .toBuffer()
      .then((thumbnail) => {
        const newImage = new Image({
          filename: req.file.originalname,
          contentType: req.file.mimetype,
          imageBuffer: req.file.buffer,
          imageBufferThumbnail: thumbnail,
        });

        return newImage.save(); // Save the image document
      })
      .then(() => {
        res.render("if-upload-single", {
          message: `😃 File uploaded successfully to the database!`,
        });
      })
      .catch((error) => {
        console.error(error); // Use console.error for proper error logging
        res.status(500).send("Error saving file to database.");
      });
  });

module.exports = router;
