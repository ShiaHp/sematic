const express = require("express");
const router = express.Router();
const homeController = require("../controller/home");
const uploadController = require("../controller/upload");
const upload = require("../middleware/upload");
let routes = (app) => {
  router.get("/", homeController.getHome);

  router.post("/upload", upload.single("file"), uploadController.uploadFiles);
  router.get("/files", uploadController.getListFiles);
  router.get("/files/:name", uploadController.download);
  router.get("/search", uploadController.searchProduct);

  return app.use("/", router);
};

module.exports = routes;
