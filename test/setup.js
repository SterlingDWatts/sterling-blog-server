process.env.TZ = "UTC";
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "03315099-0428-40a2-b1e9-59bf279ca3ea";
process.env.JWT_EXPIRY = "5m";

require("dotenv").config();

process.env.TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL || "postgresql://";

const { expect } = require("chai");
const supertest = require("supertest");

global.expect = expect;
global.supertest = supertest;
