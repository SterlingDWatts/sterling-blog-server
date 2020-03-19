const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");
const gm = require("gm").subClass({ imageMagick: true });
const FroalaEditor = require("../../node_modules/wysiwyg-editor-node-sdk/lib/froalaEditor.js");
const config = require("../config");

const signatureRouter = express.Router();

signatureRouter.use(express.static(path.join(__dirname, "/")));
signatureRouter.use(
  "/bower_components",
  express.static(path.join(__dirname, "../bower_components"))
);
signatureRouter.use(bodyParser.urlencoded({ extended: false }));

signatureRouter.route("/").get((req, res) => {
  const configs = {
    bucket: "sterlingblogpictures",
    region: "us-west-1",
    keyStart: "images/",
    acl: "public-read",
    accessKey: config.AWS_ACESS_KEY_ID,
    secretKey: config.AWS_SECRET_ACCESS_KEY
  };
  const s3Hash = FroalaEditor.S3.getHash(configs);
  res.send(s3Hash);
});

module.exports = signatureRouter;
