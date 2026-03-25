import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2, Plus } from "lucide-react";
import { getAdminProducts, deleteProduct } from "../../api/productApi";

export default function ProductTable() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  // ✅ Load real products from localStorage
  useEffect(() => {
    async function load() {
      const data = await getAdminProducts();
      setProducts(data);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = products.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  );

  // ✅ Delete from localStorage and update UI
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    setDeletingId(id);
    await deleteProduct(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setDeletingId(null);
  };

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#aaa", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        Loading products...
      </div>
    );
  }

  return (
    <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #f0f0f0", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* Table Header */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #f5f5f5", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a" }}>
            Your Products
            <span style={{ marginLeft: 8, background: "#fff0f4", color: "#ff3f6c", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20 }}>
              {products.length}
            </span>
          </p>
          <p style={{ fontSize: 12, color: "#aaa", marginTop: 2 }}>Products added via admin panel</p>
        </div>
        <input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ background: "#f8f8f8", border: "1px solid #ebebeb", borderRadius: 8, padding: "8px 14px", fontSize: 13, outline: "none", width: 220, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        />
      </div>

      {/* Empty State */}
      {products.length === 0 ? (
        <div style={{ padding: "60px 20px", textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
          <p style={{ fontSize: 16, fontWeight: 700, color: "#1a1a1a", marginBottom: 6 }}>No products yet</p>
          <p style={{ fontSize: 13, color: "#aaa", marginBottom: 20 }}>Products you add will appear here and on the shop</p>
          <button
            onClick={() => navigate("/admin/add-product")}
            style={{ background: "#ff3f6c", color: "#fff", border: "none", borderRadius: 8, padding: "10px 24px", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 }}
          >
            <Plus size={16} /> Add Your First Product
          </button>
        </div>
      ) : (

        /* Table */
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #f5f5f5" }}>
                {["Product", "Category", "Price", "Stock", "Status", "Actions"].map(h => (
                  <th key={h} style={{ fontSize: 10, fontWeight: 700, color: "#bbb", letterSpacing: "0.06em", padding: "12px 16px", textAlign: "left" }}>
                    {h.toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => (
                <tr key={product.id} style={{ borderBottom: "1px solid #fafafa", transition: "background 0.12s" }}
                  onMouseOver={e => e.currentTarget.style.background = "#fff8f9"}
                  onMouseOut={e => e.currentTarget.style.background = "transparent"}
                >
                  {/* Product */}
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <img
                        src={product.image}
                        alt={product.title}
                        style={{ width: 44, height: 44, borderRadius: 8, objectFit: "cover", border: "1px solid #f0f0f0", flexShrink: 0 }}
                      />
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {product.title}
                        </p>
                        {product.sku && (
                          <p style={{ fontSize: 10, color: "#bbb", fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>
                            {product.sku}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td style={{ padding: "12px 16px", fontSize: 12, color: "#666" }}>
                    {product.category}
                  </td>

                  {/* Price */}
                  <td style={{ padding: "12px 16px" }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a", fontFamily: "'JetBrains Mono', monospace" }}>
                      ₹{product.price}
                    </p>
                    {product.oldPrice && (
                      <p style={{ fontSize: 11, color: "#aaa", textDecoration: "line-through", fontFamily: "'JetBrains Mono', monospace" }}>
                        ₹{product.oldPrice}
                      </p>
                    )}
                  </td>

                  {/* Stock */}
                  <td style={{ padding: "12px 16px", fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: product.stock < 10 ? "#e65c00" : "#333", fontWeight: 600 }}>
                    {product.stock}
                  </td>

                  {/* Status */}
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
                      background: product.status === "active" ? "#e6f9f2" : product.status === "draft" ? "#fff8e0" : "#fef0f0",
                      color: product.status === "active" ? "#00875a" : product.status === "draft" ? "#c47f00" : "#cc0000",
                    }}>
                      {product.status || "active"}
                    </span>
                  </td>

                  {/* Actions */}
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", gap: 10 }}>
                      <button
                        onClick={() => navigate(`/admin/add-product?edit=${product.id}`)}
                        style={{ background: "#f8f8f8", border: "1px solid #ebebeb", borderRadius: 6, padding: "6px 10px", cursor: "pointer", color: "#555", display: "flex", alignItems: "center" }}
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        disabled={deletingId === product.id}
                        style={{ background: "#fef0f0", border: "1px solid #ffd0d0", borderRadius: 6, padding: "6px 10px", cursor: "pointer", color: "#cc0000", display: "flex", alignItems: "center" }}
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && search && (
            <div style={{ padding: "30px", textAlign: "center", color: "#aaa", fontSize: 13 }}>
              No products found for "{search}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
