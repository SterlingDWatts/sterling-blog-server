const express = require("express");
const path = require("path");
const UsersService = require("./users-service");

const usersRouter = express.Router();
const jsonBodyParer = express.json();

usersRouter.post("/", jsonBodyParer, (req, res, next) => {
  const { first_name, last_name, username, email, password } = req.body;

  for (const field of [
    "first_name",
    "last_name",
    "username",
    "email",
    "password"
  ]) {
    if (!req.body[field]) {
      return res.status(400).json({
        error: `Missing '${field}' in request body`
      });
    }
  }

  const passwordError = UsersService.validatePassword(password);
  if (password) {
    return res.status(400).json({ error: passwordError });
  }
  res.status(200).send();
});

module.exports = usersRouter;
