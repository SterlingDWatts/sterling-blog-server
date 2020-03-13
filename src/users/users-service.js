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
  },
  hasUserWithUsername(db, username) {
    return db("users")
      .where({ username })
      .first()
      .then(user => !!user);
  }
};

module.exports = UsersService;
