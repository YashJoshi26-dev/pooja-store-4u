import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { addProduct, updateProduct, getProductById } from "../../api/productApi";
import { CATEGORIES, getSubCategories } from "../../data/categories";

const tags = ["New Arrival", "Best Seller", "Sale", "Featured", "Limited Edition", "Trending"];

export default function AddProduct() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit"); // ✅ null = add mode, string = edit mode
  const isEdit = !!editId;

  const [form, setForm] = useState({
    name: "", parentCategory: "", category: "", categories: [], // ✅ fix: add categories array
    price: "", discountPrice: "",
    stock: "", sku: "", description: "", tags: [], status: "active", brand: "",
    weight: "",
    featured: false,
    variants: [],
  });
  const [images, setImages] = useState([]);
  const [existingImg, setExistingImg] = useState(""); // ✅ current Cloudinary image
  const [dragOver, setDragOver] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [loadingEdit, setLoadingEdit] = useState(isEdit);
  const [catDropdownOpen, setCatDropdownOpen] = useState(false); // ✅ fix: was missing
  const fileRef = useRef();

  // ✅ Load existing product data when in edit mode
  useEffect(() => {
    if (!editId) return;
    async function loadProduct() {
      try {
        const p = await getProductById(editId);
        // Find parent category
        const parentCat = CATEGORIES.find(c =>
          c.label === p.category ||
          c.sub?.some(s => s.label === p.category)
        );
        setForm({
          name: p.title || "",
          parentCategory: parentCat?.label || p.category || "",
          category: p.category || "",
          categories: (p.categories?.length ? p.categories : null) || (p.category ? [p.category] : []), // ✅ fix
          price: p.oldPrice || p.price || "", // MRP
          discountPrice: p.oldPrice ? p.price : "",       // selling price if discount exists
          stock: p.stock || "",
          sku: p.sku || "",
          description: p.description || "",
          tags: p.tags || [],
          status: p.status || "active",
          brand: p.brand || "",
          weight: p.weight || "",
          featured: p.featured || false,
          variants: p.variants || [],
        });
        // ✅ Store existing image URL to show in preview
        if (p.image || p.images?.[0]) {
          setExistingImg(p.image || p.images?.[0]);
        }
      } catch (err) {
        setError("Failed to load product data.");
      } finally {
        setLoadingEdit(false);
      }
    }
    loadProduct();
  }, [editId]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleParentCategory = (e) => {
    const parent = e.target.value;
    const subs = getSubCategories(parent);
    setForm(f => ({ ...f, parentCategory: parent, category: subs.length === 0 ? parent : "" }));
  };

  const toggleTag = (tag) => setForm(f => ({
    ...f,
    tags: f.tags.includes(tag) ? f.tags.filter(t => t !== tag) : [...f.tags, tag],
  }));

  const handleFiles = (files) => {
    const newImgs = Array.from(files).map(file => ({
      url: URL.createObjectURL(file), file, name: file.name,
    }));
    setImages(prev => [...prev, ...newImgs].slice(0, 6));
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const validate = () => {
    if (!form.name.trim()) return "Product name is required.";
    if (!form.categories?.length) return "Please select at least one category.";
    if (!form.price || isNaN(form.price)) return "Please enter a valid price.";
    if (!form.stock || isNaN(form.stock)) return "Please enter stock quantity.";
    return null;
  };

  // ✅ Submit handles both ADD and EDIT
  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    setError(""); setSaving(true);

    try {
      if (isEdit) {
        // ── EDIT MODE ──────────────────────────────────────────────────────────
        const formData = new FormData();
        formData.append("title", form.name);
        formData.append("description", form.description || "");
        formData.append("category",   form.categories?.[0] || form.category || "");
        formData.append("categories", JSON.stringify(form.categories || []));
        formData.append("brand", form.brand || "Custom");
        formData.append("stock", form.stock);
        formData.append("sku", form.sku || "");
        formData.append("status", form.status);
        formData.append("tags", JSON.stringify(form.tags));
        formData.append("weight", form.weight || 0);
        formData.append("featured", form.featured);
        const cleanVariants = form.variants.filter(v => v.size || v.color || v.design)
        formData.append("variants", JSON.stringify(cleanVariants));

        if (form.discountPrice && form.price) {
          formData.append("oldPrice", form.price);
          formData.append("price", form.discountPrice);
        } else {
          formData.append("price", form.price);
        }

        // Only upload new images if user selected new ones
        if (images.length > 0) {
          images.forEach(img => { if (img.file) formData.append("images", img.file); });
        }

        await updateProduct(editId, formData);
      } else {
        // ── ADD MODE ───────────────────────────────────────────────────────────
        await addProduct({ ...form, images });
      }

      setSaved(true);
      setTimeout(() => navigate("/admin/products"), 2000);
    } catch (err) {
      setError(err.message || "Failed to save product. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const steps = [
    { label: "Basic Info", icon: "📋" },
    { label: "Images", icon: "🖼️" },
    { label: "Pricing", icon: "💰" },
    { label: "Publish", icon: "🚀" },
  ];

  const discount = form.price && form.discountPrice
    ? Math.round((1 - form.discountPrice / form.price) * 100) : 0;

  // ✅ Shipping logic
  const sellingPrice = Number(form.discountPrice || form.price) || 0;
  const weightKg = Number(form.weight) || 0;
  const shipping = sellingPrice >= 499
    ? 0                          // free shipping if price >= ₹499
    : weightKg >= 1 ? 180 : 79; // ₹180 heavy, ₹79 light

  const subCategories = getSubCategories(form.parentCategory);

  const checklistItems = [
    ["Product name added", !!form.name],
    ["Category selected", (form.categories?.length ?? 0) > 0],
    ["At least 1 image", images.length > 0 || !!existingImg],
    ["Price set", !!form.price],
    ["Stock quantity", !!form.stock],
    ["Description added", form.description.length > 20],
  ];
  const completePct = Math.round(checklistItems.filter(([, v]) => v).length / checklistItems.length * 100);

  // Show loading spinner while fetching existing product
  if (loadingEdit) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Plus Jakarta Sans',sans-serif", color: "#aaa" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>⏳</div>
        Loading product data...
      </div>
    </div>
  );

  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        .ap-input,.ap-select,.ap-textarea{width:100%;background:#fff;border:1.5px solid #e2e2e2;border-radius:8px;padding:11px 14px;color:#1a1a1a;font-size:14px;font-family:'Plus Jakarta Sans',sans-serif;transition:border-color 0.18s,box-shadow 0.18s;outline:none;}
        .ap-input:focus,.ap-select:focus,.ap-textarea:focus{border-color:#ff3f6c;box-shadow:0 0 0 3px rgba(255,63,108,0.09);}
        .ap-input::placeholder,.ap-textarea::placeholder{color:#bbb;}
        .ap-textarea{resize:vertical;line-height:1.7;}
        .ap-tag{padding:6px 14px;border-radius:20px;font-size:12px;font-weight:600;cursor:pointer;border:1.5px solid #e2e2e2;background:#fff;color:#777;transition:all 0.15s;font-family:'Plus Jakarta Sans',sans-serif;}
        .ap-tag:hover{border-color:#ff3f6c;color:#ff3f6c;}
        .ap-tag.active{background:#fff0f4;border-color:#ff3f6c;color:#ff3f6c;}
        .ap-primary-btn{background:#ff3f6c;color:#fff;border:none;border-radius:8px;padding:13px 28px;font-size:14px;font-weight:700;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;transition:all 0.18s;}
        .ap-primary-btn:hover{background:#e6325a;transform:translateY(-1px);box-shadow:0 4px 14px rgba(255,63,108,0.3);}
        .ap-ghost-btn{background:#fff;color:#333;border:1.5px solid #e2e2e2;border-radius:8px;padding:12px 24px;font-size:14px;font-weight:600;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;transition:all 0.15s;}
        .ap-ghost-btn:hover{border-color:#ff3f6c;color:#ff3f6c;}
        .ap-save-btn{width:100%;background:#ff3f6c;color:#fff;border:none;border-radius:8px;padding:15px;font-size:15px;font-weight:700;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;transition:all 0.2s;box-shadow:0 4px 16px rgba(255,63,108,0.25);}
        .ap-save-btn:hover:not(:disabled){background:#e6325a;box-shadow:0 6px 24px rgba(255,63,108,0.38);transform:translateY(-1px);}
        .ap-save-btn:disabled{background:#ccc;cursor:not-allowed;box-shadow:none;}
        .ap-status-radio{display:none;}
        .ap-status-label{padding:9px 20px;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;border:1.5px solid #e2e2e2;color:#777;transition:all 0.15s;font-family:'Plus Jakarta Sans',sans-serif;text-transform:capitalize;}
        .ap-status-radio:checked+.ap-status-label{border-color:#ff3f6c;color:#ff3f6c;background:#fff0f4;}
        @keyframes apFadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes toastIn{from{opacity:0;transform:translateY(20px) scale(0.95)}to{opacity:1;transform:translateY(0) scale(1)}}
        .ap-panel{animation:apFadeUp 0.28s ease;}
        .ap-toast{animation:toastIn 0.3s ease;}
        .ap-img-thumb{width:82px;height:82px;border-radius:8px;object-fit:cover;border:1.5px solid #eee;}
      `}</style>

      {/* TOP NAV */}
      <div style={S.topBar}>
        <div style={S.topBarInner}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => navigate("/admin/products")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#555", padding: "4px 8px" }}>←</button>
            <span style={S.logo}><span style={{ color: "#ff3f6c" }}>Pooja</span>Store4u</span>
            <span style={{ color: "#ddd", fontSize: 18 }}>|</span>
            {/* ✅ Shows Edit Product or Add New Product based on mode */}
            <span style={{ fontSize: 13, color: "#666", fontWeight: 500 }}>{isEdit ? "Edit Product" : "Add New Product"}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button onClick={() => navigate("/admin/products")} style={{ fontSize: 13, color: "#666", fontWeight: 600, cursor: "pointer", background: "none", border: "1.5px solid #e2e2e2", borderRadius: 8, padding: "7px 16px" }}>Cancel</button>
            <div style={S.avatar}>A</div>
          </div>
        </div>
      </div>

      {/* BREADCRUMB */}
      <div style={{ background: "#fff", borderBottom: "1px solid #f0f0f0" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "10px 24px", display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 12, color: "#aaa", cursor: "pointer" }} onClick={() => navigate("/admin/dashboard")}>Dashboard</span>
          <span style={{ color: "#ddd" }}>›</span>
          <span style={{ fontSize: 12, color: "#aaa", cursor: "pointer" }} onClick={() => navigate("/admin/products")}>Products</span>
          <span style={{ color: "#ddd" }}>›</span>
          <span style={{ fontSize: 12, color: "#ff3f6c", fontWeight: 700 }}>{isEdit ? "Edit Product" : "Add New Product"}</span>
        </div>
      </div>

      <div style={S.main}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "#1a1a1a", letterSpacing: "-0.02em", marginBottom: 3 }}>
              {isEdit ? "✏️ Edit Product" : "Add New Product"}
            </h1>
            <p style={{ fontSize: 13, color: "#999" }}>
              {isEdit ? "Update your product details below" : "Complete all steps to list your product"}
            </p>
          </div>
          {/* ✅ Edit mode badge */}
          {isEdit && (
            <div style={{ background: "#eff6ff", color: "#2563eb", fontSize: 12, fontWeight: 700, padding: "6px 16px", borderRadius: 20, border: "1.5px solid #bfdbfe" }}>
              ✏️ Edit Mode
            </div>
          )}
        </div>

        {/* STEP BAR */}
        <div style={S.stepBar}>
          {steps.map((s, i) => {
            const num = i + 1, isActive = activeStep === num, isDone = activeStep > num;
            return (
              <div key={s.label} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                <div onClick={() => setActiveStep(num)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 7, cursor: "pointer", flex: 1 }}>
                  <div style={{ width: 38, height: 38, borderRadius: "50%", background: isDone ? "#ff3f6c" : isActive ? "#fff" : "#f5f5f5", border: `2px solid ${isDone || isActive ? "#ff3f6c" : "#e0e0e0"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: isDone ? 14 : 18, color: isDone ? "#fff" : "#555", boxShadow: isActive ? "0 0 0 5px rgba(255,63,108,0.1)" : "none", transition: "all 0.25s" }}>
                    {isDone ? "✓" : s.icon}
                  </div>
                  <span style={{ fontSize: 12, fontWeight: isActive ? 700 : 500, color: isActive ? "#ff3f6c" : isDone ? "#444" : "#bbb" }}>{s.label}</span>
                </div>
                {i < steps.length - 1 && <div style={{ height: 2, flex: 1, maxWidth: 50, borderRadius: 2, background: isDone ? "#ff3f6c" : "#ebebeb", marginBottom: 22, transition: "background 0.3s" }} />}
              </div>
            );
          })}
        </div>

        <div style={S.grid}>
          <div style={{ flex: 1, minWidth: 0 }}>

            {/* STEP 1 */}
            {activeStep === 1 && (
              <div className="ap-panel" style={S.card}>
                <div style={S.cardHead}><div style={S.cardIconBox}>📋</div><div><h2 style={S.cardTitle}>Basic Information</h2><p style={S.cardSub}>Product name, category and description</p></div></div>
                <hr style={S.hr} />
                <div style={S.f}>
                  <label style={S.lbl}>Product Name <span style={{ color: "#ff3f6c" }}>*</span></label>
                  <input className="ap-input" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Hanuman Ji Vastra" />
                </div>
                <div style={S.g2}>
                  <div style={S.f}>
                    <label style={S.lbl}>Categories <span style={{ color: "#ff3f6c" }}>*</span></label>

                    {/* Selected pills */}
                    {(form.categories?.length > 0) && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                        {form.categories.map(cat => (
                          <span key={cat} style={{
                            display: "flex", alignItems: "center", gap: 4,
                            background: "#fff0f4", border: "1.5px solid #ffd0db",
                            borderRadius: 20, padding: "3px 10px", fontSize: 12,
                            fontWeight: 600, color: "#ff3f6c"
                          }}>
                            {cat}
                            <button onClick={() => setForm(f => ({
                              ...f,
                              categories: f.categories.filter(c => c !== cat),
                              category: f.categories.filter(c => c !== cat)[0] || ""
                            }))} style={{
                              background: "none", border: "none",
                              cursor: "pointer", color: "#ff3f6c", fontSize: 14,
                              lineHeight: 1, padding: 0, marginLeft: 2
                            }}>×</button>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Toggle button */}
                    <div style={{ position: "relative" }}>
                      <button type="button"
                        onClick={() => setCatDropdownOpen(o => !o)}
                        className="ap-select"
                        style={{
                          display: "flex", justifyContent: "space-between",
                          alignItems: "center", cursor: "pointer", textAlign: "left"
                        }}>
                        <span style={{ color: form.categories?.length ? "#1a1a1a" : "#bbb" }}>
                          {form.categories?.length
                            ? `${form.categories.length} categor${form.categories.length > 1 ? "ies" : "y"} selected`
                            : "Select categories"}
                        </span>
                        <span style={{
                          fontSize: 10, color: "#aaa", transition: "transform 0.2s",
                          transform: catDropdownOpen ? "rotate(180deg)" : "rotate(0deg)"
                        }}>▼</span>
                      </button>

                      {/* Dropdown */}
                      {catDropdownOpen && (
                        <div style={{
                          position: "absolute", top: "calc(100% + 4px)", left: 0,
                          right: 0, background: "#fff", border: "1.5px solid #e2e2e2",
                          borderRadius: 10, maxHeight: 260, overflowY: "auto",
                          zIndex: 200, boxShadow: "0 8px 24px rgba(0,0,0,0.1)"
                        }}>
                          {CATEGORIES.map(cat => (
                            <div key={cat.id}>
                              {cat.sub?.length > 0 ? (
                                <>
                                  <div style={{
                                    padding: "6px 14px", background: "#f8f8f8",
                                    fontSize: 10, fontWeight: 800, color: "#999",
                                    letterSpacing: "0.06em", borderBottom: "1px solid #f0f0f0"
                                  }}>
                                    {cat.label.toUpperCase()}
                                  </div>
                                  {cat.sub.map(sub => (
                                    <label key={sub.id} style={{
                                      display: "flex",
                                      alignItems: "center", gap: 10,
                                      padding: "9px 14px 9px 20px",
                                      borderBottom: "1px solid #f9f9f9", cursor: "pointer",
                                      background: form.categories.includes(sub.label) ? "#fff8f9" : "#fff"
                                    }}>
                                      <input type="checkbox"
                                        checked={form.categories.includes(sub.label)}
                                        onChange={() => setForm(f => ({
                                          ...f,
                                          categories: f.categories.includes(sub.label)
                                            ? f.categories.filter(c => c !== sub.label)
                                            : [...f.categories, sub.label],
                                          category: f.categories.includes(sub.label)
                                            ? f.categories.filter(c => c !== sub.label)[0] || ""
                                            : sub.label,
                                        }))}
                                        style={{ accentColor: "#ff3f6c", width: 14, height: 14, flexShrink: 0 }} />
                                      <span style={{
                                        fontSize: 13,
                                        color: form.categories.includes(sub.label) ? "#ff3f6c" : "#555",
                                        fontWeight: form.categories.includes(sub.label) ? 600 : 400
                                      }}>
                                        {sub.label}
                                      </span>
                                    </label>
                                  ))}
                                </>
                              ) : (
                                <label style={{
                                  display: "flex", alignItems: "center", gap: 10,
                                  padding: "10px 14px", borderBottom: "1px solid #f9f9f9",
                                  cursor: "pointer",
                                  background: form.categories.includes(cat.label) ? "#fff8f9" : "#fff"
                                }}>
                                  <input type="checkbox"
                                    checked={form.categories.includes(cat.label)}
                                    onChange={() => setForm(f => ({
                                      ...f,
                                      categories: f.categories.includes(cat.label)
                                        ? f.categories.filter(c => c !== cat.label)
                                        : [...f.categories, cat.label],
                                      category: f.categories.includes(cat.label)
                                        ? f.categories.filter(c => c !== cat.label)[0] || ""
                                        : cat.label,
                                    }))}
                                    style={{ accentColor: "#ff3f6c", width: 14, height: 14, flexShrink: 0 }} />
                                  <span style={{
                                    fontSize: 13,
                                    color: form.categories.includes(cat.label) ? "#ff3f6c" : "#444",
                                    fontWeight: form.categories.includes(cat.label) ? 600 : 400
                                  }}>
                                    {cat.label}
                                  </span>
                                </label>
                              )}
                            </div>
                          ))}
                          <div style={{
                            padding: "10px 14px", borderTop: "1px solid #f0f0f0",
                            background: "#fafafa", display: "flex", justifyContent: "space-between",
                            alignItems: "center"
                          }}>
                            <span style={{ fontSize: 11, color: "#aaa", fontWeight: 600 }}>
                              {form.categories?.length ?? 0} selected
                            </span>
                            <button type="button" onClick={() => setCatDropdownOpen(false)}
                              style={{
                                background: "#ff3f6c", color: "#fff", border: "none",
                                borderRadius: 6, padding: "5px 14px", fontSize: 12,
                                fontWeight: 700, cursor: "pointer"
                              }}>
                              Done ✓
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div style={S.g2}>
                  <div style={S.f}>
                    <label style={S.lbl}>Brand</label>
                    <input className="ap-input" name="brand" value={form.brand} onChange={handleChange} placeholder="e.g. PoojaStore4u" />
                  </div>
                  <div style={S.f}>
                    <label style={S.lbl}>SKU</label>
                    <input className="ap-input" name="sku" value={form.sku} onChange={handleChange} placeholder="e.g. PUJ-001" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 13 }} />
                  </div>
                </div>
                <div style={S.f}>
                  <label style={S.lbl}>Description</label>
                  <textarea className="ap-textarea" name="description" value={form.description} onChange={handleChange} rows={4} placeholder="Describe the product..." />
                  <p style={{ fontSize: 11, color: "#bbb", textAlign: "right", marginTop: 4 }}>{form.description.length}/2000</p>
                </div>
              </div>
            )}

            {/* STEP 2 */}
            {activeStep === 2 && (
              <div className="ap-panel" style={S.card}>
                <div style={S.cardHead}><div style={S.cardIconBox}>🖼️</div><div><h2 style={S.cardTitle}>Product Images</h2><p style={S.cardSub}>Upload up to 6 images — saved to Cloudinary</p></div></div>
                <hr style={S.hr} />

                {/* ✅ Show existing image in edit mode */}
                {isEdit && existingImg && images.length === 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: "#aaa", letterSpacing: "0.06em", marginBottom: 8 }}>CURRENT IMAGE</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#f8f8f8", borderRadius: 10, padding: 12 }}>
                      <img src={existingImg} alt="current" style={{ width: 72, height: 72, borderRadius: 8, objectFit: "cover", border: "1.5px solid #eee" }} onError={e => e.target.src = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100"} />
                      <div>
                        <p style={{ fontSize: 12, fontWeight: 600, color: "#555" }}>Current product image</p>
                        <p style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>Upload new images below to replace</p>
                      </div>
                    </div>
                  </div>
                )}

                <div onDrop={handleDrop} onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onClick={() => fileRef.current.click()}
                  style={{ ...S.dropZone, borderColor: dragOver ? "#ff3f6c" : "#e2e2e2", background: dragOver ? "#fff5f7" : "#fafafa" }}>
                  <div style={{ fontSize: 38, marginBottom: 10 }}>📤</div>
                  <p style={{ fontWeight: 700, color: "#333", fontSize: 14, marginBottom: 4 }}>{isEdit ? "Upload new images or keep existing" : "Drop images here or"} <span style={{ color: "#ff3f6c" }}>browse</span></p>
                  <p style={{ color: "#bbb", fontSize: 12 }}>PNG, JPG, WEBP · Max 10MB each</p>
                  <input ref={fileRef} type="file" multiple accept="image/*" style={{ display: "none" }} onChange={e => handleFiles(e.target.files)} />
                </div>

                {images.length > 0 && (
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: "#aaa", letterSpacing: "0.06em", marginBottom: 10 }}>NEW IMAGES ({images.length}/6)</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                      {images.map((img, i) => (
                        <div key={i} style={{ position: "relative" }}>
                          <img className="ap-img-thumb" src={img.url} alt={img.name} />
                          {i === 0 && <span style={{ position: "absolute", top: 4, left: 4, background: "#ff3f6c", color: "#fff", fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 4 }}>COVER</span>}
                          <button onClick={() => setImages(images.filter((_, idx) => idx !== i))} style={{ position: "absolute", top: -7, right: -7, width: 20, height: 20, borderRadius: "50%", background: "#222", border: "none", color: "#fff", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 3 */}
            {activeStep === 3 && (
              <div className="ap-panel" style={S.card}>
                <div style={S.cardHead}><div style={S.cardIconBox}>💰</div><div><h2 style={S.cardTitle}>Pricing & Inventory</h2><p style={S.cardSub}>Set MRP, selling price and stock</p></div></div>
                <hr style={S.hr} />
                <div style={S.g2}>
                  <div style={S.f}>
                    <label style={S.lbl}>MRP / Original Price <span style={{ color: "#ff3f6c" }}>*</span></label>
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#aaa", fontSize: 14, fontWeight: 600 }}>₹</span>
                      <input className="ap-input" name="price" value={form.price} onChange={handleChange} type="number" placeholder="0" style={{ paddingLeft: 28, fontFamily: "'JetBrains Mono',monospace" }} />
                    </div>
                  </div>
                  <div style={S.f}>
                    <label style={S.lbl}>Selling Price <span style={{ fontSize: 10, color: "#aaa" }}>(if different)</span></label>
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#aaa", fontSize: 14, fontWeight: 600 }}>₹</span>
                      <input className="ap-input" name="discountPrice" value={form.discountPrice} onChange={handleChange} type="number" placeholder="0" style={{ paddingLeft: 28, fontFamily: "'JetBrains Mono',monospace" }} />
                    </div>
                  </div>
                </div>
                {discount > 0 && (
                  <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#fff5f7", border: "1px solid #ffd0db", borderRadius: 8, padding: "11px 14px", marginBottom: 16 }}>
                    <span style={{ background: "#ff3f6c", color: "#fff", fontSize: 11, fontWeight: 800, padding: "3px 9px", borderRadius: 4 }}>{discount}% OFF</span>
                    <span style={{ fontSize: 13, color: "#ff3f6c", fontWeight: 600 }}>Customer saves ₹{(form.price - form.discountPrice).toFixed(0)}</span>
                  </div>
                )}
                <div style={S.f}>
                  <label style={S.lbl}>Stock Quantity <span style={{ color: "#ff3f6c" }}>*</span></label>
                  <input className="ap-input" name="stock" value={form.stock} onChange={handleChange} type="number" placeholder="Enter available quantity" style={{ fontFamily: "'JetBrains Mono',monospace" }} />
                </div>
                {form.stock && Number(form.stock) > 0 && Number(form.stock) < 10 && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff8f0", border: "1px solid #ffd0a0", borderRadius: 8, padding: "10px 14px" }}>
                    <span>⚠️</span><span style={{ fontSize: 12, color: "#c75000", fontWeight: 600 }}>Low stock — consider restocking soon</span>
                  </div>
                )}

                {/* ✅ Weight field */}
                <div style={{ ...S.f, marginTop: 16 }}>
                  <label style={S.lbl}>Product Weight <span style={{ fontSize: 10, color: "#aaa" }}>(kg)</span></label>
                  <div style={{ position: "relative" }}>
                    <input className="ap-input" name="weight" value={form.weight} onChange={handleChange} type="number" step="0.1" min="0" placeholder="e.g. 0.5" style={{ paddingRight: 48, fontFamily: "'JetBrains Mono',monospace" }} />
                    <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: "#aaa", fontSize: 12, fontWeight: 600 }}>kg</span>
                  </div>
                </div>

                {/* ✅ VARIANTS */}
                <div style={{ marginTop: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <label style={S.lbl}>Product Variants <span style={{ fontSize: 10, color: "#aaa", fontWeight: 400, textTransform: "none" }}>(optional)</span></label>
                    <button type="button"
                      onClick={() => setForm(f => ({ ...f, variants: [...f.variants, { size: "", color: "", design: "", price: "", stock: "" }] }))}
                      style={{ background: "#ff3f6c", color: "#fff", border: "none", borderRadius: 6, padding: "5px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                      + Add Variant
                    </button>
                  </div>
                  {form.variants.map((v, i) => (
                    <div key={i} style={{ background: "#f9f9f9", border: "1px solid #ebebeb", borderRadius: 10, padding: "12px 14px", marginBottom: 10 }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 8 }}>
                        <div>
                          <label style={{ ...S.lbl, fontSize: 9 }}>SIZE</label>
                          <input className="ap-input" placeholder="S / M / L / XL" value={v.size}
                            onChange={e => setForm(f => ({ ...f, variants: f.variants.map((x, idx) => idx === i ? { ...x, size: e.target.value } : x) }))}
                            style={{ padding: "7px 10px", fontSize: 12 }} />
                        </div>
                        <div>
                          <label style={{ ...S.lbl, fontSize: 9 }}>COLOR</label>
                          <input className="ap-input" placeholder="Red / Blue" value={v.color}
                            onChange={e => setForm(f => ({ ...f, variants: f.variants.map((x, idx) => idx === i ? { ...x, color: e.target.value } : x) }))}
                            style={{ padding: "7px 10px", fontSize: 12 }} />
                        </div>
                        <div>
                          <label style={{ ...S.lbl, fontSize: 9 }}>DESIGN</label>
                          <input className="ap-input" placeholder="Pattern A" value={v.design}
                            onChange={e => setForm(f => ({ ...f, variants: f.variants.map((x, idx) => idx === i ? { ...x, design: e.target.value } : x) }))}
                            style={{ padding: "7px 10px", fontSize: 12 }} />
                        </div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 8, alignItems: "end" }}>
                        <div>
                          <label style={{ ...S.lbl, fontSize: 9 }}>PRICE (₹)</label>
                          <input className="ap-input" type="number" placeholder="0" value={v.price}
                            onChange={e => setForm(f => ({ ...f, variants: f.variants.map((x, idx) => idx === i ? { ...x, price: e.target.value } : x) }))}
                            style={{ padding: "7px 10px", fontSize: 12 }} />
                        </div>
                        <div>
                          <label style={{ ...S.lbl, fontSize: 9 }}>STOCK</label>
                          <input className="ap-input" type="number" placeholder="0" value={v.stock}
                            onChange={e => setForm(f => ({ ...f, variants: f.variants.map((x, idx) => idx === i ? { ...x, stock: e.target.value } : x) }))}
                            style={{ padding: "7px 10px", fontSize: 12 }} />
                        </div>
                        <button type="button"
                          onClick={() => setForm(f => ({ ...f, variants: f.variants.filter((_, idx) => idx !== i) }))}
                          style={{ background: "#fef0f0", border: "1px solid #ffd0d0", borderRadius: 6, padding: "7px 10px", cursor: "pointer", color: "#cc0000", fontSize: 12, fontWeight: 700 }}>
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* ✅ Dynamic shipping message */}
                {form.weight && (
                  sellingPrice >= 499 ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#e6f9f2", border: "1px solid #a7f3d0", borderRadius: 8, padding: "11px 14px" }}>
                      <span style={{ fontSize: 18 }}>🎉</span>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 700, color: "#00875a" }}>Free Shipping</p>
                        <p style={{ fontSize: 11, color: "#34d399" }}>Product price ≥ ₹499 — shipping waived for customers</p>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "11px 14px" }}>
                      <span style={{ fontSize: 18 }}>🚚</span>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 700, color: "#2563eb" }}>Shipping: ₹{shipping}</p>
                        <p style={{ fontSize: 11, color: "#60a5fa" }}>{weightKg >= 1 ? "Heavy item (≥1 kg) — ₹180 shipping" : "Light item (<1 kg) — ₹79 shipping"} · Free above ₹499</p>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}

            {/* STEP 4 */}
            {activeStep === 4 && (
              <div className="ap-panel" style={S.card}>
                <div style={S.cardHead}><div style={S.cardIconBox}>🚀</div><div><h2 style={S.cardTitle}>Tags & Publish</h2><p style={S.cardSub}>Label your product and set visibility</p></div></div>
                <hr style={S.hr} />
                <div style={S.f}>
                  <label style={S.lbl}>Product Tags</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                    {tags.map(tag => (
                      <button key={tag} className={`ap-tag ${form.tags.includes(tag) ? "active" : ""}`} onClick={() => toggleTag(tag)}>{tag}</button>
                    ))}
                  </div>
                </div>

                {/* ✅ Featured toggle */}
                <div style={{
                  ...S.f, display: "flex", alignItems: "center", justifyContent: "space-between",
                  background: "#f8f8f8", borderRadius: 10, padding: "12px 16px", marginBottom: 8
                }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a" }}>Featured Product</p>
                    <p style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>Show in Featured Products section on homepage</p>
                  </div>
                  <div
                    onClick={() => setForm(f => ({ ...f, featured: !f.featured }))}
                    style={{
                      width: 44, height: 24, borderRadius: 12, background: form.featured ? "#ff3f6c" : "#ddd",
                      cursor: "pointer", transition: "background 0.2s", position: "relative", flexShrink: 0
                    }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute",
                      top: 3, left: form.featured ? 23 : 3, transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)"
                    }} />
                  </div>
                </div>
                <div style={S.f}>
                  <label style={S.lbl}>Listing Status</label>
                  <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                    {["active", "draft", "inactive"].map(s => (
                      <div key={s}>
                        <input type="radio" name="status" id={`st-${s}`} value={s} className="ap-status-radio" checked={form.status === s} onChange={handleChange} />
                        <label htmlFor={`st-${s}`} className="ap-status-label">{s}</label>
                      </div>
                    ))}
                  </div>
                  {form.status !== "active" && <p style={{ fontSize: 11, color: "#f59e0b", marginTop: 8, fontWeight: 600 }}>⚠️ Only "active" products appear on the shop.</p>}
                </div>
                <hr style={S.hr} />

                {error && (
                  <div style={{ background: "#fef0f0", border: "1px solid #ffd0d0", borderRadius: 8, padding: "10px 14px", marginBottom: 16 }}>
                    <p style={{ fontSize: 13, color: "#cc0000", fontWeight: 600 }}>⚠️ {error}</p>
                  </div>
                )}

                {/* Review */}
                <p style={{ fontSize: 11, fontWeight: 800, color: "#aaa", letterSpacing: "0.08em", marginBottom: 12 }}>REVIEW BEFORE {isEdit ? "UPDATING" : "PUBLISHING"}</p>
                <div style={{ border: "1px solid #f0f0f0", borderRadius: 8, overflow: "hidden", marginBottom: 20 }}>
                  {[
                    ["Product Name", form.name || "—"],
                    ["Categories", form.categories?.length > 0 ? form.categories.join(", ") : "—"],
                    ["Brand", form.brand || "—"],
                    ["MRP", form.price ? `₹${form.price}` : "—"],
                    ["Selling Price", form.discountPrice ? `₹${form.discountPrice}` : form.price ? `₹${form.price}` : "—"],
                    ["Discount", discount > 0 ? `${discount}% off` : "No discount"],
                    ["Stock", form.stock ? `${form.stock} units` : "—"],
                    ["Weight", form.weight ? `${form.weight} kg` : "—"],
                    ["Shipping", form.weight ? (sellingPrice >= 499 ? "Free 🎉" : `₹${shipping}`) : "—"],
                    ["Images", images.length > 0 ? `${images.length} new uploaded` : existingImg ? "Keeping existing" : "None"],
                    ["Status", form.status],
                  ].map(([k, v], i) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 16px", background: i % 2 === 0 ? "#fff" : "#fafafa", borderBottom: "1px solid #f5f5f5" }}>
                      <span style={{ fontSize: 12, color: "#888", fontWeight: 600 }}>{k}</span>
                      <span style={{ fontSize: 12, color: "#1a1a1a", fontWeight: 700, textAlign: "right", maxWidth: "55%", wordBreak: "break-word" }}>{v}</span>
                    </div>
                  ))}
                </div>

                <button className="ap-save-btn" onClick={handleSubmit} disabled={saving || saved}>
                  {saving
                    ? (isEdit ? "Updating product..." : "Uploading...")
                    : saved
                      ? `✓ ${isEdit ? "Updated" : "Published"}! Redirecting...`
                      : isEdit ? "Update Product →" : "Publish Product →"}
                </button>
                <p style={{ textAlign: "center", fontSize: 11, color: "#bbb", marginTop: 10 }}>
                  {isEdit ? "Changes saved to MongoDB" : "Images → Cloudinary · Product → MongoDB"}
                </p>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
              {activeStep > 1 ? <button className="ap-ghost-btn" onClick={() => setActiveStep(s => s - 1)}>← Back</button> : <div />}
              {activeStep < 4 && <button className="ap-primary-btn" onClick={() => setActiveStep(s => s + 1)}>Save & Continue →</button>}
            </div>
          </div>

          {/* SIDEBAR */}
          <div style={S.sidebar}>
            <div style={S.sideCard}>
              <p style={S.sideLabel}>LIVE PREVIEW</p>
              <div style={{ border: "1px solid #f0f0f0", borderRadius: 10, overflow: "hidden" }}>
                {images[0]
                  ? <img src={images[0].url} alt="cover" style={{ width: "100%", height: 170, objectFit: "cover" }} />
                  : existingImg
                    ? <img src={existingImg} alt="existing" style={{ width: "100%", height: 170, objectFit: "cover" }} onError={e => e.target.src = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"} />
                    : <div style={{ width: "100%", height: 140, background: "#f7f7f7", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}><span style={{ fontSize: 34 }}>🛍️</span><span style={{ fontSize: 11, color: "#ccc" }}>No image yet</span></div>
                }
                <div style={{ padding: "12px 14px" }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a", marginBottom: 2, lineHeight: 1.4 }}>{form.name || "Product Name"}</p>
                  {form.category && <p style={{ fontSize: 11, color: "#aaa", marginBottom: 8 }}>{form.category}</p>}
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 17, fontWeight: 800, color: "#1a1a1a", fontFamily: "'JetBrains Mono',monospace" }}>₹{form.discountPrice || form.price || "0"}</span>
                    {form.discountPrice && form.price && <span style={{ fontSize: 12, color: "#aaa", textDecoration: "line-through", fontFamily: "'JetBrains Mono',monospace" }}>₹{form.price}</span>}
                    {discount > 0 && <span style={{ fontSize: 11, fontWeight: 700, color: "#ff3f6c" }}>{discount}% off</span>}
                  </div>
                  {form.stock && <p style={{ fontSize: 11, fontWeight: 700, color: Number(form.stock) > 10 ? "#03a685" : "#e65c00", marginTop: 6 }}>{Number(form.stock) > 10 ? "✓ In Stock" : `⚠ Only ${form.stock} left`}</p>}
                </div>
              </div>
            </div>
            <div style={S.sideCard}>
              <p style={S.sideLabel}>LISTING CHECKLIST</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 11, marginBottom: 14 }}>
                {checklistItems.map(([label, done]) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 18, height: 18, borderRadius: "50%", flexShrink: 0, background: done ? "#ff3f6c" : "#f0f0f0", border: `2px solid ${done ? "#ff3f6c" : "#e0e0e0"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff" }}>
                      {done ? "✓" : ""}
                    </div>
                    <span style={{ fontSize: 12, color: done ? "#222" : "#bbb", fontWeight: done ? 600 : 400 }}>{label}</span>
                  </div>
                ))}
              </div>
              <div style={{ background: "#f8f8f8", borderRadius: 8, padding: "10px 12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                  <span style={{ fontSize: 11, color: "#888", fontWeight: 700 }}>Profile Complete</span>
                  <span style={{ fontSize: 11, color: "#ff3f6c", fontWeight: 800 }}>{completePct}%</span>
                </div>
                <div style={{ height: 5, background: "#ebebeb", borderRadius: 10 }}>
                  <div style={{ height: "100%", background: "#ff3f6c", borderRadius: 10, width: `${completePct}%`, transition: "width 0.4s ease" }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {saved && (
        <div className="ap-toast" style={{ position: "fixed", bottom: 24, right: 24, background: "#fff", border: "1px solid #e8e8e8", borderRadius: 12, padding: "14px 20px", display: "flex", alignItems: "center", gap: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.12)", zIndex: 1000 }}>
          <span style={{ fontSize: 20 }}>🎉</span>
          <div>
            <p style={{ fontWeight: 700, fontSize: 14, color: "#1a1a1a" }}>{isEdit ? "Product Updated!" : "Product Published!"}</p>
            <p style={{ fontSize: 12, color: "#888" }}>{isEdit ? "Changes saved to MongoDB" : "Saved to MongoDB · Images on Cloudinary"}</p>
          </div>
        </div>
      )}
    </div>
  );
}

const S = {
  page: { minHeight: "100vh", background: "#f4f4f4", fontFamily: "'Plus Jakarta Sans',sans-serif" },
  topBar: { background: "#fff", borderBottom: "1px solid #ebebeb", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" },
  topBarInner: { maxWidth: 1120, margin: "0 auto", padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" },
  logo: { fontSize: 20, fontWeight: 800, letterSpacing: "-0.03em", color: "#1a1a1a" },
  avatar: { width: 32, height: 32, borderRadius: "50%", background: "#ff3f6c", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 },
  main: { maxWidth: 1120, margin: "0 auto", padding: "24px 24px 60px" },
  stepBar: { background: "#fff", borderRadius: 12, padding: "18px 28px", marginBottom: 20, display: "flex", alignItems: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", border: "1px solid #f0f0f0" },
  grid: { display: "flex", gap: 20, alignItems: "flex-start" },
  card: { background: "#fff", borderRadius: 12, padding: "24px", marginBottom: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.05)", border: "1px solid #f0f0f0" },
  cardHead: { display: "flex", alignItems: "center", gap: 14, marginBottom: 16 },
  cardIconBox: { width: 46, height: 46, background: "#fff0f4", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 },
  cardTitle: { fontSize: 16, fontWeight: 700, color: "#1a1a1a", marginBottom: 2 },
  cardSub: { fontSize: 12, color: "#aaa" },
  hr: { border: "none", borderTop: "1px solid #f5f5f5", margin: "0 0 20px" },
  g2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  f: { marginBottom: 16 },
  lbl: { display: "block", fontSize: 11, fontWeight: 700, color: "#555", marginBottom: 7, letterSpacing: "0.05em", textTransform: "uppercase" },
  dropZone: { border: "2px dashed", borderRadius: 10, padding: "30px 20px", textAlign: "center", cursor: "pointer", transition: "all 0.2s", marginBottom: 16 },
  sidebar: { width: 272, flexShrink: 0, display: "flex", flexDirection: "column", gap: 16 },
  sideCard: { background: "#fff", borderRadius: 12, padding: "18px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", border: "1px solid #f0f0f0" },
  sideLabel: { fontSize: 10, fontWeight: 800, color: "#bbb", letterSpacing: "0.1em", marginBottom: 14 },
};