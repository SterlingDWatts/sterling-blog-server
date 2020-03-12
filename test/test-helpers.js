const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

function makeUsersArray() {
  return [
    {
      id: 1,
      first_name: "test-one",
      last_name: "user-one",
      username: "test-user-one",
      email: "test-one@gmail.com",
      password: "aaAA11!!",
      nickname: "testy",
      privileges: "Admin",
      date_created: new Date("2029-01-22T20:28:32.615Z")
    },
    {
      id: 2,
      first_name: "test-two",
      last_name: "user-two",
      username: "test-user-two",
      email: "test-two@gmail.com",
      password: "bbBB22@@",
      nickname: "twomy",
      privileges: "Editor",
      date_created: new Date("2029-02-22T16:28:32.615Z")
    },
    {
      id: 3,
      first_name: "test-three",
      last_name: "user-three",
      username: "test-user-three",
      email: "test-three@gmail.com",
      password: "ccCC33##",
      nickname: "bob",
      privileges: "Writer",
      date_created: new Date("2020-01-22T14:28:32.615Z")
    },
    {
      id: 4,
      first_name: "test-four",
      last_name: "user-four",
      username: "test-user-four",
      email: "test-four@gmail.com",
      password: "ddDD44$$",
      nickname: null,
      privileges: "User",
      date_created: new Date("2019-10-23T01:28:32.615Z")
    }
  ];
}

function makeBlogsArray(users) {
  return [
    {
      id: 1,
      title: "first test blog",
      content:
        "Mauris ut nibh non nisl ultricies cursus. Praesent ex magna, volutpat et justo id, lobortis condimentum arcu.",
      author_id: users[0].id,
      picture: "https://picsum.photos/seed/three/900/510",
      date_created: new Date("December 22, 2019")
    },
    {
      id: 2,
      title: "second test blog",
      content:
        "Fusce feugiat, ligula a fringilla gravida, elit diam facilisis quam, ut lobortis sapien quam vitae purus.",
      author_id: users[1].id,
      picture: "https://picsum.photos/seed/2/900/510",
      date_created: new Date("August 15, 2019")
    },
    {
      id: 3,
      title: "third test blog",
      content:
        "2.5 quintillion bytes of data are produced every day in the world and that number is going to continue to explode with the popularity of IoT (the Internet of Things).",
      author_id: users[2].id,
      picture: "https://picsum.photos/seed/one/900/510",
      date_created: new Date("May 4, 2019")
    },
    {
      id: 4,
      title: "Better Commit Messages",
      content:
        "Fusce feugiat, ligula a fringilla gravida, elit diam facilisis quam, ut lobortis sapien quam vitae purus. Donec volutpat, risus eget hendrerit pharetra, erat eros hendrerit nisi, sit amet rhoncus tellus tortor eu nisi.",
      author_id: users[2].id,
      picture: "https://picsum.photos/seed/dino/900/510",
      date_created: new Date("January 5, 2020")
    }
  ];
}

function makeViewsArray(users, blogs) {
  return [
    {
      id: 1,
      date_viewed: new Date("February 5, 2020"),
      blog_id: blogs[0].id,
      reader_id: users[0].id
    },
    {
      id: 2,
      date_viewed: new Date("December 6, 2019"),
      blog_id: blogs[1].id,
      reader_id: users[1].id
    },
    {
      id: 3,
      date_viewed: new Date("November 7, 2019"),
      blog_id: blogs[0].id,
      reader_id: null
    },
    {
      id: 4,
      date_viewed: new Date("March 10, 2019"),
      blog_id: blogs[2].id,
      reader_id: users[3].id
    },
    {
      id: 5,
      date_viewed: new Date("January 2, 2018"),
      blog_id: blogs[0].id,
      reader_id: users[1].id
    },
    {
      id: 6,
      date_viewed: new Date("February 28, 2018"),
      blog_id: blogs[0].id,
      reader_id: users[2].id
    },
    {
      id: 7,
      date_viewed: new Date("March 12, 2020"),
      blog_id: blogs[1].id,
      reader_id: users[3].id
    }
  ];
}

