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
    const numberOfBlog = containPrivacyInTitle(blogs).length;

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

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
