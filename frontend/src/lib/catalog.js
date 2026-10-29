import data from "../data/catalog.json";

export const categories = data.categories;
export const products = data.products;

export const getProduct = (slug) => products.find((p) => p.slug === slug);
export const getCategory = (id) => categories.find((c) => c.id === id);
export const productsIn = (id) => products.filter((p) => p.category === id || (id === "sustainable" && p.sustainability));

export const searchProducts = (q, list = products) => {
  const t = q.trim().toLowerCase();
  if (!t) return list;
  return list.filter((p) =>
    [p.name, p.family, p.shortDescription, ...(p.tags || [])].join(" ").toLowerCase().includes(t),
  );
};

export const families = [
  { name: "Stretch Film", slug: "stretch-film-biodegradable", image: "/img/stretch.jpg", text: "High-cling film that binds pallets and loose loads into one stable, protected unit — in bio-degradable and conventional grades." },
  { name: "Recyclable Honeycomb", slug: "honeycomb-pallets", image: "/img/honeycomb.jpg", text: "Paper-based cellular pallets, boxes, partitions, displays and wraps — lightweight, shock-absorbing and recyclable." },
  { name: "Carton Boxes", slug: "carton-box-5-ply", image: "/img/cartons.jpg", text: "3-ply and 5-ply corrugated cartons, custom sized and printed to your product's exact dimensions." },
  { name: "Industrial Tapes", slug: "plastic-tapes", image: "/img/tape.jpg", text: "BOPP plastic and reinforced kraft paper tapes for sealing, bundling and identification." },
  { name: "Industrial Foams", slug: "industrial-foams", image: "/img/foam.jpg", text: "Foam inserts and sheets CNC die-cut to your product geometry for shock and vibration protection." },
  { name: "Bubble Wrap", slug: "bubble-wrap", image: "/img/bubble.jpg", text: "Air-cushioned polyethylene wrap in multiple bubble sizes, including anti-static grades for electronics." },
];

export const industries = [
  { id: "warehousing", name: "Warehousing", icon: "Warehouse", image: "/img/warehouse.jpg", text: "Keep stored stock stable, identified and protected on racks and pallets.", products: ["stretch-film-conventional", "carton-box-5-ply", "plastic-tapes", "thermal-rolls"] },
  { id: "logistics", name: "Logistics", icon: "Truck", image: "/img/logistics.jpg", text: "Secure loads for handling, loading bays and multi-drop routes.", products: ["stretch-film-biodegradable", "honeycomb-pallets", "reflective-jackets"] },
  { id: "ecommerce", name: "E-commerce", icon: "PackageOpen", image: "/img/carton-open.jpg", text: "Right-sized cartons, cushioning and sealing for parcels that arrive intact.", products: ["carton-box-3-ply", "honeycomb-wrap", "bubble-wrap", "paper-tapes"] },
  { id: "manufacturing", name: "Manufacturing", icon: "Factory", image: "/img/label-press.jpg", text: "Component protection, identification labels and shop-floor PPE.", products: ["industrial-foams", "industrial-sticker-printing", "industrial-gloves", "safety-helmets"] },
  { id: "retail", name: "Retail", icon: "Store", image: "/img/display.jpg", text: "Displays, signage and point-of-sale materials that carry your brand.", products: ["display-boards", "sun-board-printing", "honeycomb-displays"] },
  { id: "industrial-packaging", name: "Industrial Packaging", icon: "Boxes", image: "/img/cartons.jpg", text: "Heavy-duty cartons, partitions and inserts for demanding goods.", products: ["carton-box-5-ply", "honeycomb-partitions", "industrial-foams"] },
  { id: "export", name: "Export", icon: "Ship", image: "/img/pallets.jpg", text: "Lightweight honeycomb pallets, tamper-evident labels and long-haul wrapping.", products: ["honeycomb-pallets", "industrial-sticker-printing", "stretch-film-conventional"] },
  { id: "transportation", name: "Transportation", icon: "Container", image: "/img/stretch.jpg", text: "Load stabilisation that resists shift, dust and moisture over distance.", products: ["stretch-film-biodegradable", "bubble-wrap", "honeycomb-die-cuts"] },
  { id: "printing", name: "Printing & Branding", icon: "Printer", image: "/img/banner.jpg", text: "Banners, stickers, sun boards and eco-material printing for every surface.", products: ["recyclable-banners", "eco-friendly-material-printing", "industrial-sticker-printing"] },
  { id: "safety", name: "Workplace Safety", icon: "HardHat", image: "/img/vests.jpg", text: "Helmets, gloves, jackets, masks, glasses and safety shoes for your team.", products: ["safety-helmets", "industrial-gloves", "reflective-jackets", "safety-shoes"] },
];

export const CONTACT = {
  phones: ["9500868288", "9445424938"],
  phone: "9500868288 / 9445424938",
  email: "twistywrapenterprises@outlook.com",
  address: "No:25/1, 1st Main Road, North Jaganathan Nagar, Villivakkam, Chennai 600049",
};

export const PARTNERS = ["Sathanand.M", "Harish Kumar.S"];

export const isFlagship = (p) => p.family === "Stretch Film" || p.family === "Recyclable Honeycomb";
