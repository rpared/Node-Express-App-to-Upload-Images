const express = require("express");
const router = express.Router();
const Image = require("../models/file");
const multer = require("multer");
const storage = multer.memoryStorage(); //RAM
// const { getRandomFiles, getAllFiles } = require("../util/fileUtils");
// const { readFileAsBase64 } = require("../util/base64Util");
// const { paginate } = require("../util/paginationUtil"); // Import the pagination utility function

// Fetch file as base64
// const fetchFileAsBase64 = (filePath) => {
//   const content = readFileAsBase64(filePath);
//   return content ? { file: content } : { error: "File not found." };
// };

// Fetch one random Image file as base64
router.route("/fetch-single").get((req, res) => {
  res.render("fetch-single.hbs", {
    title: "Fetching a Random Image",
  });
});
// This route is triggered by the javascript within fetch-single.hbs in /fetch-single route
router.get("/random-image", (req, res) => {
  Image.aggregate([{ $sample: { size: 1 } }])
    .then((randomImage) => {
      if (randomImage.length === 0) {
        return res.status(404).send("No files found.");
      }
      console.log(randomImage[0]);
      res.json(randomImage[0]);
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send("Error fetching file.");
    });
});

// Fetch all images

router.route("/fetch-all").get((req, res) => {
  res.render("fetch-all.hbs", {
    title: "Fetching All Images",
  });
});

router.get("/fetch-all2", (req, res) => {
  Image.find()
    .then((allImages) => {
      if (allImages.length === 0) {
        return res.status(404).json({ error: "No files found." });
      }
      const formattedImages = allImages.map((image) => ({
        filename: image.filename,
        contentType: image.contentType,
        imageBuffer: image.imageBuffer
          ? image.imageBuffer.toString("base64")
          : "",
      }));

      res.json(formattedImages);
    })
    .catch((error) => {
      console.error("Error fetching files:", error);
      res.status(500).json({ error: "Error fetching files." });
    });
});

// Fetch multiple images

router.route("/fetch-multiple").get((req, res) => {
  res.render("fetch-multiple.hbs", {
    title: "Fetching Multiple Random Images",
  });
});
//This route is triggered with js inside fetch-multiple.hbs
router.get("/fetch-multiple2", (req, res) => {
  const count = parseInt(req.query.count) || 1;

  Image.aggregate([{ $sample: { size: count } }])
    .then((randomImages) => {
      if (randomImages.length === 0) {
        return res.status(404).send("No files found.");
      }
      res.json(randomImages);
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send("Error fetching file.");
    });
});

// Fetch all images Paginated
router.route("/fetch-gallery-pagination").get((req, res) => {
  res.render("gallery-pagination.hbs", {
    title: "Fetching Gallery with pagination",
  });
});

//Triggered by script inside gallery-pagination.hbs
router.get("/fetch-all//pages/:index", (req, res) => {
  const pageIndex = parseInt(req.params.index, 10);

  if (isNaN(pageIndex) || pageIndex < 1) {
    return res.status(400).send("Invalid page index.");
  }
  const ITEMS_PER_PAGE = 10;
  Image.find({}, { imageBuffer: 0 })
    .skip((pageIndex - 1) * ITEMS_PER_PAGE)
    .limit(ITEMS_PER_PAGE)
    .then((page_results) => {
      if (page_results.length === 0) {
        return res.status(404).send("Page not found.");
      }
      Image.countDocuments()
        .then((total_images) => {
          const totalPages = Math.ceil(total_images / ITEMS_PER_PAGE);
          const formattedPageItems = page_results.map((image) => ({
            filename: image.filename,
            contentType: image.contentType,
            imageBuffer: image.imageBufferThumbnail
              ? image.imageBufferThumbnail.toString("base64")
              : "",
          }));
          const response = {
            page: pageIndex,
            totalPages: totalPages,
            files: formattedPageItems,
          };
          res.json(response);
        })
        .catch((error) => {
          console.error("Error counting Documents:", error);
          res.status(500).send("Error fetching files.");
        });
    })
    .catch((error) => {
      console.error("Error Finding Documents:", error);
      res.status(500).send("Error fetching files.");
    });
});

module.exports = router;
