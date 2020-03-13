const xss = require("xss");
const bcrypt = require("bcryptjs");

const REGEX_PASSWORD = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&])[\S]+/;

const UsersService = {
  validatePassword(password) {
    if (password.length < 8 || password.length > 72) {
      return "Password must be between 8 and 72 characters";
    } else if (password.startsWith(" ") || password.endsWith(" ")) {
      return "Password must not start or end with a space";
    } else if (!REGEX_PASSWORD.test(password)) {
      return "Password must contain one upper case, lower case, number, and special character";
    }
    return null;
  },
  hasUserWithUsername(db, username) {
    return db("users")
      .where({ username })
      .first()
      .then(user => !!user);
  },
  hashPassword(password) {
    return bcrypt.hash(password, 12);
  },
  insertUser(db, newUser) {
    return db
      .insert(newUser)
      .into("users")
      .returning("*")
      .then(([user]) => user);
  },
  serializeUser(user) {
    return {
      id: user.id,
      first_name: xss(user.first_name),
      last_name: xss(user.last_name),
      username: xss(user.username),
      email: xss(user.email),
      privileges: user.privileges,
      date_created: new Date(user.date_created)
    };
  }
};

module.exports = UsersService;
