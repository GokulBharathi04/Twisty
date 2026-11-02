// Writes the sitemap index, its child sitemaps and robots.txt into build/ (runs as `postbuild`).
// Usage: node scripts/sitemap.mjs [outDir]
//   SITE_URL      canonical origin + base path (default https://twistywrapenterprises.com)
//   SITE_NOINDEX  "1" for test copies (GitHub Pages): robots.txt blocks all crawlers, no sitemap advertised
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = process.argv[2] || join(root, "build");
const SITE = (process.env.SITE_URL || "https://twistywrapenterprises.com").replace(/\/+$/, "");
const NOINDEX = process.env.SITE_NOINDEX === "1";
const today = new Date().toISOString().slice(0, 10);

const catalog = JSON.parse(readFileSync(join(root, "src/data/catalog.json"), "utf8"));
const categoryName = Object.fromEntries(catalog.categories.map((c) => [c.id, c.name]));

// Routes from src/App.js. /enquire is an alias of /contact, so only /contact is listed.
export const pages = [
  { path: "/", title: "Home", changefreq: "weekly", priority: "1.0" },
  { path: "/products", title: "Products", changefreq: "weekly", priority: "0.9" },
  { path: "/sustainability", title: "Sustainability", changefreq: "monthly", priority: "0.8" },
  { path: "/applications", title: "Applications", changefreq: "monthly", priority: "0.7" },
  { path: "/about", title: "About", changefreq: "monthly", priority: "0.6" },
  { path: "/contact", title: "Contact / Enquire", changefreq: "yearly", priority: "0.6" },
];
export const products = catalog.products.map((p) => ({
  path: `/products/${p.slug}`,
  title: p.name,
  category: categoryName[p.category] || p.category,
  family: p.family,
  changefreq: "monthly",
  priority: p.featured || p.family === "Stretch Film" || p.family === "Recyclable Honeycomb" ? "0.8" : "0.7",
}));

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const urlset = (list) =>
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`
  + list.map((u) => `  <url>\n    <loc>${esc(SITE + (u.path === "/" ? "/" : u.path))}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>\n`).join("")
  + `</urlset>\n`;
const index = (files) =>
  `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`
  + files.map((f) => `  <sitemap>\n    <loc>${esc(`${SITE}/${f}`)}</loc>\n    <lastmod>${today}</lastmod>\n  </sitemap>\n`).join("")
  + `</sitemapindex>\n`;

mkdirSync(out, { recursive: true });
writeFileSync(join(out, "sitemap-pages.xml"), urlset(pages));
writeFileSync(join(out, "sitemap-products.xml"), urlset(products));
writeFileSync(join(out, "sitemap.xml"), index(["sitemap-pages.xml", "sitemap-products.xml"]));
writeFileSync(join(out, "robots.txt"), NOINDEX
  ? "# Test copy of the site: keep it out of search results.\nUser-agent: *\nDisallow: /\n"
  : `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${SITE}/sitemap.xml\n`);
console.log(`sitemap: ${pages.length} pages + ${products.length} products for ${SITE}${NOINDEX ? " (noindex)" : ""} -> ${out}`);
