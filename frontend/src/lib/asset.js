// Prefix a root-relative public file with the deploy base path, so images
// resolve when the site is served from a subfolder (GitHub Pages serves it at
// /Twisty/). Locally PUBLIC_URL is empty and paths are returned unchanged.
export const asset = (path) => (typeof path === "string" && path.startsWith("/") ? `${process.env.PUBLIC_URL}${path}` : path);
