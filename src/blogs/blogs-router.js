const express = require("express");
const BlogsService = require("./blogs-service");
// TODO { requireAuth } = require("../middleware/jwt-auth")

const blogsRouter = express.Router();

blogsRouter.route("/").get((req, res, next) => {
  BlogsService.getAllBlogs(req.app.get("db"))
    .then(blogs => {
      res.json(BlogsService.serializeBlogs(blogs));
    })
    .catch(next);
});

module.exports = blogsRouter;
