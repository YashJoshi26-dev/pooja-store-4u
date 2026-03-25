// ─── Simulated Product API with localStorage CRUD ────────────────────────────

// Categories
const categories = [
  "Electronics", "Mobiles", "Fashion", "Home & Kitchen",
  "Beauty", "Books", "Sports", "Toys", "Computers", "Accessories", "Furniture"
]

// Brands (your store categories used as brands)
const brands = [
  "HouseHold", "HandTools", "Fashion", "Home & Kitchen",
  "Seasonable", "Stationary", "Organiser", "Toys", "Decoration", "Gift", "Puja"
]

// Images
const images = [
  "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800",
  "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800",
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800",
  "https://images.unsplash.com/photo-1518444065439-e933c06ce9cd?w=800",
  "https://images.unsplash.com/photo-1503602642458-232111445657?w=800",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800",
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
]

// Helpers
const random = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min

const randomItem = (arr) =>
  arr[Math.floor(Math.random() * arr.length)]

// Mock Products
const mockProducts = Array.from({ length: 450 }, (_, index) => {
  const price = random(300, 50000)
  const oldPrice = price + random(200, 5000)

  return {
    id: index + 1,
    title: `${randomItem(brands)} Premium Product ${index + 1}`,
    category: randomItem(categories),
    brand: randomItem(brands),
    image: randomItem(images),
    price,
    oldPrice,
    rating: parseFloat((Math.random() * 2 + 3).toFixed(1)),
    stock: random(0, 120),
    reviews: random(5, 500),
    description:
      "High quality product designed for modern lifestyle. Built with premium materials and latest technology.",
    specifications: {
      weight: `${random(1, 5)} kg`,
      warranty: `${random(6, 24)} months`,
      brand: randomItem(brands),
    },
    isCustom: false,
  }
})

// Delay (simulate API)
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// ─── localStorage helpers ─────────────────────────────────────────────────────

const STORAGE_KEY = "admin_products"

function getCustomProducts() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []
  } catch {
    return []
  }
}

function saveCustomProducts(products) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products))
}

// ─── PUBLIC API ───────────────────────────────────────────────────────────────

// Get all products (custom first)
export async function getAllProducts() {
  await delay(300)
  const custom = getCustomProducts()
  return [...custom, ...mockProducts]
}

// Get single product
export async function getProductById(id) {
  await delay(200)
  const all = [...getCustomProducts(), ...mockProducts]
  return all.find((p) => p.id === Number(id)) || null
}

// Get by category
export async function getProductsByCategory(category) {
  await delay(300)
  const all = [...getCustomProducts(), ...mockProducts]

  return all.filter(
    (p) =>
      p.category.toLowerCase() === category.toLowerCase()
  )
}

// Search
export async function searchProducts(query) {
  await delay(300)
  const all = [...getCustomProducts(), ...mockProducts]

  return all.filter((p) =>
    p.title.toLowerCase().includes(query.toLowerCase())
  )
}

// Filter
export async function filterProducts({
  category,
  brand,
  minPrice,
  maxPrice,
  rating,
  inStock,
}) {
  await delay(300)
  const all = [...getCustomProducts(), ...mockProducts]

  return all.filter((p) => {
    if (category && p.category.toLowerCase() !== category.toLowerCase()) return false
    if (brand && p.brand.toLowerCase() !== brand.toLowerCase()) return false
    if (minPrice && p.price < minPrice) return false
    if (maxPrice && p.price > maxPrice) return false
    if (rating && p.rating < rating) return false
    if (inStock && p.stock <= 0) return false
    return true
  })
}

// Add product
export async function addProduct(productData) {
  await delay(200)

  const custom = getCustomProducts()

  const newProduct = {
    id: Date.now(),
    title: productData.name,
    category: productData.category,
    brand: productData.brand || "Custom",
    image: productData.images?.[0]?.url || randomItem(images),
    price: Number(productData.discountPrice || productData.price),
    oldPrice: productData.discountPrice
      ? Number(productData.price)
      : null,
    rating: 0,
    stock: Number(productData.stock || 0),
    reviews: 0,
    description: productData.description || "",
    specifications: {
      weight: "N/A",
      warranty: "N/A",
      brand: productData.brand || "Custom",
    },
    sku: productData.sku || "",
    tags: productData.tags || [],
    status: productData.status || "active",
    isCustom: true,
    createdAt: new Date().toISOString(),
  }

  if (newProduct.status === "active") {
    saveCustomProducts([newProduct, ...custom])
  }

  return newProduct
}

// Delete product
export async function deleteProduct(id) {
  await delay(150)

  const custom = getCustomProducts()
  saveCustomProducts(custom.filter((p) => p.id !== id))

  return true
}

// Update product
export async function updateProduct(id, updates) {
  await delay(200)

  const custom = getCustomProducts()

  const updated = custom.map((p) =>
    p.id === id
      ? {
          ...p,
          ...updates,
          title: updates.name || p.title,
        }
      : p
  )

  saveCustomProducts(updated)

  return updated.find((p) => p.id === id)
}

// Admin products only
export async function getAdminProducts() {
  await delay(150)
  return getCustomProducts()
}