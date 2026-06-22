export default function (eleventyConfig) {
  const M = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  eleventyConfig.addFilter("readable", (d) => {
    const x = new Date(d);
    return M[x.getUTCMonth()] + " " + x.getUTCDate() + ", " + x.getUTCFullYear();
  });
  eleventyConfig.addFilter("rfc822", (d) => new Date(d).toUTCString());
  // hand-built static pages: copy verbatim so /work.html etc. keep their exact paths
  ["index", "work", "davidisdeploying", "resume"].forEach((p) =>
    eleventyConfig.addPassthroughCopy({ ["site/" + p + ".html"]: p + ".html" })
  );
  return {
    dir: { input: "site", includes: "_includes", output: "_site" },
    htmlTemplateEngine: false,
    markdownTemplateEngine: false,
  };
}
