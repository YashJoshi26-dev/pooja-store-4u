// ─── Single source of truth for all categories ───────────────────────────────
// Used in: AddProduct, Category page, Navbar, ProductCard, productApi, backend

export const CATEGORIES = [
  { id: "fashion",          label: "Fashion",             sku: "FSH", sub: [] },
  { id: "hardware-tools",   label: "Hardware & Tools",    sku: "HTL", sub: [] },
  { id: "electronics",      label: "Electronics",         sku: "ELC", sub: [] },
  { id: "home-kitchen",     label: "Home & Kitchen Care", sku: "HKC", sub: [] },
  { id: "stationary",       label: "Stationary",          sku: "STN", sub: [] },
  { id: "organisers",       label: "Organisers",          sku: "ORG", sub: [] },
  { id: "toys",             label: "Toys",                sku: "TOY", sub: [] },
  { id: "decoration",       label: "Decoration",          sku: "DEC", sub: [] },
  { id: "gifting",          label: "Gifting Products",    sku: "GFT", sub: [] },
  { id: "jewellery",        label: "Jewellery",           sku: "JWL", sub: [] },
  { id: "kids-accessories", label: "KIDS Accessories",    sku: "KDS", sub: [] },
  { id: "women-accessories",label: "Women Accessories",   sku: "WMA", sub: [] },
  { id: "beauty-body",      label: "Beauty & Body Care",  sku: "BBC", sub: [] },

  // ── Pujan Samagri (with subcategories) ──────────────────────────────────────
  {
    id:    "pujan-samagri",
    label: "Pujan Samagri",
    sku:   "PUJ",
    sub: [
      { id: "pujan-samagri-general", label: "Pujan Samagri",       sku: "PUJ" },
      { id: "laddu-gopal-shringar",  label: "Bhagwan Ji Vastra", sku: "LAG" },
      { id: "hanuman-ji-vastra",     label: "Bhanwan Ji Shringar",    sku: ""    },
      { id: "radha-krishna-vastra",  label: "other", sku: ""    },
      // { id: "ganesh-ji-vastra",      label: "Ganesh Ji Vastra",     sku: ""    },
      // { id: "mata-chunri",           label: "Mata Chunri",          sku: ""    },
    ],
  },

  // ── Seasonable ───────────────────────────────────────────────────────────────
  { id: "holi",           label: "Holi",           sku: "HOL", sub: [] },
  { id: "raksha-bandhan", label: "Raksha Bandhan",  sku: "RAK", sub: [] },
  { id: "summer",         label: "Summer",          sku: "SUM", sub: [] },
  { id: "winter",         label: "Winter",          sku: "WIN", sub: [] },
  { id: "rainy",          label: "Rainy",           sku: "RAN", sub: [] },
];

// ─── Flat list of all category labels (for backend enum) ─────────────────────
export const ALL_CATEGORY_LABELS = [
  ...CATEGORIES.filter(c => c.sub.length === 0).map(c => c.label),
  ...CATEGORIES.filter(c => c.sub.length > 0).flatMap(c => c.sub.map(s => s.label)),
];

// ─── Get all parent categories ────────────────────────────────────────────────
export const PARENT_CATEGORIES = CATEGORIES.map(c => c.label);

// ─── Get subcategories for a given parent ────────────────────────────────────
export function getSubCategories(parentLabel) {
  const parent = CATEGORIES.find(c => c.label === parentLabel);
  return parent?.sub || [];
}

// ─── Check if category has subcategories ─────────────────────────────────────
export function hasSubCategories(parentLabel) {
  const parent = CATEGORIES.find(c => c.label === parentLabel);
  return (parent?.sub?.length || 0) > 0;
}