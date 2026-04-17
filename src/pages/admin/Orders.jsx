import { useState, useEffect } from "react";
import api from "../../api/api";

const statusConfig = {
  "Delivered": { bg: "#e6f9f2", color: "#00875a" },
  "Shipped": { bg: "#e8f4ff", color: "#0066cc" },
  "Processing": { bg: "#fff8e0", color: "#c47f00" },
  "Ready to Ship": { bg: "#fff0f4", color: "#ff3f6c" },
  "Cancelled": { bg: "#fef0f0", color: "#cc0000" },
  "Refund Processed": { bg: "#f5f5f5", color: "#666" },
};

const ALL_STATUSES = ["All", "Processing", "Ready to Ship", "Shipped", "Delivered", "Cancelled", "Refund Processed"];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selected, setSelected] = useState(null);
  const [updating, setUpdating] = useState(null);

  const [shipInfo, setShipInfo] = useState({ logisticPartner: "", trackingNumber: "" });
  const [shipError, setShipError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await api.get("/orders");
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = orders.filter((o) => {
    const matchSearch =
      o.orderId?.toLowerCase().includes(search.toLowerCase()) ||
      o.customerInfo?.name?.toLowerCase().includes(search.toLowerCase()) ||
      o.customerInfo?.email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleStatusChange = async (id, newStatus) => {
    // Validate shipping fields when marking as Shipped
    if (newStatus === "Shipped") {
      if (!shipInfo.logisticPartner) { setShipError("Please select a delivery partner"); return; }
      if (!shipInfo.trackingNumber.trim()) { setShipError("Please enter tracking / docket number"); return; }
    }
    setShipError("");
    setUpdating(id);
    try {
      const payload = { status: newStatus };
      if (newStatus === "Shipped") {
        payload.logisticPartner = shipInfo.logisticPartner;
        payload.trackingNumber = shipInfo.trackingNumber.trim();
      }
      const updated = await api.put(`/orders/${id}/status`, payload);
      setOrders(prev => prev.map(o => o._id === id ? {
        ...o,
        status: updated.status,
        logisticPartner: updated.logisticPartner,
        trackingNumber: updated.trackingNumber,
      } : o));
      if (selected?._id === id) setSelected(p => ({
        ...p,
        status: updated.status,
        logisticPartner: updated.logisticPartner,
        trackingNumber: updated.trackingNumber,
      }));
    } catch (err) {
      alert(err.message || "Failed to update status");
    } finally {
      setUpdating(null);
    }
  };

  const processingCount = orders.filter(o => o.status === "Processing").length
const lowStockThreshold = 5
const lowStockProducts = orders.flatMap(o => o.items || []).reduce((acc, item) => { if (!acc.find(i => i.title === item.title)) acc.push(item); return acc; }, [])
  const stats = [
    
    { label: "Total Orders", value: orders.length, color: "#ff3f6c", icon: "📦" },
    { label: "Delivered", value: orders.filter(o => o.status === "Delivered").length, color: "#00875a", icon: "✅" },
    { label: "In Transit", value: orders.filter(o => o.status === "Shipped").length, color: "#0066cc", icon: "🚚" },
    { label: "Total Revenue", value: `₹${orders.reduce((s, o) => s + (o.total || 0), 0).toLocaleString()}`, color: "#ff6b35", icon: "💰" },
  ];

  if (loading) return (
    <div style={{ textAlign: "center", padding: "60px", color: "#aaa", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>Loading orders...
    </div>
  );
  if (error) return (
    <div style={{ textAlign: "center", padding: "60px", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
      <p style={{ color: "#cc0000", marginBottom: 12 }}>❌ {error}</p>
      <button onClick={() => window.location.reload()} style={{ background: "#ff3f6c", color: "#fff", border: "none", borderRadius: 8, padding: "8px 20px", cursor: "pointer", fontWeight: 600 }}>Retry</button>
    </div>
  );

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
      <style>{`
        .ord-row{transition:background 0.12s;cursor:pointer;}.ord-row:hover{background:#fff8f9 !important;}
        .status-tab{padding:7px 16px;border-radius:20px;font-size:12px;font-weight:600;cursor:pointer;border:1.5px solid #e8e8e8;background:#fff;color:#888;transition:all 0.15s;font-family:'Plus Jakarta Sans',sans-serif;}
        .status-tab:hover{border-color:#ff3f6c;color:#ff3f6c;}.status-tab.active{background:#ff3f6c;color:#fff;border-color:#ff3f6c;}
        .overlay{position:fixed;inset:0;background:rgba(0,0,0,0.3);z-index:100;display:flex;align-items:center;justify-content:center;}
        .modal{background:#fff;border-radius:16px;padding:28px;width:520px;max-width:95vw;max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.15);}
      `}</style>

{/* ── Low stock / pending orders alert banner ── */}
{processingCount > 0 && (
  <div style={{
    display: "flex", alignItems: "center", justifyContent: "space-between",
    background: "#fff8e0", border: "1.5px solid #ffd666",
    borderRadius: 10, padding: "12px 18px", marginBottom: 16,
    gap: 12, flexWrap: "wrap",
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ fontSize: 20 }}>⚠️</span>
      <div>
        <p style={{ fontSize: 13, fontWeight: 700, color: "#c47f00", marginBottom: 2 }}>
          {processingCount} order{processingCount > 1 ? "s" : ""} pending — action required
        </p>
        <p style={{ fontSize: 11, color: "#a06000" }}>
          Review and update shipping status for Processing orders
        </p>
      </div>
    </div>
    <button
      onClick={() => setStatusFilter("Processing")}
      style={{
        background: "#c47f00", color: "#fff", border: "none",
        borderRadius: 7, padding: "7px 16px", fontSize: 12,
        fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap",
      }}
    >
      View Processing →
    </button>
  </div>
)}
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        {stats.map((s) => (
          <div key={s.label} style={{ background: "#fff", borderRadius: 12, padding: "18px 20px", border: "1px solid #f0f0f0", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
            <span style={{ fontSize: 22 }}>{s.icon}</span>
            <p style={{ fontSize: 22, fontWeight: 800, color: s.color, fontFamily: "'JetBrains Mono',monospace", margin: "10px 0 4px" }}>{s.value}</p>
            <p style={{ fontSize: 11, color: "#aaa", fontWeight: 700, letterSpacing: "0.04em" }}>{s.label.toUpperCase()}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #f0f0f0", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #f5f5f5", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {ALL_STATUSES.map(s => (
              <button key={s} className={`status-tab ${statusFilter === s ? "active" : ""}`} onClick={() => setStatusFilter(s)}>{s}</button>
            ))}
          </div>
          <input placeholder="Search orders, customers..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ background: "#f8f8f8", border: "1px solid #ebebeb", borderRadius: 8, padding: "8px 14px", fontSize: 13, outline: "none", width: 240, fontFamily: "'Plus Jakarta Sans',sans-serif" }} />
        </div>

        {orders.length === 0 ? (
          <div style={{ padding: "60px", textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
            <p style={{ fontSize: 16, fontWeight: 700, color: "#1a1a1a", marginBottom: 6 }}>No orders yet</p>
            <p style={{ fontSize: 13, color: "#aaa" }}>Customer orders will appear here automatically</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #f5f5f5" }}>
                  {["Order ID", "Customer", "Items", "Amount", "Status", "Date", "Action"].map(h => (
                    <th key={h} style={{ fontSize: 10, fontWeight: 700, color: "#bbb", letterSpacing: "0.06em", padding: "12px 16px", textAlign: "left" }}>{h.toUpperCase()}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(o => {
                  const sc = statusConfig[o.status] || { bg: "#f5f5f5", color: "#666" };
                  return (
                    <tr key={o._id} className="ord-row" style={{ borderBottom: "1px solid #fafafa" }}

                      onClick={() => {
                        setSelected(o);
                        setShipInfo({
                          logisticPartner: o.logisticPartner || "",
                          trackingNumber: o.trackingNumber || "",
                        });
                      }}>
                      <td style={{ padding: "12px 16px", fontSize: 12, fontFamily: "'JetBrains Mono',monospace", color: "#ff3f6c", fontWeight: 600 }}>{o.orderId}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a" }}>{o.customerInfo?.name}</p>
                        <p style={{ fontSize: 11, color: "#aaa" }}>{o.customerInfo?.email}</p>
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 12, color: "#555", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {o.items?.map(i => `${i.title} x${i.quantity}`).join(", ")}
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 700, color: "#1a1a1a", fontFamily: "'JetBrains Mono',monospace" }}>₹{o.total?.toLocaleString()}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ background: sc.bg, color: sc.color, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>{o.status}</span>
                      </td>
                     <td style={{padding:"12px 16px"}}>
  {o.logisticPartner ? (
    <div>
      <p style={{fontSize:11,fontWeight:700,color:"#0066cc"}}>{o.logisticPartner}</p>
      <p style={{fontSize:10,color:"#aaa",fontFamily:"monospace"}}>{o.trackingNumber||"—"}</p>
    </div>
  ) : (
    <span style={{fontSize:11,color:"#ddd"}}>—</span>
  )}
</td>
                      <td style={{ padding: "12px 16px" }} onClick={e => e.stopPropagation()}>
                        <select value={o.status} disabled={updating === o._id} onChange={e => handleStatusChange(o._id, e.target.value)}
                          style={{ fontSize: 11, border: "1px solid #e8e8e8", borderRadius: 6, padding: "4px 8px", outline: "none", cursor: "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                          {["Processing", "Ready to Ship", "Shipped", "Delivered", "Cancelled", "Refund Processed"].map(s => <option key={s}>{s}</option>)}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && <div style={{ padding: "40px", textAlign: "center", color: "#aaa", fontSize: 13 }}>No orders match your search</div>}
          </div>
        )}
      </div>

      {/* ✅ Modal — only renders when selected is not null */}
      {selected && (
        <div className="overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: "#1a1a1a" }}>{selected.orderId}</h2>
                <p style={{ fontSize: 12, color: "#aaa", marginTop: 2 }}>{new Date(selected.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#aaa" }}>×</button>
            </div>

            {/* Customer info */}
            {[
              ["Customer", selected.customerInfo?.name],
              ["Email", selected.customerInfo?.email],
              ["Phone", selected.customerInfo?.phone],
              ["Address", `${selected.deliveryAddress?.address}, ${selected.deliveryAddress?.city} - ${selected.deliveryAddress?.pincode}`],
              ["Amount", `₹${selected.total?.toLocaleString()}`],
              ["Payment", selected.paymentMethod?.toUpperCase()],
              ["Invoice No", selected.invoiceNumber || "—"],
              ["Status", selected.status],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f5f5f5" }}>
                <span style={{ fontSize: 12, color: "#888", fontWeight: 600 }}>{k}</span>
                <span style={{ fontSize: 13, color: "#1a1a1a", fontWeight: 700, textAlign: "right", maxWidth: "60%" }}>{v}</span>
              </div>
            ))}

            {/* ✅ Order items with SKU + qty — correctly inside modal */}
            <div style={{ marginTop: 16, marginBottom: 8 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#aaa", marginBottom: 10, letterSpacing: "0.05em" }}>ORDER ITEMS</p>
              {selected.items?.map((item, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f5f5f5" }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a" }}>{item.title}</p>
                    {item.sku && <p style={{ fontSize: 11, color: "#aaa", fontFamily: "monospace", marginTop: 2 }}>SKU: {item.sku}</p>}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: 12, color: "#555" }}>Qty: {item.quantity}</p>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a" }}>₹{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Update status buttons */}
            {/* Update status buttons */}
            {/* Update status */}
            <div style={{ marginTop: 20 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#aaa", marginBottom: 8, letterSpacing: "0.05em" }}>UPDATE STATUS</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
                {["Processing", "Ready to Ship", "Shipped", "Delivered", "Cancelled", "Refund Processed"].map(s => {
                  const sc = statusConfig[s] || { bg: "#f5f5f5", color: "#666" };
                  return (
                    <button key={s} onClick={() => handleStatusChange(selected._id, s)} disabled={updating === selected._id}
                      style={{
                        padding: "7px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: "pointer",
                        border: `1.5px solid ${selected.status === s ? sc.color : "#e8e8e8"}`,
                        background: selected.status === s ? sc.bg : "#fff",
                        color: selected.status === s ? sc.color : "#888", transition: "all 0.15s"
                      }}>
                      {updating === selected._id ? "..." : s}
                    </button>
                  );
                })}
              </div>

              {/* Shipping details — always visible, required when clicking Shipped */}
              <div style={{ background: "#f8f9ff", borderRadius: 12, padding: "16px", border: "1px solid #e8eeff" }}>
                <p style={{ fontSize: 11, fontWeight: 800, color: "#0066cc", marginBottom: 12, letterSpacing: "0.05em" }}>
                  🚚 SHIPPING DETAILS {selected.status === "Shipped" && <span style={{ color: "#00875a", marginLeft: 6 }}>✓ Saved</span>}
                </p>

                {/* Delivery Partner dropdown */}
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#555", display: "block", marginBottom: 5 }}>
                    Delivery Partner *
                  </label>
                  <select
                    value={shipInfo.logisticPartner}
                    onChange={e => { setShipInfo(p => ({ ...p, logisticPartner: e.target.value })); setShipError(""); }}
                    style={{ width: "100%", border: `1px solid ${shipError && !shipInfo.logisticPartner ? "#cc0000" : "#e0e0e0"}`, borderRadius: 8, padding: "9px 12px", fontSize: 13, outline: "none", fontFamily: "'Plus Jakarta Sans',sans-serif", background: "#fff", cursor: "pointer" }}
                  >
                    <option value="">-- Select Delivery Partner --</option>
                    <option value="Delhivery">Delhivery</option>
                    <option value="BlueDart">BlueDart</option>
                    <option value="DTDC">DTDC</option>
                    <option value="Ekart Logistics">Ekart Logistics</option>
                    <option value="Xpressbees">Xpressbees</option>
                    <option value="India Post">India Post</option>
                    <option value="Shadowfax">Shadowfax</option>
                    <option value="Ecom Express">Ecom Express</option>
                    <option value="Shiprocket">Shiprocket</option>
                    <option value="Borzo">Borzo</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Tracking number */}
                <div style={{ marginBottom: shipError ? 8 : 0 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#555", display: "block", marginBottom: 5 }}>
                    Tracking / Docket Number *
                  </label>
                  <input
                    value={shipInfo.trackingNumber}
                    onChange={e => { setShipInfo(p => ({ ...p, trackingNumber: e.target.value })); setShipError(""); }}
                    placeholder="e.g. DL1234567890"
                    style={{ width: "100%", border: `1px solid ${shipError && !shipInfo.trackingNumber.trim() ? "#cc0000" : "#e0e0e0"}`, borderRadius: 8, padding: "9px 12px", fontSize: 13, outline: "none", fontFamily: "'Plus Jakarta Sans',sans-serif" }}
                  />
                </div>

                {/* Error message */}
                {shipError && (
                  <p style={{ fontSize: 12, color: "#cc0000", fontWeight: 600, marginTop: 6 }}>⚠ {shipError}</p>
                )}

                {/* Show saved values */}
                {(selected.logisticPartner || selected.trackingNumber) && (
                  <div style={{ marginTop: 10, padding: "8px 12px", background: "#e6f9f2", borderRadius: 8, border: "1px solid #b7f0d8" }}>
                    <p style={{ fontSize: 11, color: "#00875a", fontWeight: 700 }}>
                      ✓ {selected.logisticPartner || "—"} &nbsp;|&nbsp; Docket: {selected.trackingNumber || "—"}
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}