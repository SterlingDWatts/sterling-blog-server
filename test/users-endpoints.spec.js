const knex = require("knex");
const bcrypt = require("bcryptjs");
const app = require("../src/app");
const helpers = require("./test-helpers");

describe("Users endpoints", () => {
  let db;

  const { testUsers } = helpers.makeBlogsFixtures();
  const testUser = testUsers[0];

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

  describe("POST /api/users", () => {
    context("User Validation", () => {
      beforeEach("insert users", () => helpers.seedUsers(db, testUsers));

      const requiredFields = [
        "first_name",
        "last_name",
        "username",
        "email",
        "password"
      ];

      requiredFields.forEach(field => {
        const registerAttemptBody = {
          ...testUser
        };

        it(`responds with 400 required error when '${field}' is missing`, () => {
          delete registerAttemptBody[field];

          return supertest(app)
            .post("/api/users")
            .send(registerAttemptBody)
            .expect(400, { error: `Missing '${field}' in request body` });
        });
      });

      it("responds 400 'Password must be longer than 8 characters' when empty password", () => {
        const userShortPassword = {
          ...testUser,
          password: "short"
        };
        return supertest(app)
          .post("/api/users")
          .send(userShortPassword)
          .expect(400, {
            error: "Password must be between 8 and 72 characters"
          });
      });

      it("responds 400 'Password must be between 8 and 72 characters' when password too long", () => {
        const userLongPassword = {
          ...testUser,
          password: "*".repeat(73)
        };
        return supertest(app)
          .post("/api/users")
          .send(userLongPassword)
          .expect(400, {
            error: "Password must be between 8 and 72 characters"
          });
      });

      it("responds 400 error when password starts with spaces with a space", () => {
        const userPasswordStartsSpace = {
          ...testUser,
          password: " testpassword"
        };
        return supertest(app)
          .post("/api/users")
          .send(userPasswordStartsSpace)
          .expect(400, {
            error: "Password must not start or end with a space"
          });
      });

      it("responds 400 error when password ends with a space", () => {
        const userPasswordEndsSpace = {
          ...testUser,
          password: "testpassword "
        };
        return supertest(app)
          .post("/api/users")
          .send(userPasswordEndsSpace)
          .expect(400, {
            error: "Password must not start or end with a space"
          });
      });

      const notComplexEnoughPasswords = [
        "aaAA1111",
        "aaAA!!!!",
        "aaaa11!!",
        "AAAA11!!"
      ];
      notComplexEnoughPasswords.forEach(password => {
        it("responds 400 error when password isn't complex enougn", () => {
          const userSimplePassword = {
            ...testUser,
            password
          };
          return supertest(app)
            .post("/api/users")
            .send(userSimplePassword)
            .expect(400, {
              error:
                "Password must contain one upper case, lower case, number, and special character"
            });
        });
      });

      it("responds 400 'Username already taken' when username isn't unique", () => {
        const duplicateUser = {
          first_name: "test first_name",
          last_name: "test last_name",
          username: testUser.username,
          email: "test email",
          password: "aaAA11!!"
        };
        return supertest(app)
          .post("/api/users")
          .send(duplicateUser)
          .expect(400, { error: "Username already taken" });
      });
    });
  });
});
