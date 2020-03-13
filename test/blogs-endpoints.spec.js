const knex = require("knex");
const app = require("../src/app");
const helpers = require("./test-helpers");

describe("Blogs Endpoints", () => {
  let db;

  const { testUsers, testBlogs, testViews } = helpers.makeBlogsFixtures();

  before("make knex instance", () => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DATABASE_URL
    });
    app.set("db", db);
  });

  after("disconnect from db", () => db.destroy());

  before("cleanup", () => helpers.cleanTables(db));

  afterEach("cleanup", () => helpers.cleanTables(db));

  describe("GET /api/blogs", () => {
    context("Given no blogs", () => {
      it("responds with 200 and an empty list", () => {
        return supertest(app)
          .get("/api/blogs")
          .expect(200, []);
      });
    });

    context("Given there are blogs in the database", () => {
      beforeEach("insert blogs", () =>
        helpers.seedBlogs(db, testUsers, testBlogs, testViews)
      );

      it("responds with 200 and all the blogs", () => {
        const expectedBlogs = testBlogs.map(blog =>
          helpers.makeExpectedBlog(testUsers, blog, testViews)
        );
        return supertest(app)
          .get("/api/blogs")
          .expect(200, expectedBlogs);
      });
    });

    context("Given an XSS attack blog", () => {
      const testUser = testUsers[1];
      const { maliciousBlog, expectedBlog } = helpers.makeMaliciousBlog(
        testUser
      );

      beforeEach("insert malicious blog", () => {
        return helpers.seedMaliciousBlog(db, testUser, maliciousBlog);
      });

      it("removes XSS attack content", () => {
        return supertest(app)
          .get("/api/blogs")
          .expect(200)
          .expect(res => {
            expect(res.body[0].title).to.eql(expectedBlog.title);
            expect(res.body[0].content).to.eql(expectedBlog.content);
          });
      });
    });
  });

  describe("POST /api/blogs", () => {
    beforeEach("insert blogs", () =>
      helpers.seedBlogs(db, testUsers, testBlogs)
    );

    it("creates a blog, responding with 201 and the new blog", function() {
      this.retries(3);
      const testUser = testUsers[0];
      const newBlog = {
        title: "I am adding a blog",
        picture: "https://www.iamawebsitewithapic.com",
        content: "A very short blog, my goal is to never bore them!",
        author_id: testUser.id
      };
      return supertest(app)
        .post("/api/blogs")
        .set("Authorization", helpers.makeAuthHeader(testUser))
        .send(newBlog)
        .expect(201)
        .expect(res => {
          expect(res.body).to.have.property("id");
          expect(res.body.title).to.eql(newBlog.title);
          expect(res.body.content).to.eql(newBlog.content);
          expect(res.body.author.id).to.eql(testUser.id);
          expect(res.headers.location).to.eql(`/api/blogs/${res.body.id}`);
          const expectedDate = new Date().toLocaleString("en", {
            timeZone: "UTC"
          });
          const actualDate = new Date(res.body.date_created).toLocaleString();
          expect(actualDate).to.eql(expectedDate);
        })
        .expect(res =>
          db
            .from("blogs")
            .select("*")
            .where({ id: res.body.id })
            .first()
            .then(row => {
              expect(row.title).to.eql(newBlog.title);
              expect(row.content).to.eql(newBlog.content);
              expect(row.picture).to.eql(newBlog.picture);
              const expectDate = new Date().toLocaleString("en", {
                timeZone: "UTC"
              });
              const actualDate = new Date(row.date_created).toLocaleString();
              expect(actualDate).to.eql(expectDate);
            })
        );
    });

    const requiredFields = ["title", "picture", "content"];

    requiredFields.forEach(field => {
      const testUser = testUsers[0];
      const newBlog = {
        title: "This is a brand new day and a brand new blog",
        picture: "https://www.pixarpictures.com",
        content: "This is content!",
        author_id: testUser.id
      };

      it(`responds with 400 and an error message when the ${field} is missing`, () => {
        delete newBlog[field];

        return supertest(app)
          .post("/api/blogs")
          .set("Authorization", helpers.makeAuthHeader(testUser))
          .send(newBlog)
          .expect(400, {
            error: `Missing '${field}' in request body`
          });
      });
    });
  });

  describe("GET /api/blogs/:blog_id", () => {
    context("Given no blogs", () => {
      beforeEach("insert blogs", () =>
        helpers.seedBlogs(db, testUsers, testBlogs, testViews)
      );
      it("responds with 404", () => {
        const nonExistantBlog = 123456;
        return supertest(app)
          .get(`/api/blogs/${nonExistantBlog}`)
          .expect(404, { error: "Blog doesn't exist" });
      });
    });

    context("Given there are blogs in the database", () => {
      beforeEach("insert blogs", () =>
        helpers.seedBlogs(db, testUsers, testBlogs, testViews)
      );
      it("responds with 200 and the specified blog", () => {
        const blogId = 1;
        const expectedBlog = helpers.makeExpectedBlog(
          testUsers,
          testBlogs[blogId - 1],
          testViews
        );

        expectedBlog.number_of_views += 1;

        return supertest(app)
          .get(`/api/blogs/${blogId}`)
          .expect(200, expectedBlog);
      });
    });

    context("Given an XSS attack blog", () => {
      const testUser = testUsers[0];
      const { maliciousBlog, expectedBlog } = helpers.makeMaliciousBlog(
        testUser
      );

      beforeEach("insert malicious blog", () =>
        helpers.seedMaliciousBlog(db, testUser, maliciousBlog)
      );

      it("removes xss attack content", () => {
        return supertest(app)
          .get(`/api/blogs/${maliciousBlog.id}`)
          .expect(res => {
            expect(res.body.title).to.eql(expectedBlog.title);
            expect(res.body.content).to.eql(expectedBlog.content);
          });
      });
    });
  });
});
