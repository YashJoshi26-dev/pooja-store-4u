import { useState, useEffect } from "react";
import api from "../../api/api";

export default function Customers() {
  const [customers,    setCustomers]    = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy,       setSortBy]       = useState("createdAt");
  const [selected,     setSelected]     = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.get("/users");
        setCustomers(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || "Failed to load customers");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = customers
    .filter(c => {
      const matchSearch =
        c.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.email?.toLowerCase().includes(search.toLowerCase()) ||
        c.phone?.toLowerCase().includes(search.toLowerCase());
      const matchStatus =
        statusFilter === "All" ||
        (statusFilter === "Active" ? c.isActive !== false : c.isActive === false);
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === "createdAt")  return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "orders")     return (b.orderCount||0) - (a.orderCount||0);
      if (sortBy === "totalSpent") return (b.totalSpent||0) - (a.totalSpent||0);
      return 0;
    });

  const stats = [
    { label:"Total Customers", value:customers.length,                                                                    color:"#ff3f6c", icon:"👥" },
    { label:"Active",          value:customers.filter(c=>c.isActive!==false).length,                                      color:"#00875a", icon:"✅" },
    { label:"Inactive",        value:customers.filter(c=>c.isActive===false).length,                                      color:"#aaa",    icon:"😴" },
    { label:"This Month",      value:customers.filter(c=>new Date(c.createdAt).getMonth()===new Date().getMonth()&&new Date(c.createdAt).getFullYear()===new Date().getFullYear()).length, color:"#ff6b35", icon:"📅" },
  ];

  if (loading) return (
    <div style={{textAlign:"center",padding:"60px",color:"#aaa",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
      <div style={{fontSize:32,marginBottom:12}}>⏳</div>Loading customers...
    </div>
  );
  if (error) return (
    <div style={{textAlign:"center",padding:"60px",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
      <p style={{color:"#cc0000",marginBottom:12}}>❌ {error}</p>
      <button onClick={()=>window.location.reload()} style={{background:"#ff3f6c",color:"#fff",border:"none",borderRadius:8,padding:"8px 20px",cursor:"pointer",fontWeight:600}}>Retry</button>
    </div>
  );

  return (
    <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
      <style>{`
        .cust-row{transition:background 0.12s;cursor:pointer;}.cust-row:hover{background:#fff8f9 !important;}
        .overlay{position:fixed;inset:0;background:rgba(0,0,0,0.3);z-index:100;display:flex;align-items:center;justify-content:center;}
        .modal{background:#fff;border-radius:16px;padding:28px;width:460px;max-width:95vw;max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.15);}
      `}</style>

      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:24}}>
        {stats.map(s=>(
          <div key={s.label} style={{background:"#fff",borderRadius:12,padding:"18px 20px",border:"1px solid #f0f0f0",boxShadow:"0 1px 4px rgba(0,0,0,0.05)"}}>
            <span style={{fontSize:22}}>{s.icon}</span>
            <p style={{fontSize:22,fontWeight:800,color:s.color,fontFamily:"'JetBrains Mono',monospace",margin:"10px 0 4px"}}>{s.value}</p>
            <p style={{fontSize:11,color:"#aaa",fontWeight:700,letterSpacing:"0.04em"}}>{s.label.toUpperCase()}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{background:"#fff",borderRadius:12,border:"1px solid #f0f0f0",boxShadow:"0 1px 4px rgba(0,0,0,0.05)"}}>
        <div style={{padding:"16px 20px",borderBottom:"1px solid #f5f5f5",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
          <div style={{display:"flex",gap:8}}>
            {["All","Active","Inactive"].map(s=>(
              <button key={s} onClick={()=>setStatusFilter(s)}
                style={{padding:"7px 16px",borderRadius:20,fontSize:12,fontWeight:600,cursor:"pointer",border:`1.5px solid ${statusFilter===s?"#ff3f6c":"#e8e8e8"}`,background:statusFilter===s?"#ff3f6c":"#fff",color:statusFilter===s?"#fff":"#888",transition:"all 0.15s",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
                {s}
              </button>
            ))}
          </div>
          <div style={{display:"flex",gap:10}}>
            <select value={sortBy} onChange={e=>setSortBy(e.target.value)}
              style={{fontSize:12,border:"1px solid #e8e8e8",borderRadius:8,padding:"7px 12px",outline:"none",fontFamily:"'Plus Jakarta Sans',sans-serif",color:"#555"}}>
              <option value="createdAt">Sort: Newest First</option>
              <option value="orders">Sort: Most Orders</option>
              <option value="totalSpent">Sort: Most Spent</option>
            </select>
            <input placeholder="Search customers..." value={search} onChange={e=>setSearch(e.target.value)}
              style={{background:"#f8f8f8",border:"1px solid #ebebeb",borderRadius:8,padding:"8px 14px",fontSize:13,outline:"none",width:220,fontFamily:"'Plus Jakarta Sans',sans-serif"}}/>
          </div>
        </div>

        {customers.length===0 ? (
          <div style={{padding:"60px",textAlign:"center"}}>
            <div style={{fontSize:48,marginBottom:12}}>👥</div>
            <p style={{fontSize:16,fontWeight:700,color:"#1a1a1a",marginBottom:6}}>No customers yet</p>
            <p style={{fontSize:13,color:"#aaa"}}>Registered customers will appear here</p>
          </div>
        ) : (
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead>
                <tr style={{borderBottom:"1px solid #f5f5f5"}}>
                  {["Customer","Phone","Orders","Total Spent","Joined","Status"].map(h=>(
                    <th key={h} style={{fontSize:10,fontWeight:700,color:"#bbb",letterSpacing:"0.06em",padding:"12px 16px",textAlign:"left"}}>{h.toUpperCase()}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(c=>(
                  <tr key={c._id} className="cust-row" style={{borderBottom:"1px solid #fafafa"}} onClick={()=>setSelected(c)}>
                    <td style={{padding:"12px 16px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:12}}>
                        <div style={{width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,#ff3f6c,#ff6b35)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:13,fontWeight:800,flexShrink:0}}>
                          {c.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p style={{fontSize:13,fontWeight:600,color:"#1a1a1a"}}>{c.name}</p>
                          <p style={{fontSize:11,color:"#aaa"}}>{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{padding:"12px 16px",fontSize:12,color:"#666"}}>{c.phone||"—"}</td>
                    <td style={{padding:"12px 16px",fontSize:13,fontWeight:700,color:"#1a1a1a",fontFamily:"'JetBrains Mono',monospace"}}>{c.orderCount??0}</td>
                    <td style={{padding:"12px 16px",fontSize:13,fontWeight:700,color:"#ff6b35",fontFamily:"'JetBrains Mono',monospace"}}>
                      {c.totalSpent!=null?`₹${c.totalSpent.toLocaleString()}`:"₹0"}
                    </td>
                    <td style={{padding:"12px 16px",fontSize:11,color:"#aaa"}}>{new Date(c.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</td>
                    <td style={{padding:"12px 16px"}}>
                      <span style={{fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:20,background:c.isActive!==false?"#e6f9f2":"#f5f5f5",color:c.isActive!==false?"#00875a":"#aaa"}}>
                        {c.isActive!==false?"Active":"Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length===0&&<div style={{padding:"40px",textAlign:"center",color:"#aaa",fontSize:13}}>No customers match your search</div>}
          </div>
        )}
      </div>

      {/* Modal */}
      {selected&&(
        <div className="overlay" onClick={()=>setSelected(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
              <div style={{display:"flex",alignItems:"center",gap:14}}>
                <div style={{width:52,height:52,borderRadius:"50%",background:"linear-gradient(135deg,#ff3f6c,#ff6b35)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:20,fontWeight:800}}>
                  {selected.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <h2 style={{fontSize:17,fontWeight:800,color:"#1a1a1a"}}>{selected.name}</h2>
                  <p style={{fontSize:12,color:"#aaa"}}>{selected.email}</p>
                </div>
              </div>
              <button onClick={()=>setSelected(null)} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#aaa"}}>×</button>
            </div>
            {[
              ["📞 Phone",       selected.phone||"—"],
              ["📍 City",        selected.address?.city||"—"],
              ["📅 Joined",      new Date(selected.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"})],
              ["🛍️ Orders",      selected.orderCount??0],
              ["💰 Total Spent", selected.totalSpent!=null?`₹${selected.totalSpent.toLocaleString()}`:"₹0"],
              ["Status",         selected.isActive!==false?"Active":"Inactive"],
            ].map(([k,v])=>(
              <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:"1px solid #f5f5f5"}}>
                <span style={{fontSize:12,color:"#888",fontWeight:600}}>{k}</span>
                <span style={{fontSize:13,color:"#1a1a1a",fontWeight:700}}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
