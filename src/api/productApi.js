// ─── Product API — real backend only, no fake/random data ────────────────────
import api from "./api";

export async function getAllProducts(filters = {}) {
  const params = new URLSearchParams();
  if (filters.categories?.length) {
    params.append("categories", filters.categories.join(","));
  } else if (filters.category) {
    params.append("category", filters.category);
  }
  if (filters.brand)    params.append("brand",    filters.brand);
  if (filters.minPrice) params.append("minPrice", filters.minPrice);
  if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);
  if (filters.rating)   params.append("rating",   filters.rating);
  if (filters.inStock)  params.append("inStock",  filters.inStock);
  if (filters.search)   params.append("search",   filters.search);
  if (filters.sort)     params.append("sort",      filters.sort);
  const query = params.toString();
  return await api.get("/products" + (query ? "?" + query : ""));
}

export async function getProductById(id) {
  return await api.get("/products/" + id);
}

export async function getProductsByCategory(category) {
  return await api.get("/products/category/" + encodeURIComponent(category));
}

export async function getProductsByCategories(categoriesArray) {
  const joined = categoriesArray.join(",");
  return await api.get("/products?categories=" + encodeURIComponent(joined));
}

export async function searchProducts(query) {
  return await api.get("/products?search=" + encodeURIComponent(query));
}

export async function filterProducts(filters) {
  return await getAllProducts(filters);
}

// ─── addProduct ───────────────────────────────────────────────────────────────
export async function addProduct(data) {
  if (data instanceof FormData) {
    return await api.upload("/products", data, "POST");
  }

  const formData = new FormData();
  formData.append("title",       data.name        || "");
  formData.append("description", data.description || "");
  formData.append("brand",       data.brand       || "PoojaStore4u");
  formData.append("stock",       data.stock       || 0);
  formData.append("sku",         data.sku         || "");
  formData.append("status",      data.status      || "active");
  formData.append("weight",      data.weight      || 0);
  formData.append("featured",    data.featured    || false);
  formData.append("variants",    JSON.stringify(data.variants || []));

  const cats = data.categories?.length
    ? data.categories
    : data.category ? [data.category] : [];
  formData.append("categories", JSON.stringify(cats));

  if (data.discountPrice && data.price) {
    formData.append("price",    data.discountPrice);
    formData.append("oldPrice", data.price);
  } else {
    formData.append("price", data.price || 0);
  }

  if (data.tags?.length) {
    formData.append("tags", JSON.stringify(data.tags));
  }

  if (data.images?.length) {
    data.images.forEach((img) => {
      if (img?.file instanceof File) {
        formData.append("images", img.file);
      }
    });
  }

  return await api.upload("/products", formData, "POST");
}

// ─── updateProduct ────────────────────────────────────────────────────────────
export async function updateProduct(id, data) {
  if (data instanceof FormData) {
    return await api.upload("/products/" + id, data, "PUT");
  }

  const formData = new FormData();

  const simpleFields = [
    "title", "description", "category", "brand",
    "stock", "sku", "status", "price", "oldPrice",
    "weight", "featured",
  ];
  simpleFields.forEach((key) => {
    if (data[key] !== undefined && data[key] !== null && data[key] !== "") {
      formData.append(key, data[key]);
    }
  });

  if (data.tags)           formData.append("tags",           JSON.stringify(data.tags));
  if (data.categories)     formData.append("categories",     JSON.stringify(data.categories));
  if (data.variants)       formData.append("variants",       JSON.stringify(data.variants));
  if (data.specifications) formData.append("specifications", JSON.stringify(data.specifications));

  if (data.images?.length) {
    data.images.forEach((img) => {
      if (img?.file instanceof File) {
        formData.append("images", img.file);
      }
    });
  }

  return await api.upload("/products/" + id, formData, "PUT");
}

// ─── deleteProduct ────────────────────────────────────────────────────────────
export async function deleteProduct(id) {
  return await api.delete("/products/" + id);
}

// ─── getAdminProducts ─────────────────────────────────────────────────────────
export async function getAdminProducts() {
  return await api.get("/products?status=all");
}