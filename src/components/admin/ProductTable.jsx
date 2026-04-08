import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAdminProducts, deleteProduct } from "../../api/productApi";

export default function ProductTable() {
  const navigate = useNavigate();
  const [products,   setProducts]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [search,     setSearch]     = useState("");
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getAdminProducts();
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || "Failed to load products");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = products.filter(p =>
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await deleteProduct(id);
      setProducts(prev => prev.filter(p => p._id !== id));
    } catch (err) {
      alert(err.message || "Failed to delete product");
    } finally {
      setDeletingId(null);
    }
  };

  // ✅ Navigate to AddProduct with ?edit=ID so it loads existing data
  const handleEdit = (id) => {
    navigate(`/admin/add-product?edit=${id}`);
  };

  if (loading) return (
    <div style={{ textAlign:"center", padding:"60px", color:"#aaa", fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
      <div style={{ fontSize:32, marginBottom:12 }}>⏳</div>Loading products...
    </div>
  );

  if (error) return (
    <div style={{ textAlign:"center", padding:"60px", fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
      <p style={{ color:"#cc0000", marginBottom:12 }}>❌ {error}</p>
      <button onClick={() => window.location.reload()} style={{ background:"#ff3f6c", color:"#fff", border:"none", borderRadius:8, padding:"8px 20px", cursor:"pointer", fontWeight:600 }}>Retry</button>
    </div>
  );

  return (
    <div style={{ background:"#fff", borderRadius:12, border:"1px solid #f0f0f0", boxShadow:"0 1px 4px rgba(0,0,0,0.05)", fontFamily:"'Plus Jakarta Sans',sans-serif" }}>

      {/* Toolbar */}
      <div style={{ padding:"16px 20px", borderBottom:"1px solid #f5f5f5", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
        <div>
          <p style={{ fontSize:14, fontWeight:700, color:"#1a1a1a" }}>
            All Products
            <span style={{ marginLeft:8, background:"#fff0f4", color:"#ff3f6c", fontSize:11, fontWeight:700, padding:"2px 8px", borderRadius:20 }}>
              {products.length}
            </span>
          </p>
          <p style={{ fontSize:12, color:"#aaa", marginTop:2 }}>Saved in MongoDB · Images on Cloudinary</p>
        </div>
        <input
          placeholder="Search by name or category..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ background:"#f8f8f8", border:"1px solid #ebebeb", borderRadius:8, padding:"8px 14px", fontSize:13, outline:"none", width:260, fontFamily:"'Plus Jakarta Sans',sans-serif" }}
        />
      </div>

      {/* Empty state */}
      {products.length === 0 ? (
        <div style={{ padding:"60px", textAlign:"center" }}>
          <div style={{ fontSize:48, marginBottom:12 }}>📦</div>
          <p style={{ fontSize:16, fontWeight:700, color:"#1a1a1a", marginBottom:6 }}>No products yet</p>
          <p style={{ fontSize:13, color:"#aaa", marginBottom:20 }}>Add your first product to get started</p>
          <button onClick={() => navigate("/admin/add-product")}
            style={{ background:"#ff3f6c", color:"#fff", border:"none", borderRadius:8, padding:"10px 24px", fontSize:13, fontWeight:700, cursor:"pointer" }}>
            + Add First Product
          </button>
        </div>
      ) : (
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ borderBottom:"1px solid #f5f5f5" }}>
                {["Product","Category","Price","Stock","Status","Actions"].map(h => (
                  <th key={h} style={{ fontSize:10, fontWeight:700, color:"#bbb", letterSpacing:"0.06em", padding:"12px 16px", textAlign:"left" }}>{h.toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(product => (
                <tr key={product._id}
                  style={{ borderBottom:"1px solid #fafafa", transition:"background 0.12s" }}
                  onMouseOver={e => e.currentTarget.style.background="#fff8f9"}
                  onMouseOut={e => e.currentTarget.style.background="transparent"}
                >
                  {/* Product */}
                  <td style={{ padding:"12px 16px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                      <img
                        src={product.image || product.images?.[0] || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100"}
                        alt={product.title}
                        style={{ width:44, height:44, borderRadius:8, objectFit:"cover", border:"1px solid #f0f0f0", flexShrink:0 }}
                        onError={e => e.target.src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100"}
                      />
                      <div>
                        <p style={{ fontSize:13, fontWeight:600, color:"#1a1a1a", maxWidth:200, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                          {product.title}
                        </p>
                        {product.sku && <p style={{ fontSize:10, color:"#bbb", fontFamily:"monospace", marginTop:2 }}>{product.sku}</p>}
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td style={{ padding:"12px 16px", fontSize:12, color:"#666" }}>{product.category}</td>

                  {/* Price */}
                  <td style={{ padding:"12px 16px" }}>
                    <p style={{ fontSize:13, fontWeight:700, color:"#1a1a1a" }}>₹{product.price?.toLocaleString()}</p>
                    {product.oldPrice && <p style={{ fontSize:11, color:"#aaa", textDecoration:"line-through" }}>₹{product.oldPrice?.toLocaleString()}</p>}
                  </td>

                  {/* Stock */}
                  <td style={{ padding:"12px 16px", fontSize:12, fontFamily:"monospace", color:product.stock<10?"#e65c00":"#333", fontWeight:600 }}>
                    {product.stock}
                  </td>

                  {/* Status */}
                  <td style={{ padding:"12px 16px" }}>
                    <span style={{
                      fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20,
                      background: product.status==="active"?"#e6f9f2":product.status==="draft"?"#fff8e0":"#fef0f0",
                      color:      product.status==="active"?"#00875a":product.status==="draft"?"#c47f00":"#cc0000",
                    }}>
                      {product.status || "active"}
                    </span>
                  </td>

                  {/* Actions */}
                  <td style={{ padding:"12px 16px" }}>
                    <div style={{ display:"flex", gap:8 }}>
                      {/* ✅ Edit button — navigates with product ID */}
                      <button
                        onClick={() => handleEdit(product._id)}
                        style={{ background:"#f0f7ff", border:"1px solid #bfdbfe", borderRadius:6, padding:"6px 14px", cursor:"pointer", color:"#2563eb", fontSize:12, fontWeight:600, transition:"all 0.15s" }}
                        onMouseOver={e => e.currentTarget.style.background="#dbeafe"}
                        onMouseOut={e => e.currentTarget.style.background="#f0f7ff"}
                      >
                        ✏️ Edit
                      </button>

                      {/* Delete button */}
                      <button
                        onClick={() => handleDelete(product._id)}
                        disabled={deletingId === product._id}
                        style={{ background:"#fef0f0", border:"1px solid #ffd0d0", borderRadius:6, padding:"6px 14px", cursor:"pointer", color:"#cc0000", fontSize:12, fontWeight:600, opacity:deletingId===product._id?0.5:1, transition:"all 0.15s" }}
                        onMouseOver={e => e.currentTarget.style.background="#fee2e2"}
                        onMouseOut={e => e.currentTarget.style.background="#fef0f0"}
                      >
                        {deletingId === product._id ? "..." : "🗑️ Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && search && (
            <div style={{ padding:"30px", textAlign:"center", color:"#aaa", fontSize:13 }}>
              No products found for "{search}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
