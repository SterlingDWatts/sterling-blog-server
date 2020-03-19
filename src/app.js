require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
// const validateBearerToken = require("./middleware/validate-bearer-token");
const errorHandler = require("./middleware/error-handler");
const { NODE_ENV } = require("./config");
const blogsRouter = require("./blogs/blogs-router");
const authRouter = require("./auth/auth-router");
const usersRouter = require("./users/users-router");
const picturesRouter = require("./pictures/pictures-router");
const signatureRouter = require("./signature/signature-router");

// create Express app
const app = express();

// log 'tiny' output if in production, else log 'common'
const morganOption = NODE_ENV === "production" ? "tiny" : "common";
app.use(morgan(morganOption, { skip: () => NODE_ENV === "test" }));

// hide sensitive data with 'helmet' and allow cors
app.use(helmet());
app.use(cors());

// authentication middleware
// app.use(validateBearerToken);

// basic endpoint for app.js
app.get("/", (req, res) => {
  res.send("Hello, world!");
});

// endpoints
app.use("/api/blogs", blogsRouter);
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/pictures", picturesRouter);
app.use("/api/get_signature", signatureRouter);

// error handling middleware gives short response if in production
app.use(errorHandler);

// export the app
module.exports = app;
