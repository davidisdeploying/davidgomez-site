import { hierarchy, pack } from "d3-hierarchy";

export default function (eleventyConfig) {
  const M = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const slugify = (s) => String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  eleventyConfig.addFilter("readable", (d) => {
    const x = new Date(d);
    return M[x.getUTCMonth()] + " " + x.getUTCDate() + ", " + x.getUTCFullYear();
  });
  eleventyConfig.addFilter("rfc822", (d) => new Date(d).toUTCString());
  eleventyConfig.addFilter("isoDate", (d) => new Date(d).toISOString().slice(0, 10));
  eleventyConfig.addFilter("topicSlug", slugify);

  eleventyConfig.addGlobalData("monthsOnJob", () => {
    const start = new Date(2025, 8, 15);
    const now = new Date();
    let m = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
    if (now.getDate() < start.getDate()) m--;
    if (m < 0) m = 0;
    return m + "+";
  });

  const gather = (api) => {
    const map = new Map();
    api.getFilteredByTag("post").forEach((post) => {
      (post.data.topics || []).forEach((raw) => {
        const topic = String(raw).trim();
        if (!topic) return;
        const slug = slugify(topic);
        if (!map.has(slug)) map.set(slug, { topic, slug, posts: [] });
        map.get(slug).posts.push(post);
      });
    });
    return [...map.values()]
      .map((o) => ({ topic: o.topic, slug: o.slug, count: o.posts.length, posts: o.posts }))
      .sort((a, b) => b.count - a.count || a.topic.localeCompare(b.topic));
  };

  eleventyConfig.addCollection("topics", (api) => gather(api));

  eleventyConfig.addCollection("topicmap", (api) => {
    const topics = gather(api);
    const W = 760, H = 480;
    if (!topics.length) return { w: W, h: H, nodes: [] };
    const root = hierarchy({ children: topics.map((t) => ({ ...t, value: t.count })) }).sum((d) => d.value || 0);
    pack().size([W, H]).padding(8)(root);
    const nodes = root.leaves().map((n) => {
      const r = n.r;
      const showLabel = r > 30;
      const cfont = Math.max(11, Math.min(Math.round(r * 0.62), 36));
      const lfont = Math.max(8.5, Math.min(r * 0.2, 12.5));
      return {
        topic: n.data.topic, slug: n.data.slug, count: n.data.count,
        x: +n.x.toFixed(1), y: +n.y.toFixed(1), r: +r.toFixed(1),
        cfont, lfont: +lfont.toFixed(1), showLabel,
        cyCount: +(showLabel ? n.y - r * 0.16 : n.y).toFixed(1),
        cyLabel: +(n.y + r * 0.34).toFixed(1),
      };
    });
    return { w: W, h: H, nodes };
  });

  ["davidisdeploying", "resume", "404"].forEach((p) =>
    eleventyConfig.addPassthroughCopy({ ["site/" + p + ".html"]: p + ".html" })
  );
  ["og.png", "favicon.png", "apple-touch-icon.png", "robots.txt", "motion.css"].forEach((f) =>
    eleventyConfig.addPassthroughCopy({ ["site/" + f]: f })
  );
  return {
    dir: { input: "site", includes: "_includes", output: "_site" },
    htmlTemplateEngine: false,
    markdownTemplateEngine: false,
  };
}
