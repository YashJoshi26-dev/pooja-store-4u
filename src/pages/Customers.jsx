import { useState } from "react";

const mockCustomers = [
  { id: 1,  name: "Rahul Sharma",   email: "rahul@email.com",  phone: "+91 98765 00001", location: "Mumbai",   orders: 12, spent: 48200, joined: "Jan 2024", status: "Active"   },
  { id: 2,  name: "Priya Mehta",    email: "priya@email.com",  phone: "+91 98765 00002", location: "Delhi",    orders: 8,  spent: 22400, joined: "Mar 2024", status: "Active"   },
  { id: 3,  name: "Amit Singh",     email: "amit@email.com",   phone: "+91 98765 00003", location: "Pune",     orders: 3,  spent: 6800,  joined: "Jun 2024", status: "Active"   },
  { id: 4,  name: "Sneha Kapoor",   email: "sneha@email.com",  phone: "+91 98765 00004", location: "Chennai",  orders: 19, spent: 91000, joined: "Dec 2023", status: "Active"   },
  { id: 5,  name: "Vikram Nair",    email: "vikram@email.com", phone: "+91 98765 00005", location: "Kochi",    orders: 1,  spent: 1299,  joined: "Feb 2025", status: "Inactive" },
  { id: 6,  name: "Ananya Reddy",   email: "ananya@email.com", phone: "+91 98765 00006", location: "Hyderabad",orders: 7,  spent: 18700, joined: "Apr 2024", status: "Active"   },
  { id: 7,  name: "Karan Malhotra", email: "karan@email.com",  phone: "+91 98765 00007", location: "Bangalore",orders: 5,  spent: 32500, joined: "Aug 2024", status: "Active"   },
  { id: 8,  name: "Meera Pillai",   email: "meera@email.com",  phone: "+91 98765 00008", location: "Indore",   orders: 2,  spent: 4200,  joined: "Oct 2024", status: "Active"   },
  { id: 9,  name: "Rohan Desai",    email: "rohan@email.com",  phone: "+91 98765 00009", location: "Surat",    orders: 0,  spent: 0,     joined: "Jan 2025", status: "Inactive" },
  { id: 10, name: "Pooja Sharma",   email: "pooja@email.com",  phone: "+91 98765 00010", location: "Jaipur",   orders: 14, spent: 56800, joined: "Nov 2023", status: "Active"   },
];

