CREATE TYPE permission_category AS ENUM (
  'User',
  'Writer',
  'Editor',
  'Admin'
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  nickname TEXT,
  date_created TIMESTAMP DEFAULT now() NOT NULL,
  privileges permission_category
);