function makeExpectedBlog(users, blog, views = []) {
  const user = users.find(user => user.id === blog.author_id);

  const blogViews = views.filter(view => view.blog_id === blog.id);

  const numbViews = blogViews.length;

  return {
    id: blog.id,
    title: blog.title,
    picture: blog.picture,
    content: blog.content,
    date_created: blog.date_created.toISOString(),
    number_of_views: numbViews,
    author: {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      nickname: user.nickname,
      username: user.username,
      privileges: user.privileges
    }
  };
}

function makeExpectedBlogViews(users, blogId, views) {
  const expectedViews = views.filter(view => view.blog_id === blogId);

  return expectedViews.map(view => {
    const blogReader = users.find(user => user.id === view.reader_id);
    return {
      id: view.id,
      date_viewed: view.date_viewed.toISOString(),
      reader: {
        ...blogReader,
        date_created: blogReader.date_created.toISOString()
      }
    };
  });
}

function makeMaliciousBlog(user) {
  const maliciousBlog = {
    id: 911,
    title: 'Naughty naughty very naughty <script>alert("xss");</script>',
    content:
      'Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.',
    author_id: user.id,
    picture: "https://picsum.photos/seed/dino/900/510",
    date_created: new Date("January 5, 2020")
  };
  const expectedBlog = {
    ...makeExpectedBlog([user], maliciousBlog),
    title:
      'Naughty naughty very naughty &lt;script&gt;alert("xss");&lt;/script&gt;',
    content:
      'Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.'
  };
  return {
    maliciousBlog,
    expectedBlog
  };
}

function makeBlogsFixtures() {
  const testUsers = makeUsersArray();
  const testBlogs = makeBlogsArray(testUsers);
  const testViews = makeViewsArray(testUsers, testBlogs);
  return { testUsers, testBlogs, testViews };
}

function cleanTables(db) {
  return db.transaction(trx =>
    trx
      .raw(
        `TRUNCATE
          views,
          blogs,
          users
        `
      )
      .then(() =>
        Promise.all([
          trx.raw(`ALTER SEQUENCE views_id_seq minvalue 0 START WITH 1`),
          trx.raw(`ALTER SEQUENCE blogs_id_seq minvalue 0 START WITH 1`),
          trx.raw(`ALTER SEQUENCE users_id_seq minvalue 0 START WITH 1`),
          trx.raw(`SELECT setval('views_id_seq', 0)`),
          trx.raw(`SELECT setval('blogs_id_seq', 0)`),
          trx.raw(`SELECT setval('users_id_seq', 0)`)
        ])
      )
  );
}

function seedUsers(db, users) {
  // TODO const preppedUsers = users.map(user => ({...user, password: bcrypt.hashSync(user.password, 1)}))
  return db
    .into("users")
    .insert(users) // TODO replace with preppedUsers
    .then(() =>
      db.raw(`SELECT setval('users_id_seq', ?)`, [users[users.length - 1].id])
    );
}

function seedBlogs(db, users, blogs, views = []) {
  return db.transaction(async trx => {
    await seedUsers(trx, users);
    await trx.into("blogs").insert(blogs);
    await trx.raw(`SELECT setval('blogs_id_seq', ?)`, [
      blogs[blogs.length - 1].id
    ]);
    if (views.length) {
      await trx.into("views").insert(views);
      await trx.raw(`SELECT setval('views_id_seq', ?)`, [
        views[views.length - 1].id
      ]);
    }
  });
}

function seedMaliciousBlog(db, user, blog) {
  return seedBlogs(db, [user], [blog]);
}

// TODO makeAuthHeader(user, secret = process.env.JWT_secret) {}

module.exports = {
  makeUsersArray,
  makeBlogsArray,
  makeExpectedBlog,
  makeExpectedBlogViews,
  makeMaliciousBlog,
  makeViewsArray,

  makeBlogsFixtures,
  cleanTables,
  seedBlogs,
  seedUsers,
  seedMaliciousBlog
};
