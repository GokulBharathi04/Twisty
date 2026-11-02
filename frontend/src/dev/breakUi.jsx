// Dev-only stress-test datasets (break-ui). Loaded through a NODE_ENV-guarded
// require, so production builds never bundle this file or its fixture.
import worst from "./catalog.worst.json";

const MODES = [
  ["demo", "Demo data"],
  ["worst", "Worst case"],
  ["empty", "Empty"],
  ["one", "One"],
  ["1000", "1,000 rows"],
];
const KEY = "tw-data";

// ?data=<mode> wins and is remembered for the tab, so in-app navigation
// (which drops the query string) keeps the chosen dataset.
const readMode = () => {
  const fromUrl = new URLSearchParams(window.location.search).get("data");
  try {
    if (fromUrl) sessionStorage.setItem(KEY, fromUrl);
    return fromUrl || sessionStorage.getItem(KEY) || "demo";
  } catch {
    return fromUrl || "demo";
  }
};

export const mode = readMode();

export const pick = (demo) => {
  switch (mode) {
    case "worst": return worst;
    case "empty": return { ...demo, products: [] };
    case "one": return { ...demo, products: demo.products.slice(0, 1) };
    case "1000": {
      const products = Array.from({ length: 1000 }, (_, i) => {
        const p = demo.products[i % demo.products.length];
        return { ...p, slug: `${p.slug}-${i}` };
      });
      return { ...demo, products };
    }
    default: return demo;
  }
};

const set = (m) => {
  const url = new URL(window.location.href);
  url.searchParams.set("data", m);
  try { sessionStorage.setItem(KEY, m); } catch {}
  window.location.assign(url);
};

export const DataToggle = () => (
  <div
    role="radiogroup"
    aria-label="Dataset"
    style={{
      position: "fixed", left: 12, bottom: 12, zIndex: 2147483647, display: "flex", gap: 2, padding: 3,
      borderRadius: 999, background: "#e4e4e7", font: "12px/1 system-ui, sans-serif", boxShadow: "0 1px 3px rgba(0,0,0,.2)",
    }}
  >
    {MODES.map(([id, label]) => (
      <button
        key={id}
        role="radio"
        aria-checked={mode === id}
        onClick={() => set(id)}
        style={{
          border: 0, borderRadius: 999, padding: "6px 10px", cursor: "pointer", color: "#18181b",
          background: mode === id ? "#fff" : "transparent", boxShadow: mode === id ? "0 1px 2px rgba(0,0,0,.15)" : "none",
        }}
      >
        {label}
      </button>
    ))}
  </div>
);
