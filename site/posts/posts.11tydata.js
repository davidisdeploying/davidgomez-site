export default {
  layout: "post.njk",
  tags: "post",
  eleventyComputed: {
    permalink: (data) => `/devblog/${data.page.fileSlug}.html`,
  },
};
