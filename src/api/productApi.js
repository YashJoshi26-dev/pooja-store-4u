// ─── Product API — real backend only, no fake/random data ────────────────────
import api from "./api";

export async function getAllProducts(filters = {}) {
  const params = new URLSearchParams();
  if (filters.category) params.append("category", filters.category);
  if (filters.brand)    params.append("brand",    filters.brand);
  if (filters.minPrice) params.append("minPrice", filters.minPrice);
  if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);
  if (filters.rating)   params.append("rating",   filters.rating);
  if (filters.inStock)  params.append("inStock",  filters.inStock);
  if (filters.search)   params.append("search",   filters.search);
  if (filters.sort)     params.append("sort",     filters.sort);
  const query = params.toString();
  return await api.get(`/products${query ? `?${query}` : ""}`);
}

export async function getProductById(id) {
  return await api.get(`/products/${id}`);
}

export async function getProductsByCategory(category) {
  return await api.get(`/products/category/${encodeURIComponent(category)}`);
}

export async function searchProducts(query) {
  return await api.get(`/products?search=${encodeURIComponent(query)}`);
}

export async function filterProducts(filters) {
  return await getAllProducts(filters);
}

// ─── addProduct ───────────────────────────────────────────────────────────────
// ✅ FIX 1: Now accepts either a plain object OR a ready-made FormData
//    AddProduct.jsx now sends FormData directly → just forward it
export async function addProduct(data) {
  // If AddProduct.jsx already built FormData, send it directly
  if (data instanceof FormData) {
    return await api.upload("/products", data, "POST");
  }

  // Fallback: build FormData from plain object (legacy support)
  const formData = new FormData();
  formData.append("title",       data.name        || "");
  formData.append("description", data.description || "");
  formData.append("category",    data.category    || "");
  formData.append("brand",       data.brand       || "Custom");
  formData.append("stock",       data.stock       || 0);
  formData.append("sku",         data.sku         || "");
  formData.append("status",      data.status      || "active");

  // ✅ FIX 2: price logic — price = selling price, oldPrice = MRP (strikethrough)
  if (data.discountPrice && data.price) {
    formData.append("price",    data.discountPrice); // selling price sent to backend
    formData.append("oldPrice", data.price);         // MRP shown as strikethrough
  } else {
    formData.append("price", data.price || 0);
  }

  if (data.tags?.length) {
    formData.append("tags", JSON.stringify(data.tags));
  }

  // ✅ FIX 3: field name must be "images" to match upload.array("images", 6)
  if (data.images?.length) {
    data.images.forEach((img) => {
      if (img?.file instanceof File) {          // only append real File objects
        formData.append("images", img.file);   // ← "images" not "image"
      }
    });
  }

  return await api.upload("/products", formData, "POST");
}

// ─── updateProduct ────────────────────────────────────────────────────────────
// ✅ FIX 4: Object.entries loop was appending arrays/objects as "[object Object]"
//    Now handles tags, specifications, and image files correctly
export async function updateProduct(id, data) {
  // If caller already passed FormData, send directly
  if (data instanceof FormData) {
    return await api.upload(`/products/${id}`, data, "PUT");
  }

  const formData = new FormData();

  // Simple string/number fields
  const simpleFields = ["title", "description", "category", "brand", "stock", "sku", "status", "price", "oldPrice"];
  simpleFields.forEach((key) => {
    if (data[key] !== undefined && data[key] !== null && data[key] !== "") {
      formData.append(key, data[key]);
    }
  });

  // Arrays/objects must be JSON stringified
  if (data.tags)           formData.append("tags",           JSON.stringify(data.tags));
  if (data.specifications) formData.append("specifications", JSON.stringify(data.specifications));

  // Image files
  if (data.images?.length) {
    data.images.forEach((img) => {
      if (img?.file instanceof File) {
        formData.append("images", img.file);
      }
    });
  }

  return await api.upload(`/products/${id}`, formData, "PUT");
}

// ─── deleteProduct ────────────────────────────────────────────────────────────
export async function deleteProduct(id) {
  return await api.delete(`/products/${id}`);
}

// ─── getAdminProducts ─────────────────────────────────────────────────────────
export async function getAdminProducts() {
  return await api.get("/products?status=all");
}