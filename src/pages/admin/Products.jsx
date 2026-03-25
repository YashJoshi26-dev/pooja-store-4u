import { useNavigate } from "react-router-dom";
import ProductTable from "../../components/admin/ProductTable";

export default function Products() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "24px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* Header Row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#1a1a1a", letterSpacing: "-0.02em", marginBottom: 4 }}>
            Products
          </h1>
          <p style={{ fontSize: 13, color: "#aaa" }}>Manage your product listings</p>
        </div>

        {/* Add Product Button */}
        <button
          onClick={() => navigate("/admin/add-product")}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "#ff3f6c", color: "#fff", border: "none",
            borderRadius: 8, padding: "10px 20px",
            fontSize: 13, fontWeight: 700, cursor: "pointer",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            boxShadow: "0 4px 14px rgba(255,63,108,0.3)",
            transition: "all 0.18s",
          }}
          onMouseOver={e => {
            e.currentTarget.style.background = "#e6325a";
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseOut={e => {
            e.currentTarget.style.background = "#ff3f6c";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <span style={{ fontSize: 16 }}>+</span>
          Add Product
        </button>
      </div>

      <ProductTable />
    </div>
  );
}
