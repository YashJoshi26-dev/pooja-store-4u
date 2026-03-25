import { useState, useRef } from "react";

const categories = ["Electronics", "Fashion", "Home & Living", "Beauty", "Sports", "Books", "Toys", "Grocery"];
const tags = ["New Arrival", "Best Seller", "Sale", "Featured", "Limited Edition", "Trending"];

export default function AddProduct() {
  const [form, setForm] = useState({
    name: "", category: "", price: "", discountPrice: "",
    stock: "", sku: "", description: "", tags: [], status: "active",
  });
  const [images, setImages] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const toggleTag = (tag) => {
    setForm((f) => ({
      ...f,
      tags: f.tags.includes(tag) ? f.tags.filter((t) => t !== tag) : [...f.tags, tag],
    }));
  };

  const handleFiles = (files) => {
    const newImgs = Array.from(files).map((file) => ({
      url: URL.createObjectURL(file), name: file.name,
    }));
    setImages((prev) => [...prev, ...newImgs].slice(0, 6));
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleSubmit = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const steps = [
    { label: "Basic Info", icon: "📋" },
    { label: "Images", icon: "🖼️" },
    { label: "Pricing", icon: "💰" },
    { label: "Publish", icon: "🚀" },
  ];

  const discount = form.price && form.discountPrice
    ? Math.round((1 - form.discountPrice / form.price) * 100) : 0;

  const checklistItems = [
    ["Product name added", !!form.name],
    ["Category selected", !!form.category],
    ["At least 1 image", images.length > 0],
    ["Price set", !!form.price],
    ["Stock quantity", !!form.stock],
    ["Description added", form.description.length > 20],
  ];
  const completePct = Math.round(checklistItems.filter(([, v]) => v).length / checklistItems.length * 100);

  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .ap-input, .ap-select, .ap-textarea {
          width: 100%; background: #fff; border: 1.5px solid #e2e2e2;
          border-radius: 8px; padding: 11px 14px; color: #1a1a1a;
          font-size: 14px; font-family: 'Plus Jakarta Sans', sans-serif;
          transition: border-color 0.18s, box-shadow 0.18s; outline: none;
        }
        .ap-input:focus, .ap-select:focus, .ap-textarea:focus {
          border-color: #ff3f6c; box-shadow: 0 0 0 3px rgba(255,63,108,0.09);
        }
        .ap-input::placeholder, .ap-textarea::placeholder { color: #bbb; }
        .ap-select option { background: #fff; color: #1a1a1a; }
        .ap-textarea { resize: vertical; line-height: 1.7; }

        .ap-tag {
          padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 600;
          cursor: pointer; border: 1.5px solid #e2e2e2; background: #fff;
          color: #777; transition: all 0.15s; font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .ap-tag:hover { border-color: #ff3f6c; color: #ff3f6c; }
        .ap-tag.active { background: #fff0f4; border-color: #ff3f6c; color: #ff3f6c; }

        .ap-primary-btn {
          background: #ff3f6c; color: #fff; border: none; border-radius: 8px;
          padding: 13px 28px; font-size: 14px; font-weight: 700; cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif; transition: all 0.18s; letter-spacing: 0.02em;
        }
        .ap-primary-btn:hover { background: #e6325a; transform: translateY(-1px); box-shadow: 0 4px 14px rgba(255,63,108,0.3); }

        .ap-ghost-btn {
          background: #fff; color: #333; border: 1.5px solid #e2e2e2;
          border-radius: 8px; padding: 12px 24px; font-size: 14px; font-weight: 600;
          cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; transition: all 0.15s;
        }
        .ap-ghost-btn:hover { border-color: #ff3f6c; color: #ff3f6c; }

        .ap-save-btn {
          width: 100%; background: #ff3f6c; color: #fff; border: none;
          border-radius: 8px; padding: 15px; font-size: 15px; font-weight: 700;
          cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif;
          transition: all 0.2s; letter-spacing: 0.03em;
          box-shadow: 0 4px 16px rgba(255,63,108,0.25);
        }
        .ap-save-btn:hover { background: #e6325a; box-shadow: 0 6px 24px rgba(255,63,108,0.38); transform: translateY(-1px); }

        .ap-status-radio { display: none; }
        .ap-status-label {
          padding: 9px 20px; border-radius: 6px; font-size: 13px; font-weight: 600;
          cursor: pointer; border: 1.5px solid #e2e2e2; color: #777; transition: all 0.15s;
          font-family: 'Plus Jakarta Sans', sans-serif; text-transform: capitalize;
        }
        .ap-status-radio:checked + .ap-status-label { border-color: #ff3f6c; color: #ff3f6c; background: #fff0f4; }

        @keyframes apFadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        @keyframes toastIn { from { opacity:0; transform:translateY(20px) scale(0.95); } to { opacity:1; transform:translateY(0) scale(1); } }
        .ap-panel { animation: apFadeUp 0.28s ease; }
        .ap-toast { animation: toastIn 0.3s ease; }
        .ap-img-thumb { width: 82px; height: 82px; border-radius: 8px; object-fit: cover; border: 1.5px solid #eee; }
      `}</style>

      {/* Top Nav */}
      <div style={S.topBar}>
        <div style={S.topBarInner}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={S.logo}><span style={{ color: "#ff3f6c" }}>Pooja</span>Store4u</span>
            <span style={{ color: "#ddd", fontSize: 18 }}>|</span>
            <span style={{ fontSize: 13, color: "#666", fontWeight: 500 }}>Seller Dashboard</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {["My Listings", "Orders", "Analytics"].map(l => (
              <span key={l} style={{ fontSize: 13, color: "#444", fontWeight: 600, cursor: "pointer" }}>{l}</span>
            ))}
            <div style={S.avatar}>S</div>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div style={{ background: "#fff", borderBottom: "1px solid #f0f0f0" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "10px 24px", display: "flex", alignItems: "center", gap: 6 }}>
          {["Dashboard", "Products"].map((b, i) => (
            <span key={b} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 12, color: "#aaa", fontWeight: 500, cursor: "pointer" }}>{b}</span>
              <span style={{ color: "#ddd" }}>›</span>
            </span>
          ))}
          <span style={{ fontSize: 12, color: "#ff3f6c", fontWeight: 700 }}>Add New Product</span>
        </div>
      </div>

      <div style={S.main}>
        {/* Header Row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "#1a1a1a", letterSpacing: "-0.02em", marginBottom: 3 }}>
              Add New Product
            </h1>
            <p style={{ fontSize: 13, color: "#999" }}>Complete all steps to list your product</p>
          </div>
          <div style={{ background: "#fff0f4", color: "#ff3f6c", fontSize: 12, fontWeight: 700, padding: "6px 16px", borderRadius: 20, border: "1.5px solid #ffd0db" }}>
            Step {activeStep} / 4
          </div>
        </div>

        {/* Step Progress */}
        <div style={S.stepBar}>
          {steps.map((s, i) => {
            const num = i + 1;
            const isActive = activeStep === num;
            const isDone = activeStep > num;
            return (
              <div key={s.label} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                <div onClick={() => setActiveStep(num)}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 7, cursor: "pointer", flex: 1 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: "50%",
                    background: isDone ? "#ff3f6c" : isActive ? "#fff" : "#f5f5f5",
                    border: `2px solid ${isDone || isActive ? "#ff3f6c" : "#e0e0e0"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: isDone ? 14 : 18, color: isDone ? "#fff" : "#555",
                    boxShadow: isActive ? "0 0 0 5px rgba(255,63,108,0.1)" : "none",
                    transition: "all 0.25s",
                  }}>
                    {isDone ? "✓" : s.icon}
                  </div>
                  <span style={{
                    fontSize: 12, fontWeight: isActive ? 700 : 500,
                    color: isActive ? "#ff3f6c" : isDone ? "#444" : "#bbb",
                  }}>{s.label}</span>
                </div>
                {i < steps.length - 1 && (
                  <div style={{ height: 2, flex: 1, maxWidth: 50, borderRadius: 2, background: isDone ? "#ff3f6c" : "#ebebeb", marginBottom: 22, transition: "background 0.3s" }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Main Grid */}
        <div style={S.grid}>
          <div style={{ flex: 1, minWidth: 0 }}>

            {/* STEP 1 */}
            {activeStep === 1 && (
              <div className="ap-panel" style={S.card}>
                <div style={S.cardHead}>
                  <div style={S.cardIconBox}>📋</div>
                  <div>
                    <h2 style={S.cardTitle}>Basic Information</h2>
                    <p style={S.cardSub}>Product name, category and description</p>
                  </div>
                </div>
                <hr style={S.hr} />
                <div style={S.g2}>
                  <div style={S.f}>
                    <label style={S.lbl}>Product Name <span style={{ color: "#ff3f6c" }}>*</span></label>
                    <input className="ap-input" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Men's Running Shoes" />
                  </div>
                  <div style={S.f}>
                    <label style={S.lbl}>Category <span style={{ color: "#ff3f6c" }}>*</span></label>
                    <select className="ap-select" name="category" value={form.category} onChange={handleChange}>
                      <option value="">Select a category</option>
                      {categories.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div style={S.f}>
                  <label style={S.lbl}>SKU / Product Code</label>
                  <input className="ap-input" name="sku" value={form.sku} onChange={handleChange}
                    placeholder="e.g. MNS-RUN-001"
                    style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, letterSpacing: "0.04em" }} />
                </div>
                <div style={S.f}>
                  <label style={S.lbl}>Description</label>
                  <textarea className="ap-textarea" name="description" value={form.description} onChange={handleChange}
                    rows={4} placeholder="Describe the product — material, size, features, care instructions..." />
                  <p style={{ fontSize: 11, color: "#bbb", textAlign: "right", marginTop: 4 }}>{form.description.length} / 2000</p>
                </div>
              </div>
            )}

            {/* STEP 2 */}
            {activeStep === 2 && (
              <div className="ap-panel" style={S.card}>
                <div style={S.cardHead}>
                  <div style={S.cardIconBox}>🖼️</div>
                  <div>
                    <h2 style={S.cardTitle}>Product Images</h2>
                    <p style={S.cardSub}>Upload up to 6 images — first image is the cover</p>
                  </div>
                </div>
                <hr style={S.hr} />
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8, background: "#fffbf0", border: "1px solid #ffe8a0", borderRadius: 8, padding: "10px 14px", marginBottom: 16 }}>
                  <span>💡</span>
                  <span style={{ fontSize: 12, color: "#7a6000" }}>Use white/plain backgrounds. Min 500×500px recommended. Max 10MB each.</span>
                </div>
                <div onDrop={handleDrop}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onClick={() => fileRef.current.click()}
                  style={{ ...S.dropZone, borderColor: dragOver ? "#ff3f6c" : "#e2e2e2", background: dragOver ? "#fff5f7" : "#fafafa" }}>
                  <div style={{ fontSize: 38, marginBottom: 10 }}>📤</div>
                  <p style={{ fontWeight: 700, color: "#333", fontSize: 14, marginBottom: 4 }}>
                    Drop images here or <span style={{ color: "#ff3f6c" }}>browse</span>
                  </p>
                  <p style={{ color: "#bbb", fontSize: 12 }}>PNG, JPG, WEBP supported</p>
                  <input ref={fileRef} type="file" multiple accept="image/*" style={{ display: "none" }} onChange={(e) => handleFiles(e.target.files)} />
                </div>
                {images.length > 0 && (
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: "#aaa", letterSpacing: "0.06em", marginBottom: 10 }}>UPLOADED ({images.length}/6)</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                      {images.map((img, i) => (
                        <div key={i} style={{ position: "relative" }}>
                          <img className="ap-img-thumb" src={img.url} alt={img.name} />
                          {i === 0 && <span style={{ position: "absolute", top: 4, left: 4, background: "#ff3f6c", color: "#fff", fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 4 }}>COVER</span>}
                          <button onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                            style={{ position: "absolute", top: -7, right: -7, width: 20, height: 20, borderRadius: "50%", background: "#222", border: "none", color: "#fff", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                        </div>
                      ))}
                      {images.length < 6 && (
                        <div onClick={() => fileRef.current.click()}
                          style={{ width: 82, height: 82, borderRadius: 8, border: "1.5px dashed #e2e2e2", background: "#fafafa", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", gap: 4 }}>
                          <span style={{ fontSize: 20, color: "#ccc" }}>+</span>
                          <span style={{ fontSize: 10, color: "#bbb", fontWeight: 600 }}>ADD MORE</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 3 */}
            {activeStep === 3 && (
              <div className="ap-panel" style={S.card}>
                <div style={S.cardHead}>
                  <div style={S.cardIconBox}>💰</div>
                  <div>
                    <h2 style={S.cardTitle}>Pricing & Inventory</h2>
                    <p style={S.cardSub}>Set your MRP, selling price and stock levels</p>
                  </div>
                </div>
                <hr style={S.hr} />
                <div style={S.g2}>
                  <div style={S.f}>
                    <label style={S.lbl}>MRP / Original Price <span style={{ color: "#ff3f6c" }}>*</span></label>
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#aaa", fontSize: 14, fontWeight: 600 }}>₹</span>
                      <input className="ap-input" name="price" value={form.price} onChange={handleChange} type="number" placeholder="0"
                        style={{ paddingLeft: 28, fontFamily: "'JetBrains Mono', monospace" }} />
                    </div>
                  </div>
                  <div style={S.f}>
                    <label style={S.lbl}>Selling Price</label>
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#aaa", fontSize: 14, fontWeight: 600 }}>₹</span>
                      <input className="ap-input" name="discountPrice" value={form.discountPrice} onChange={handleChange} type="number" placeholder="0"
                        style={{ paddingLeft: 28, fontFamily: "'JetBrains Mono', monospace" }} />
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
                  <input className="ap-input" name="stock" value={form.stock} onChange={handleChange} type="number" placeholder="Enter available quantity"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }} />
                </div>
                {form.stock && Number(form.stock) > 0 && Number(form.stock) < 10 && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff8f0", border: "1px solid #ffd0a0", borderRadius: 8, padding: "10px 14px" }}>
                    <span>⚠️</span><span style={{ fontSize: 12, color: "#c75000", fontWeight: 600 }}>Low stock — consider restocking soon</span>
                  </div>
                )}
              </div>
            )}

            {/* STEP 4 */}
            {activeStep === 4 && (
              <div className="ap-panel" style={S.card}>
                <div style={S.cardHead}>
                  <div style={S.cardIconBox}>🚀</div>
                  <div>
                    <h2 style={S.cardTitle}>Tags & Publish</h2>
                    <p style={S.cardSub}>Label your product and set listing visibility</p>
                  </div>
                </div>
                <hr style={S.hr} />
                <div style={S.f}>
                  <label style={S.lbl}>Product Tags</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                    {tags.map(tag => (
                      <button key={tag} className={`ap-tag ${form.tags.includes(tag) ? "active" : ""}`} onClick={() => toggleTag(tag)}>{tag}</button>
                    ))}
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
                </div>
                <hr style={S.hr} />
                <p style={{ fontSize: 11, fontWeight: 800, color: "#aaa", letterSpacing: "0.08em", marginBottom: 12 }}>REVIEW BEFORE PUBLISHING</p>
                <div style={{ border: "1px solid #f0f0f0", borderRadius: 8, overflow: "hidden", marginBottom: 20 }}>
                  {[
                    ["Product Name", form.name || "—"],
                    ["Category", form.category || "—"],
                    ["MRP", form.price ? `₹${form.price}` : "—"],
                    ["Selling Price", form.discountPrice ? `₹${form.discountPrice}` : form.price ? `₹${form.price}` : "—"],
                    ["Discount", discount > 0 ? `${discount}% off` : "No discount"],
                    ["Stock", form.stock ? `${form.stock} units` : "—"],
                    ["Images", `${images.length} uploaded`],
                    ["Status", form.status],
                  ].map(([k, v], i) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 16px", background: i % 2 === 0 ? "#fff" : "#fafafa", borderBottom: "1px solid #f5f5f5" }}>
                      <span style={{ fontSize: 12, color: "#888", fontWeight: 600 }}>{k}</span>
                      <span style={{ fontSize: 12, color: "#1a1a1a", fontWeight: 700, textAlign: "right", maxWidth: "55%", wordBreak: "break-word" }}>{v}</span>
                    </div>
                  ))}
                </div>
                <button className="ap-save-btn" onClick={handleSubmit}>
                  {saved ? "✓  Product Published!" : "Publish Product →"}
                </button>
                <p style={{ textAlign: "center", fontSize: 11, color: "#bbb", marginTop: 10 }}>
                  By publishing, you agree to our seller policies and guidelines
                </p>
              </div>
            )}

            {/* Nav */}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
              {activeStep > 1
                ? <button className="ap-ghost-btn" onClick={() => setActiveStep(s => s - 1)}>← Back</button>
                : <div />}
              {activeStep < 4 && (
                <button className="ap-primary-btn" onClick={() => setActiveStep(s => s + 1)}>Save & Continue →</button>
              )}
            </div>
          </div>

          {/* SIDEBAR */}
          <div style={S.sidebar}>
            {/* Preview Card */}
            <div style={S.sideCard}>
              <p style={S.sideLabel}>LIVE PREVIEW</p>
              <div style={{ border: "1px solid #f0f0f0", borderRadius: 10, overflow: "hidden" }}>
                {images[0]
                  ? <img src={images[0].url} alt="cover" style={{ width: "100%", height: 170, objectFit: "cover" }} />
                  : <div style={{ width: "100%", height: 140, background: "#f7f7f7", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
                      <span style={{ fontSize: 34 }}>👟</span>
                      <span style={{ fontSize: 11, color: "#ccc" }}>No image yet</span>
                    </div>
                }
                <div style={{ padding: "12px 14px" }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a", marginBottom: 2, lineHeight: 1.4 }}>
                    {form.name || "Product Name"}
                  </p>
                  {form.category && <p style={{ fontSize: 11, color: "#aaa", fontWeight: 500, marginBottom: 8 }}>{form.category}</p>}
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 17, fontWeight: 800, color: "#1a1a1a", fontFamily: "'JetBrains Mono', monospace" }}>
                      ₹{form.discountPrice || form.price || "0"}
                    </span>
                    {form.discountPrice && form.price && (
                      <span style={{ fontSize: 12, color: "#aaa", textDecoration: "line-through", fontFamily: "'JetBrains Mono', monospace" }}>₹{form.price}</span>
                    )}
                    {discount > 0 && <span style={{ fontSize: 11, fontWeight: 700, color: "#ff3f6c" }}>{discount}% off</span>}
                  </div>
                  {form.stock && (
                    <p style={{ fontSize: 11, fontWeight: 700, color: Number(form.stock) > 10 ? "#03a685" : "#e65c00", marginTop: 6 }}>
                      {Number(form.stock) > 10 ? "✓ In Stock" : `⚠ Only ${form.stock} left`}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Checklist */}
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

      {/* Toast */}
      {saved && (
        <div className="ap-toast" style={{ position: "fixed", bottom: 24, right: 24, background: "#fff", border: "1px solid #e8e8e8", borderRadius: 12, padding: "14px 20px", display: "flex", alignItems: "center", gap: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.12)", zIndex: 1000 }}>
          <span style={{ fontSize: 20 }}>🎉</span>
          <div>
            <p style={{ fontWeight: 700, fontSize: 14, color: "#1a1a1a" }}>Product Published!</p>
            <p style={{ fontSize: 12, color: "#888" }}>Your product is now live on the platform</p>
          </div>
        </div>
      )}
    </div>
  );
}

const S = {
  page: { minHeight: "100vh", background: "#f4f4f4", fontFamily: "'Plus Jakarta Sans', sans-serif" },
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
