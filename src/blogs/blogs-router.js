const express = require("express");
const path = require("path");
const BlogsService = require("./blogs-service");
const { requireAuth } = require("../middleware/jwt-auth");

const blogsRouter = express.Router();
const jsonBodyParser = express.json();

blogsRouter
  .route("/")
  .get((req, res, next) => {
    BlogsService.getAllBlogs(req.app.get("db"))
      .then(blogs => {
        res.json(BlogsService.serializeBlogs(blogs));
      })
      .catch(next);
  })
  .post(requireAuth, jsonBodyParser, (req, res, next) => {
    const { title, picture, content } = req.body;
    const newBlog = { title, picture, content };

    for (const [key, value] of Object.entries(newBlog)) {
      if (value == null) {
        return res.status(400).json({
          error: `Missing '${key}' in request body`
        });
      }
    }

    newBlog.author_id = req.user.id;

    BlogsService.insertBlog(req.app.get("db"), newBlog)
      .then(blog => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${blog.id}`))
          .json(BlogsService.serializeBlog(blog));
      })
      .catch(next);
  });

blogsRouter
  .route("/:blog_id")
  .all(checkBlogExists)
  .get((req, res) => {
    const newView = {
      blog_id: res.blog.id
    };
    BlogsService.insertView(req.app.get("db"), newView).then(blog => {
      res.json(BlogsService.serializeBlog(blog));
    });
  })
  .delete(requireAuth, (req, res, next) => {
    if (
      req.user.id !== res.blog["author:id"] &&
      req.user.privileges !== "Admin"
    ) {
      return res.status(401).json({ error: "Unauthorized request" });
    }
    BlogsService.deleteBlog(req.app.get("db"), req.params.blog_id)
      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  })
  .patch(requireAuth, jsonBodyParser, (req, res, next) => {
    if (
      req.user.id !== res.blog["author:id"] &&
      req.user.privileges !== "Admin"
    ) {
      return res.status(401).json({ error: "Unauthorized request" });
    }

    const { title, picture, content } = req.body;
    const updatedBlog = { title, picture, content };

    for (const [key, value] of Object.entries(updatedBlog)) {
      if (value == null) {
        return res.status(400).json({
          error: `Missing '${key}' in request body`
        });
      }
    }

    BlogsService.updateBlog(req.app.get("db"), req.params.blog_id, updatedBlog)
      .then(() => res.status(204).end())
      .catch(next);
  });

async function checkBlogExists(req, res, next) {
  try {
    const blog = await BlogsService.getById(
      req.app.get("db"),
      req.params.blog_id
    );

    if (!blog) {
      return res.status(404).json({ error: "Blog doesn't exist" });
    }

    res.blog = blog;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = blogsRouter;
