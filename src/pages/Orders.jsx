import { useState } from "react";
import { useNavigate } from "react-router-dom";

const mockOrders = [
  { id: "#ORD-9812", customer: "Rahul Sharma",   email: "rahul@email.com",  product: "Nike Air Max",      amount: 4299,  status: "Delivered",  date: "20 Mar 2026", items: 2 },
  { id: "#ORD-9811", customer: "Priya Mehta",    email: "priya@email.com",  product: "Levi's 511 Jeans",  amount: 2799,  status: "Shipped",    date: "20 Mar 2026", items: 1 },
  { id: "#ORD-9810", customer: "Amit Singh",     email: "amit@email.com",   product: "iPhone 15 Case",    amount: 899,   status: "Processing", date: "19 Mar 2026", items: 3 },
  { id: "#ORD-9809", customer: "Sneha Kapoor",   email: "sneha@email.com",  product: "Titan Watch",       amount: 6499,  status: "Delivered",  date: "19 Mar 2026", items: 1 },
  { id: "#ORD-9808", customer: "Vikram Nair",    email: "vikram@email.com", product: "Boat Earphones",    amount: 1299,  status: "Cancelled",  date: "18 Mar 2026", items: 1 },
  { id: "#ORD-9807", customer: "Ananya Reddy",   email: "ananya@email.com", product: "Kurta Set",         amount: 1899,  status: "Shipped",    date: "18 Mar 2026", items: 2 },
  { id: "#ORD-9806", customer: "Karan Malhotra", email: "karan@email.com",  product: "Sony Headphones",   amount: 8999,  status: "Delivered",  date: "17 Mar 2026", items: 1 },
  { id: "#ORD-9805", customer: "Meera Pillai",   email: "meera@email.com",  product: "Zara Dress",        amount: 3499,  status: "Processing", date: "17 Mar 2026", items: 2 },
  { id: "#ORD-9804", customer: "Rohan Desai",    email: "rohan@email.com",  product: "Dell Laptop Bag",   amount: 1599,  status: "Delivered",  date: "16 Mar 2026", items: 1 },
  { id: "#ORD-9803", customer: "Pooja Sharma",   email: "pooja@email.com",  product: "Ikea Lamp",         amount: 2199,  status: "Shipped",    date: "16 Mar 2026", items: 1 },
];

const statusConfig = {
  Delivered:  { bg: "#e6f9f2", color: "#00875a" },
  Shipped:    { bg: "#e8f4ff", color: "#0066cc" },
  Processing: { bg: "#fff8e0", color: "#c47f00" },
  Cancelled:  { bg: "#fef0f0", color: "#cc0000" },
};

const ALL_STATUSES = ["All", "Delivered", "Shipped", "Processing", "Cancelled"];