export default function Customers() {
  const [search, setSearch]         = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selected, setSelected]     = useState(null);
  const [sortBy, setSortBy]         = useState("spent");

  const filtered = mockCustomers
    .filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        c.location.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "All" || c.status === statusFilter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === "spent")  return b.spent - a.spent;
      if (sortBy === "orders") return b.orders - a.orders;
      if (sortBy === "joined") return new Date(b.joined) - new Date(a.joined);
      return 0;
    });

  const stats = [
    { label: "Total Customers", value: mockCustomers.length,                                          color: "#ff3f6c", icon: "👥" },
    { label: "Active",          value: mockCustomers.filter(c => c.status === "Active").length,        color: "#00875a", icon: "✅" },
    { label: "Inactive",        value: mockCustomers.filter(c => c.status === "Inactive").length,      color: "#aaa",    icon: "😴" },
    { label: "Total Revenue",   value: `₹${mockCustomers.reduce((s, c) => s + c.spent, 0).toLocaleString()}`, color: "#ff6b35", icon: "💰" },
  ];

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        .cust-row { transition: background 0.12s; cursor: pointer; }
        .cust-row:hover { background: #fff8f9 !important; }
        .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.3); z-index: 100; display: flex; align-items: center; justify-content: center; }
        .modal { background: #fff; border-radius: 16px; padding: 28px; width: 440px; max-width: 95vw; box-shadow: 0 20px 60px rgba(0,0,0,0.15); }
      `}</style>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        {stats.map((s) => (
          <div key={s.label} style={{ background: "#fff", borderRadius: 12, padding: "18px 20px", border: "1px solid #f0f0f0", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
            <span style={{ fontSize: 22 }}>{s.icon}</span>
            <p style={{ fontSize: 22, fontWeight: 800, color: s.color, fontFamily: "'JetBrains Mono', monospace", margin: "10px 0 4px" }}>{s.value}</p>
            <p style={{ fontSize: 11, color: "#aaa", fontWeight: 700, letterSpacing: "0.04em" }}>{s.label.toUpperCase()}</p>
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #f0f0f0", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>

        {/* Toolbar */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #f5f5f5", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", gap: 8 }}>
            {["All", "Active", "Inactive"].map((s) => (
              <button key={s}
                onClick={() => setStatusFilter(s)}
                style={{ padding: "7px 16px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer", border: `1.5px solid ${statusFilter === s ? "#ff3f6c" : "#e8e8e8"}`, background: statusFilter === s ? "#ff3f6c" : "#fff", color: statusFilter === s ? "#fff" : "#888", transition: "all 0.15s", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                {s}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ fontSize: 12, border: "1px solid #e8e8e8", borderRadius: 8, padding: "7px 12px", outline: "none", fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#555" }}
            >
              <option value="spent">Sort: Top Spenders</option>
              <option value="orders">Sort: Most Orders</option>
              <option value="joined">Sort: Newest</option>
            </select>
            <input
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ background: "#f8f8f8", border: "1px solid #ebebeb", borderRadius: 8, padding: "8px 14px", fontSize: 13, outline: "none", width: 220, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            />
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #f5f5f5" }}>
                {["Customer", "Location", "Orders", "Total Spent", "Joined", "Status"].map(h => (
                  <th key={h} style={{ fontSize: 10, fontWeight: 700, color: "#bbb", letterSpacing: "0.06em", padding: "12px 16px", textAlign: "left" }}>{h.toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="cust-row" style={{ borderBottom: "1px solid #fafafa" }} onClick={() => setSelected(c)}>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#ff3f6c,#ff6b35)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 800, flexShrink: 0 }}>
                        {c.name[0]}
                      </div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a" }}>{c.name}</p>
                        <p style={{ fontSize: 11, color: "#aaa" }}>{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 12, color: "#666" }}>📍 {c.location}</td>
                  <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 700, color: "#1a1a1a", fontFamily: "'JetBrains Mono',monospace" }}>{c.orders}</td>
                  <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 700, color: "#ff3f6c", fontFamily: "'JetBrains Mono',monospace" }}>
                    {c.spent > 0 ? `₹${c.spent.toLocaleString()}` : "—"}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 11, color: "#aaa" }}>{c.joined}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
                      background: c.status === "Active" ? "#e6f9f2" : "#f5f5f5",
                      color: c.status === "Active" ? "#00875a" : "#aaa",
                    }}>
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={{ padding: "40px", textAlign: "center", color: "#aaa", fontSize: 13 }}>No customers found</div>
          )}
        </div>
      </div>

      {/* Customer Detail Modal */}
      {selected && (
        <div className="overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 52, height: 52, borderRadius: "50%", background: "linear-gradient(135deg,#ff3f6c,#ff6b35)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 20, fontWeight: 800 }}>
                  {selected.name[0]}
                </div>
                <div>
                  <h2 style={{ fontSize: 17, fontWeight: 800, color: "#1a1a1a" }}>{selected.name}</h2>
                  <p style={{ fontSize: 12, color: "#aaa" }}>{selected.email}</p>
                </div>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#aaa" }}>×</button>
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
              {[
                { label: "Total Orders", value: selected.orders, color: "#ff3f6c" },
                { label: "Total Spent",  value: selected.spent > 0 ? `₹${selected.spent.toLocaleString()}` : "—", color: "#ff6b35" },
              ].map((s) => (
                <div key={s.label} style={{ background: "#fafafa", borderRadius: 10, padding: "14px", border: "1px solid #f0f0f0", textAlign: "center" }}>
                  <p style={{ fontSize: 20, fontWeight: 800, color: s.color, fontFamily: "'JetBrains Mono',monospace", marginBottom: 4 }}>{s.value}</p>
                  <p style={{ fontSize: 11, color: "#aaa", fontWeight: 600 }}>{s.label}</p>
                </div>
              ))}
            </div>

            {[
              ["📞 Phone",    selected.phone],
              ["📍 Location", selected.location],
              ["📅 Joined",   selected.joined],
              ["Status",      selected.status],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f5f5f5" }}>
                <span style={{ fontSize: 12, color: "#888", fontWeight: 600 }}>{k}</span>
                <span style={{ fontSize: 13, color: "#1a1a1a", fontWeight: 700 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
