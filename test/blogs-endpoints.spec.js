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
    context("Given no things", () => {
      it("responds with 200 and an empty list", () => {
        return supertest(app)
          .get("/api/blogs")
          .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
          .expect(200, []);
      });
    });

    context("Given there are blogs in the database", () => {
      beforeEach("insert things", () =>
        helpers.seedBlogs(db, testUsers, testBlogs, testViews)
      );

      it("responds with 200 and all the blogs", () => {
        const expectedBlogs = testBlogs.map(blog =>
          helpers.makeExpectedBlog(testUsers, blog, testViews)
        );
        return supertest(app)
          .get("/api/blogs")
          .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
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
          .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
          .expect(200)
          .expect(res => {
            expect(res.body[0].title).to.eql(expectedBlog.title);
            expect(res.body[0].content).to.eql(expectedBlog.content);
          });
      });
    });
  });
});