export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState(mockOrders);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const filtered = orders.filter((o) => {
    const matchSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.toLowerCase().includes(search.toLowerCase()) ||
      o.product.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleStatusChange = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o)
    );
    if (selectedOrder?.id === orderId) {
      setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
    }
  };

  const stats = [
    { label: "Total Orders",  value: orders.length,                                         color: "#ff3f6c", icon: "📦" },
    { label: "Delivered",     value: orders.filter(o => o.status === "Delivered").length,   color: "#00875a", icon: "✅" },
    { label: "In Transit",    value: orders.filter(o => o.status === "Shipped").length,     color: "#0066cc", icon: "🚚" },
    { label: "Total Revenue", value: `₹${orders.reduce((s, o) => s + o.amount, 0).toLocaleString()}`, color: "#ff6b35", icon: "💰" },
  ];

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        .ord-row { transition: background 0.12s; cursor: pointer; }
        .ord-row:hover { background: #fff8f9 !important; }
        .status-tab { padding: 7px 16px; border-radius: 20px; font-size: 12px; font-weight: 600; cursor: pointer; border: 1.5px solid #e8e8e8; background: #fff; color: #888; transition: all 0.15s; font-family: 'Plus Jakarta Sans', sans-serif; }
        .status-tab:hover { border-color: #ff3f6c; color: #ff3f6c; }
        .status-tab.active { background: #ff3f6c; color: #fff; border-color: #ff3f6c; }
        .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.3); z-index: 100; display: flex; align-items: center; justify-content: center; }
        .modal { background: #fff; border-radius: 16px; padding: 28px; width: 480px; max-width: 95vw; box-shadow: 0 20px 60px rgba(0,0,0,0.15); }
      `}</style>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        {stats.map((s) => (
          <div key={s.label} style={{ background: "#fff", borderRadius: 12, padding: "18px 20px", border: "1px solid #f0f0f0", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: 22 }}>{s.icon}</span>
            </div>
            <p style={{ fontSize: 22, fontWeight: 800, color: s.color, fontFamily: "'JetBrains Mono', monospace", marginBottom: 4 }}>{s.value}</p>
            <p style={{ fontSize: 11, color: "#aaa", fontWeight: 700, letterSpacing: "0.04em" }}>{s.label.toUpperCase()}</p>
          </div>
        ))}
      </div>

      {/* Orders Table Card */}
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #f0f0f0", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>

        {/* Toolbar */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #f5f5f5", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {ALL_STATUSES.map((s) => (
              <button key={s} className={`status-tab ${statusFilter === s ? "active" : ""}`} onClick={() => setStatusFilter(s)}>
                {s}
              </button>
            ))}
          </div>
          <input
            placeholder="Search orders, customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ background: "#f8f8f8", border: "1px solid #ebebeb", borderRadius: 8, padding: "8px 14px", fontSize: 13, outline: "none", width: 240, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          />
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #f5f5f5" }}>
                {["Order ID", "Customer", "Product", "Items", "Amount", "Status", "Date", "Action"].map(h => (
                  <th key={h} style={{ fontSize: 10, fontWeight: 700, color: "#bbb", letterSpacing: "0.06em", padding: "12px 16px", textAlign: "left" }}>{h.toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => {
                const sc = statusConfig[o.status] || { bg: "#f5f5f5", color: "#666" };
                return (
                  <tr key={o.id} className="ord-row" style={{ borderBottom: "1px solid #fafafa" }} onClick={() => setSelectedOrder(o)}>
                    <td style={{ padding: "12px 16px", fontSize: 12, fontFamily: "'JetBrains Mono',monospace", color: "#ff3f6c", fontWeight: 600 }}>{o.id}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a" }}>{o.customer}</p>
                      <p style={{ fontSize: 11, color: "#aaa" }}>{o.email}</p>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 12, color: "#555", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.product}</td>
                    <td style={{ padding: "12px 16px", fontSize: 12, color: "#555", fontFamily: "'JetBrains Mono',monospace" }}>{o.items}</td>
                    <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 700, color: "#1a1a1a", fontFamily: "'JetBrains Mono',monospace" }}>₹{o.amount.toLocaleString()}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ background: sc.bg, color: sc.color, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>{o.status}</span>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 11, color: "#aaa" }}>{o.date}</td>
                    <td style={{ padding: "12px 16px" }} onClick={(e) => e.stopPropagation()}>
                      <select
                        value={o.status}
                        onChange={(e) => handleStatusChange(o.id, e.target.value)}
                        style={{ fontSize: 11, border: "1px solid #e8e8e8", borderRadius: 6, padding: "4px 8px", outline: "none", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                      >
                        {["Processing", "Shipped", "Delivered", "Cancelled"].map(s => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={{ padding: "40px", textAlign: "center", color: "#aaa", fontSize: 13 }}>
              No orders found
            </div>
          )}
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: "#1a1a1a" }}>{selectedOrder.id}</h2>
                <p style={{ fontSize: 12, color: "#aaa", marginTop: 2 }}>{selectedOrder.date}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#aaa" }}>×</button>
            </div>

            {[
              ["Customer",  selectedOrder.customer],
              ["Email",     selectedOrder.email],
              ["Product",   selectedOrder.product],
              ["Items",     selectedOrder.items],
              ["Amount",    `₹${selectedOrder.amount.toLocaleString()}`],
              ["Status",    selectedOrder.status],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f5f5f5" }}>
                <span style={{ fontSize: 12, color: "#888", fontWeight: 600 }}>{k}</span>
                <span style={{ fontSize: 13, color: "#1a1a1a", fontWeight: 700 }}>{v}</span>
              </div>
            ))}

            <div style={{ marginTop: 20 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#aaa", marginBottom: 8, letterSpacing: "0.05em" }}>UPDATE STATUS</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {["Processing", "Shipped", "Delivered", "Cancelled"].map((s) => {
                  const sc = statusConfig[s];
                  return (
                    <button key={s}
                      onClick={() => handleStatusChange(selectedOrder.id, s)}
                      style={{ padding: "7px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: "pointer", border: `1.5px solid ${selectedOrder.status === s ? sc.color : "#e8e8e8"}`, background: selectedOrder.status === s ? sc.bg : "#fff", color: selectedOrder.status === s ? sc.color : "#888", transition: "all 0.15s" }}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
