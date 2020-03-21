# Sterling | Blog | Server

## About

A Server for a Content Management System.

## Endpoints

1. /auth Endpoint
   .._ POST /login: handles user logging in
   .._ POST /refresh: handles refreshing credentials for logged in user
2. /blogs Endpoint
   .._ GET / returns list of all blogs
   .._ POST / adds new blog to list
   .._ GET /:blog_id returns blog with matching id
   .._ DELETE /:blog_id deletes blog
   ..\* PATCH /:blog_id edits blog with matching id
3. /signature Endpoint
   ..\* GET / returns credentials for AWS bucket
4. /users Endpoint
   ..\* POST / adds new user to database

## Technologies

- Nodejs
- PostgreSQL
- Heroku

## Set up

Complete the following steps to start a new project (NEW-PROJECT-NAME):

1. Clone this repository to your local machine `git clone BOILERPLATE-URL NEW-PROJECTS-NAME`
2. `cd` into the cloned repository
3. Make a fresh start of the git history for this project with `rm -rf .git && git init`
4. Install the node dependencies `npm install`
5. Move the example Environment file to `.env` that will be ignored by git and read by the express server `mv example.env .env`
6. Edit the contents of the `package.json` to use NEW-PROJECT-NAME instead of `"name": "express-boilerplate",`
7. Update the values in ./src/config.js and ./test/setup.js

## Scripts

Start 'Prettier' on-save `npm run prettier-watch`
Run the tests `npm test`
Migrate the server `npm run migrate`
Migrate the test-server `npm run migrate:test`
Start nodemon for the application `npm run dev`
Start the application `npm start`

## Deploying

When your new project is ready for deployment, add a new Heroku application with `heroku create`. This will make a new git remote called "heroku" and you can then `npm run deploy` which will push to this remote's master branch.
