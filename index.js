require("dotenv").config();
const express = require("express");
const _ = require("lodash");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 9000;

const uri = process.env.URI;
const secret = process.env.SECRET;

async function fetchData() {
  const response = await axios.get(uri, {
    headers: {
      "x-hasura-admin-secret": secret,
    },
  });
  return response.data.blogs;
}

// find blogs with privacy in the title
function containPrivacyInTitle(data) {
  const newData = data.filter((blog) =>
    _.includes(_.toLower(blog.title), "privacy")
  );

  return _.size(newData);
}

app.use("/api/blog-stats", async (req, res, next) => {
  try {
    const response = await axios.get(url, {
      headers: {
        "x-hasura-admin-secret": secret,
      },
    });
    // console.log(response.error);

    if (!response.data.blogs) {
      return res.status(404).json({ error: "No blog found" });
    }
    const { blogs } = response.data;

    // // Calculate the total number of blogs fetched
    const totalBlogs = _.size(blogs);

    //Find the blog with the longest title
    const sorteBlogByTitle = _.sortBy(blogs, [(blog) => blog.title.length]);
    const longestTitleBlog = sorteBlogByTitle[sorteBlogByTitle.length - 1];

    //Determine the number of blogs with titles containing the word "privacy."
    const numberOfBlog = containPrivacyInTitle(blogs);

    //Create an array of unique blog titles (no duplicates)
    const uniqueArray = _.unionBy(blogs, "title");
    return res.status(200).json({
      totalBlogs,
      numberOfBlog,
      longestTitleBlog,
      uniqueArray,
    });
  } catch (error) {
    return next(error);
  }
});

// Search functionality
app.use("/api/blog-search", async (req, res, next) => {
  try {
    const { privacy } = req.query;

    const blogs = await fetchData();

    if (!blogs) {
      return res.status(404).json({ msg: "No blog found" });
    }

    const searchBlogs = blogs.filter((blog) =>
      _.includes(_.toLower(blog.title), _.toLower(privacy))
    );

    if (!searchBlogs.length) {
      return res.status(404).json({ msg: "No blog found" });
    }

    return res.status(200).json({ blogs: searchBlogs });
  } catch (error) {
    return next(error);
  }
});

// global error handler
app.use((error, req, res, next) => {
  if (error) {
    const status = error?.response?.status || 500;
    res.status(status).json({ error: error.message });
  }
  next();
});

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
