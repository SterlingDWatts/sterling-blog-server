const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");
const FroalaEditor = require("../../node_modules/wysiwyg-editor-node-sdk/lib/froalaEditor.js");
const config = require("../config");

const picturesRouter = express.Router();

picturesRouter.use(
  "/uploads",
  express.static(path.join(__dirname, "/uploads"))
);
picturesRouter.use(
  "/bower_components",
  express.static(path.join(__dirname, "../bower_components"))
);
picturesRouter.use(bodyParser.urlencoded({ extended: false }));

picturesRouter.route("/upload_image").post((req, res) => {
  console.log(req.files);
  FroalaEditor.Image.upload(req, "/pictures/uploads/", (err, data) => {
    if (err) {
      return res.send(JSON.stringify(err));
    }
    data = { link: "http://localhost:8000/api" + data.link };
    console.log(data);
    res.send(data);
  });
});

module.exports = picturesRouter;
