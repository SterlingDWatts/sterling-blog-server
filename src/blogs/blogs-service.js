const xss = require("xss");
const Treeize = require("treeize");

const BlogsService = {
  getAllBlogs(db) {
    return db
      .from("blogs AS b")
      .select(
        "b.id",
        "b.title",
        "b.picture",
        "b.content",
        "b.date_created",
        ...userFields,
        db.raw("count(DISTINCT v) AS number_of_views")
      )
      .leftJoin("views AS v", "b.id", "v.blog_id")
      .leftJoin("users AS u", "b.author_id", "u.id")
      .groupBy("b.id", "u.id");
  },

  getById(db, blogId) {
    return BlogsService.getAllBlogs(db)
      .where("b.id", blogId)
      .first();
  },

  insertView(db, newView) {
    return db
      .insert(newView)
      .into("views")
      .returning("*")
      .then(([view]) => view)
      .then(view => BlogsService.getById(db, view.blog_id));
  },

  insertBlog(db, newBlog) {
    return db
      .insert(newBlog)
      .into("blogs")
      .returning("*")
      .then(([blog]) => blog)
      .then(blog => BlogsService.getById(db, blog.id));
  },

  deleteBlog(db, id) {
    return db("blogs")
      .where({ id })
      .delete();
  },

  updateBlog(db, id, newBlogFields) {
    return db("blogs")
      .where({ id })
      .update(newBlogFields);
  },

  serializeBlogs(blogs) {
    return blogs.map(this.serializeBlog);
  },

  serializeBlog(blog) {
    const blogTree = new Treeize();

    const blogData = blogTree.grow([blog]).getData()[0];

    return {
      id: blogData.id,
      title: xss(blogData.title),
      picture: blogData.picture,
      content: xss(blogData.content),
      date_created: blogData.date_created,
      author: blogData.author || {},
      number_of_views: Number(blogData.number_of_views) || 0
    };
  }
};

const userFields = [
  "u.id AS author:id",
  "u.first_name AS author:first_name",
  "u.last_name AS author:last_name",
  "u.username AS author:username",
  "u.nickname AS author:nickname",
  "u.privileges AS author:privileges"
];

module.exports = BlogsService;
