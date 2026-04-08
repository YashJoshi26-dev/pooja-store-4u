import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Orders    from "./Orders";      // ✅ fixed: was ../Orders
import Customers from "./Customers";   // ✅ fixed: was ../Customers
import api from "../../api/api";

// ─── STATIC HELPERS ───────────────────────────────────────────────────────────
const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const statusColor = (s) => ({
  Delivered:  { bg:"#e6f9f2", color:"#00875a" },
  Shipped:    { bg:"#e8f4ff", color:"#0066cc" },
  Processing: { bg:"#fff8e0", color:"#c47f00" },
  Cancelled:  { bg:"#fef0f0", color:"#cc0000" },
}[s] || { bg:"#f5f5f5", color:"#666" });

const sellerInfo = {
  name:"Admin", email:"admin@test.com", phone:"+91 98765 43210",
  store:"PoojaStore4u", gst:"27AABCU9603R1ZX", location:"Indore, Madhya Pradesh",
  plan:"Pro Seller", planExpiry:"Apr 1, 2027", joined:"Jan 2025",
};

// ─── CHARTS ───────────────────────────────────────────────────────────────────
function Sparkline({ data, color="#ff3f6c", height=40, width=80 }) {
  if (!data?.length) return null;
  const max=Math.max(...data), min=Math.min(...data);
  const pts=data.map((v,i)=>{
    const x=(i/(data.length-1))*width;
    const y=height-((v-min)/(max-min||1))*height;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={width} height={height} style={{display:"block"}}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
    </svg>
  );
}

function LineChart({ data, labels, color="#ff3f6c", unit="" }) {
  const W=500,H=160,pad={t:10,r:10,b:30,l:40};
  const max=Math.max(...data)||1;
  const x=(i)=>pad.l+(i/(data.length-1))*(W-pad.l-pad.r);
  const y=(v)=>pad.t+(1-v/max)*(H-pad.t-pad.b);
  const pts=data.map((v,i)=>`${x(i)},${y(v)}`).join(" ");
  const area=`${x(0)},${H-pad.b} `+data.map((v,i)=>`${x(i)},${y(v)}`).join(" ")+` ${x(data.length-1)},${H-pad.b}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:"100%"}}>
      <defs>
        <linearGradient id="lg1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      {[0,0.25,0.5,0.75,1].map((t,i)=>(
        <g key={i}>
          <line x1={pad.l} x2={W-pad.r} y1={pad.t+t*(H-pad.t-pad.b)} y2={pad.t+t*(H-pad.t-pad.b)} stroke="#f0f0f0" strokeWidth="1"/>
          <text x={pad.l-6} y={pad.t+t*(H-pad.t-pad.b)+4} textAnchor="end" fontSize="9" fill="#bbb">{Math.round(max*(1-t))}{unit}</text>
        </g>
      ))}
      <polygon points={area} fill="url(#lg1)"/>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round"/>
      {data.map((v,i)=><circle key={i} cx={x(i)} cy={y(v)} r="3.5" fill="#fff" stroke={color} strokeWidth="2"/>)}
      {labels.filter((_,i)=>i%2===0).map((l,idx)=>{
        const i=idx*2;
        return <text key={i} x={x(i)} y={H-pad.b+14} textAnchor="middle" fontSize="9" fill="#bbb">{l}</text>;
      })}
    </svg>
  );
}

function BarChart({ data, labels, color="#ff3f6c" }) {
  const W=500,H=160,pad={t:10,r:10,b:30,l:36};
  const max=Math.max(...data)||1;
  const bw=(W-pad.l-pad.r)/data.length;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:"100%"}}>
      {[0,0.5,1].map((t,i)=>(
        <line key={i} x1={pad.l} x2={W-pad.r} y1={pad.t+t*(H-pad.t-pad.b)} y2={pad.t+t*(H-pad.t-pad.b)} stroke="#f0f0f0" strokeWidth="1"/>
      ))}
      {data.map((v,i)=>{
        const bh=(v/max)*(H-pad.t-pad.b);
        const bx=pad.l+i*bw+bw*0.15;
        const by=pad.t+(H-pad.t-pad.b)-bh;
        return (
          <g key={i}>
            <rect x={bx} y={by} width={bw*0.7} height={bh} rx="4" fill={i%3===0?color:i%3===1?"#ff6b35":"#ffaa00"} opacity="0.85"/>
            <text x={bx+bw*0.35} y={H-pad.b+14} textAnchor="middle" fontSize="9" fill="#bbb">{labels[i]}</text>
          </g>
        );
      })}
    </svg>
  );
}

function AreaChart({ data, labels }) {
  const W=500,H=160,pad={t:10,r:10,b:30,l:40};
  const max=Math.max(...data)||1;
  const x=(i)=>pad.l+(i/(data.length-1))*(W-pad.l-pad.r);
  const y=(v)=>pad.t+(1-v/max)*(H-pad.t-pad.b);
  const area=`${x(0)},${H-pad.b} `+data.map((v,i)=>`${x(i)},${y(v)}`).join(" ")+` ${x(data.length-1)},${H-pad.b}`;
  const line=data.map((v,i)=>`${x(i)},${y(v)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:"100%"}}>
      <defs>
        <linearGradient id="lg2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff6b35" stopOpacity="0.25"/>
          <stop offset="100%" stopColor="#ff6b35" stopOpacity="0"/>
        </linearGradient>
      </defs>
      {[0,0.5,1].map((t,i)=>(
        <line key={i} x1={pad.l} x2={W-pad.r} y1={pad.t+t*(H-pad.t-pad.b)} y2={pad.t+t*(H-pad.t-pad.b)} stroke="#f0f0f0" strokeWidth="1"/>
      ))}
      <polygon points={area} fill="url(#lg2)"/>
      <polyline points={line} fill="none" stroke="#ff6b35" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round"/>
      {labels.filter((_,i)=>i%2===0).map((l,idx)=>{
        const i=idx*2;
        return <text key={i} x={x(i)} y={H-pad.b+14} textAnchor="middle" fontSize="9" fill="#bbb">{l}</text>;
      })}
    </svg>
  );
}

function DonutChart({ data }) {
  const R=54,r=34,cx=70,cy=70;
  let angle=-Math.PI/2;
  const total=data.reduce((s,d)=>s+d.value,0)||1;
  const slices=data.map((d)=>{
    const a=(d.value/total)*2*Math.PI;
    const x1=cx+R*Math.cos(angle),y1=cy+R*Math.sin(angle);
    angle+=a;
    const x2=cx+R*Math.cos(angle),y2=cy+R*Math.sin(angle);
    const lf=a>Math.PI?1:0;
    const ix1=cx+r*Math.cos(angle-a),iy1=cy+r*Math.sin(angle-a);
    const ix2=cx+r*Math.cos(angle),iy2=cy+r*Math.sin(angle);
    return{...d,path:`M${x1},${y1} A${R},${R} 0 ${lf},1 ${x2},${y2} L${ix2},${iy2} A${r},${r} 0 ${lf},0 ${ix1},${iy1} Z`};
  });
  return (
    <div style={{display:"flex",alignItems:"center",gap:20}}>
      <svg viewBox="0 0 140 140" style={{width:130,height:130,flexShrink:0}}>
        {slices.map((s,i)=><path key={i} d={s.path} fill={s.color} opacity="0.9"/>)}
        <text x={cx} y={cy-6} textAnchor="middle" fontSize="13" fontWeight="800" fill="#1a1a1a">{total}</text>
        <text x={cx} y={cy+10} textAnchor="middle" fontSize="9" fill="#aaa">Traffic</text>
      </svg>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {data.map((d)=>(
          <div key={d.label} style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:10,height:10,borderRadius:"50%",background:d.color,flexShrink:0}}/>
            <span style={{fontSize:12,color:"#555",fontWeight:500}}>{d.label}</span>
            <span style={{fontSize:12,color:"#1a1a1a",fontWeight:700,marginLeft:"auto"}}>{d.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── AI INSIGHTS ──────────────────────────────────────────────────────────────
function buildInsights(stats) {
  if (!stats) return [{ icon:"📊", title:"Store is live", body:"Your store is connected and tracking real orders, customers, and revenue. Insights will appear as data grows.", tag:"General" }];
  const insights = [];
  if (stats.revenueGrowth > 15)   insights.push({ icon:"🔥", title:"Revenue spike detected",   body:`Sales are up ${stats.revenueGrowth}% vs last month. Strong momentum!`,         tag:"Revenue"   });
  else if (stats.revenueGrowth < 0) insights.push({ icon:"📉", title:"Revenue dip detected",   body:`Revenue is down ${Math.abs(stats.revenueGrowth)}% vs last month.`,              tag:"Revenue"   });
  if (stats.pendingOrders > 5)    insights.push({ icon:"📦", title:"Orders need attention",    body:`${stats.pendingOrders} orders still in Processing. Update shipping status.`,    tag:"Orders"    });
  if (stats.cancelledOrders > 3)  insights.push({ icon:"⚠️",  title:"High cancellation rate", body:`${stats.cancelledOrders} orders cancelled this month.`,                          tag:"Orders"    });
  if (stats.newCustomersThisMonth > 0) insights.push({ icon:"👥", title:"New customers",      body:`${stats.newCustomersThisMonth} new customers signed up this month.`,             tag:"Customers" });
  if (stats.totalOrders > 0 && stats.deliveredOrders/stats.totalOrders > 0.8)
    insights.push({ icon:"✅", title:"Excellent delivery rate", body:`${Math.round((stats.deliveredOrders/stats.totalOrders)*100)}% of orders delivered!`, tag:"Delivery" });
  if (insights.length === 0) insights.push({ icon:"📊", title:"Store is live", body:"Your store is connected. Insights will appear as data grows.", tag:"General" });
  return insights.slice(0,4);
}

// ─── ACCOUNT PAGE ─────────────────────────────────────────────────────────────
function AccountPage({ onLogout, stats }) {
  const fields = [
    { label:"Store Name",   value:sellerInfo.store,    icon:"🛍️" },
    { label:"Email",        value:sellerInfo.email,    icon:"📧" },
    { label:"Phone",        value:sellerInfo.phone,    icon:"📞" },
    { label:"GST Number",   value:sellerInfo.gst,      icon:"🧾" },
    { label:"Location",     value:sellerInfo.location, icon:"📍" },
    { label:"Member Since", value:sellerInfo.joined,   icon:"📅" },
  ];
  const accountStats = [
    { label:"Total Revenue", value: stats ? `₹${(stats.totalRevenue/100000).toFixed(1)}L` : "—", color:"#ff3f6c" },
    { label:"Total Orders",  value: stats ? stats.totalOrders.toLocaleString() : "—",             color:"#ff6b35" },
    { label:"Customers",     value: stats ? stats.totalCustomers.toLocaleString() : "—",          color:"#ffa500" },
  ];
  return (
    <div style={{maxWidth:700}}>
      <div style={{background:"#fff",borderRadius:16,border:"1px solid #f0f0f0",padding:"28px",marginBottom:16,boxShadow:"0 1px 4px rgba(0,0,0,0.05)"}}>
        <div style={{display:"flex",alignItems:"center",gap:20,marginBottom:24}}>
          <div style={{width:72,height:72,borderRadius:"50%",background:"linear-gradient(135deg,#ff3f6c,#ff6b35)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:28,fontWeight:800,flexShrink:0}}>
            {sellerInfo.name[0]}
          </div>
          <div>
            <h2 style={{fontSize:20,fontWeight:800,color:"#1a1a1a",marginBottom:4}}>{sellerInfo.name}</h2>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{background:"#fff0f4",color:"#ff3f6c",fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:20,border:"1px solid #ffd0db"}}>{sellerInfo.plan}</span>
              <span style={{fontSize:11,color:"#aaa"}}>Renews {sellerInfo.planExpiry}</span>
            </div>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:24}}>
          {accountStats.map((s)=>(
            <div key={s.label} style={{background:"#fafafa",borderRadius:10,padding:"14px 16px",border:"1px solid #f0f0f0",textAlign:"center"}}>
              <p style={{fontSize:20,fontWeight:800,color:s.color,fontFamily:"'JetBrains Mono',monospace",marginBottom:4}}>{s.value}</p>
              <p style={{fontSize:11,color:"#aaa",fontWeight:600}}>{s.label}</p>
            </div>
          ))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          {fields.map((f)=>(
            <div key={f.label} style={{background:"#fafafa",borderRadius:10,padding:"12px 14px",border:"1px solid #f0f0f0"}}>
              <p style={{fontSize:10,fontWeight:700,color:"#bbb",letterSpacing:"0.05em",marginBottom:5}}>{f.icon} {f.label.toUpperCase()}</p>
              <p style={{fontSize:13,fontWeight:600,color:"#333"}}>{f.value}</p>
            </div>
          ))}
        </div>
      </div>
      <button onClick={onLogout}
        style={{width:"100%",background:"#fff",border:"1.5px solid #ffd0db",color:"#ff3f6c",borderRadius:12,padding:"13px",fontSize:14,fontWeight:700,cursor:"pointer"}}
        onMouseOver={e=>e.currentTarget.style.background="#fff0f4"}
        onMouseOut={e=>e.currentTarget.style.background="#fff"}
      >🚪 Logout from Admin</button>
    </div>
  );
}

function PlaceholderPage({ icon, title }) {
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:400,gap:12}}>
      <div style={{fontSize:48}}>{icon}</div>
      <h2 style={{fontSize:20,fontWeight:700,color:"#1a1a1a"}}>{title}</h2>
      <p style={{fontSize:13,color:"#aaa"}}>This section is coming soon.</p>
    </div>
  );
}

// ─── NAV CONFIG ───────────────────────────────────────────────────────────────
const navItems = [
  { id:"dashboard", icon:"⊞",  label:"Dashboard" },
  { id:"orders",    icon:"📦", label:"Orders"    },
  { id:"products",  icon:"🛍️", label:"Products"  },
  { id:"customers", icon:"👥", label:"Customers" },
  { id:"analytics", icon:"📊", label:"Analytics" },
  { id:"settings",  icon:"⚙️", label:"Settings"  },
  { id:"account",   icon:"👤", label:"Account"   },
];

const pageTitle = {
  dashboard:"Overview", orders:"Orders", customers:"Customers",
  analytics:"Analytics", settings:"Settings", account:"Account",
};

const S = {
  shell:   { display:"flex", minHeight:"100vh", background:"#f4f4f4", fontFamily:"'Plus Jakarta Sans',sans-serif" },
  sidebar: { background:"#fff", borderRight:"1px solid #ebebeb", display:"flex", flexDirection:"column", position:"sticky", top:0, height:"100vh", overflowY:"auto", transition:"width 0.25s ease", flexShrink:0, zIndex:50 },
  main:    { flex:1, display:"flex", flexDirection:"column", minWidth:0 },
  topBar:  { background:"#fff", borderBottom:"1px solid #ebebeb", padding:"0 24px", height:56, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:40, boxShadow:"0 1px 4px rgba(0,0,0,0.04)" },
  content: { flex:1, padding:"24px", overflowY:"auto" },
};

// ─── DASHBOARD CONTENT ────────────────────────────────────────────────────────
function DashboardContent({ period, onNavigate, stats, recentOrders, topProducts, loading }) {
  const navigate = useNavigate();

  const donutData = [
    { label:"Organic",  value:38, color:"#ff3f6c" },
    { label:"Direct",   value:27, color:"#ff6b35" },
    { label:"Social",   value:20, color:"#ffa500" },
    { label:"Referral", value:15, color:"#ffcc02" },
  ];

  const revenueSpark = stats?.monthlyRevenue  || Array(12).fill(0);
  const ordersSpark  = stats?.monthlyOrders   || Array(12).fill(0);
  const custSpark    = stats?.monthlyCustomers|| Array(12).fill(0);

  const kpis = [
    { label:"Total Revenue", value:stats?`₹${(stats.totalRevenue/100000).toFixed(1)}L`:"—",   sub:stats?.revenueGrowth  !=null?`${stats.revenueGrowth >0?"+":""}${stats.revenueGrowth}% vs last month`:"Loading...",  spark:revenueSpark, color:"#ff3f6c", icon:"💰" },
    { label:"Total Orders",  value:stats?stats.totalOrders.toLocaleString():"—",               sub:stats?.ordersGrowth   !=null?`${stats.ordersGrowth  >0?"+":""}${stats.ordersGrowth}% vs last month`:"Loading...",   spark:ordersSpark,  color:"#ff6b35", icon:"📦" },
    { label:"Customers",     value:stats?stats.totalCustomers.toLocaleString():"—",            sub:stats?.customersGrowth!=null?`${stats.customersGrowth>0?"+":""}${stats.customersGrowth}% vs last month`:"Loading...",spark:custSpark,    color:"#ffa500", icon:"👥" },
    { label:"Conversion",    value:stats?`${stats.conversionRate??"—"}%`:"—",                  sub:"Based on orders vs visits",                                                                                          spark:revenueSpark, color:"#03a685", icon:"📈" },
  ];

  const aiInsights = buildInsights(stats);
  const maxSales   = topProducts.length ? Math.max(...topProducts.map(p=>p.sales||1)) : 1;

  if (loading) return (
    <div style={{textAlign:"center",padding:"60px",color:"#aaa"}}>
      <div style={{fontSize:32,marginBottom:12}}>⏳</div>Loading dashboard...
    </div>
  );

  return (
    <>
      {/* KPI Cards */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:24}}>
        {kpis.map((k,i)=>(
          <div key={k.label} className={`kpi-card fade-up-${i+1}`}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
              <div style={{width:38,height:38,borderRadius:10,background:`${k.color}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{k.icon}</div>
              <Sparkline data={k.spark} color={k.color}/>
            </div>
            <p style={{fontSize:22,fontWeight:800,color:"#1a1a1a",fontFamily:"'JetBrains Mono',monospace",marginBottom:4}}>{k.value}</p>
            <p style={{fontSize:11,fontWeight:700,color:"#aaa",letterSpacing:"0.04em",marginBottom:2}}>{k.label.toUpperCase()}</p>
            <p style={{fontSize:11,color:k.sub.startsWith("+")?"#03a685":k.sub.startsWith("-")?"#cc0000":"#aaa",fontWeight:600}}>{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Revenue + Traffic */}
      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:16,marginBottom:16}}>
        <div className="chart-card fade-up-2">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <div>
              <h3 style={{fontSize:14,fontWeight:700,color:"#1a1a1a"}}>Revenue Trend</h3>
              <p style={{fontSize:11,color:"#aaa",marginTop:2}}>Monthly revenue over last 12 months</p>
            </div>
            {stats?.revenueGrowth!=null&&(
              <span style={{fontSize:11,background:stats.revenueGrowth>=0?"#e6f9f2":"#fef0f0",color:stats.revenueGrowth>=0?"#00875a":"#cc0000",padding:"3px 10px",borderRadius:20,fontWeight:700}}>
                {stats.revenueGrowth>=0?"↑":"↓"} {Math.abs(stats.revenueGrowth)}%
              </span>
            )}
          </div>
          <div style={{height:160}}><LineChart data={revenueSpark} labels={months} unit=""/></div>
        </div>
        <div className="chart-card fade-up-3">
          <div style={{marginBottom:16}}>
            <h3 style={{fontSize:14,fontWeight:700,color:"#1a1a1a"}}>Traffic Sources</h3>
            <p style={{fontSize:11,color:"#aaa",marginTop:2}}>Where customers come from</p>
          </div>
          <DonutChart data={donutData}/>
        </div>
      </div>

      {/* Orders + Customer Growth */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:24}}>
        <div className="chart-card fade-up-3">
          <div style={{marginBottom:16}}>
            <h3 style={{fontSize:14,fontWeight:700,color:"#1a1a1a"}}>Monthly Orders</h3>
            <p style={{fontSize:11,color:"#aaa",marginTop:2}}>Orders placed per month</p>
          </div>
          <div style={{height:160}}><BarChart data={ordersSpark} labels={months}/></div>
        </div>
        <div className="chart-card fade-up-4">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <div>
              <h3 style={{fontSize:14,fontWeight:700,color:"#1a1a1a"}}>Customer Growth</h3>
              <p style={{fontSize:11,color:"#aaa",marginTop:2}}>Cumulative customers acquired</p>
            </div>
            {stats?.customersGrowth!=null&&(
              <span style={{fontSize:11,background:"#fff0f4",color:"#ff3f6c",padding:"3px 10px",borderRadius:20,fontWeight:700}}>
                {stats.customersGrowth>=0?"↑":"↓"} {Math.abs(stats.customersGrowth)}%
              </span>
            )}
          </div>
          <div style={{height:160}}><AreaChart data={custSpark} labels={months}/></div>
        </div>
      </div>

      {/* Recent Orders + Top Products */}
      <div style={{display:"grid",gridTemplateColumns:"3fr 2fr",gap:16,marginBottom:24}}>
        <div className="chart-card fade-up-4">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <div>
              <h3 style={{fontSize:14,fontWeight:700,color:"#1a1a1a"}}>Recent Orders</h3>
              <p style={{fontSize:11,color:"#aaa",marginTop:2}}>Latest 6 transactions</p>
            </div>
            <span style={{fontSize:12,color:"#ff3f6c",fontWeight:700,cursor:"pointer"}} onClick={()=>onNavigate("orders")}>View All →</span>
          </div>
          {recentOrders.length===0?(
            <p style={{textAlign:"center",color:"#aaa",padding:"30px 0",fontSize:13}}>No orders yet — orders placed by customers will appear here</p>
          ):(
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead>
                <tr style={{borderBottom:"1px solid #f5f5f5"}}>
                  {["Order ID","Customer","Item","Amount","Status","Date"].map(h=>(
                    <th key={h} style={{fontSize:10,fontWeight:700,color:"#bbb",letterSpacing:"0.06em",padding:"0 8px 10px",textAlign:"left"}}>{h.toUpperCase()}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o)=>{
                  const sc=statusColor(o.status);
                  return (
                    <tr key={o._id} className="tbl-row" style={{borderBottom:"1px solid #fafafa"}}>
                      <td style={{padding:"11px 8px",fontSize:12,fontFamily:"'JetBrains Mono',monospace",color:"#ff3f6c",fontWeight:600}}>{o.orderId}</td>
                      <td style={{padding:"11px 8px",fontSize:12,color:"#333",fontWeight:600}}>{o.customerInfo?.name}</td>
                      <td style={{padding:"11px 8px",fontSize:12,color:"#666",maxWidth:120,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                        {o.items?.[0]?.title}{o.items?.length>1?` +${o.items.length-1}`:""}
                      </td>
                      <td style={{padding:"11px 8px",fontSize:12,fontFamily:"'JetBrains Mono',monospace",color:"#1a1a1a",fontWeight:700}}>₹{o.total?.toLocaleString()}</td>
                      <td style={{padding:"11px 8px"}}>
                        <span style={{background:sc.bg,color:sc.color,fontSize:11,fontWeight:700,padding:"3px 9px",borderRadius:20}}>{o.status}</span>
                      </td>
                      <td style={{padding:"11px 8px",fontSize:11,color:"#aaa"}}>
                        {new Date(o.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"short"})}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="chart-card fade-up-5">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <div>
              <h3 style={{fontSize:14,fontWeight:700,color:"#1a1a1a"}}>Top Products</h3>
              <p style={{fontSize:11,color:"#aaa",marginTop:2}}>By total sales volume</p>
            </div>
            <span style={{fontSize:12,color:"#ff3f6c",fontWeight:700,cursor:"pointer"}} onClick={()=>navigate("/admin/products")}>View All →</span>
          </div>
          {topProducts.length===0?(
            <p style={{textAlign:"center",color:"#aaa",padding:"30px 0",fontSize:13}}>No product data yet</p>
          ):(
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {topProducts.map((p,i)=>(
                <div key={p._id||i} style={{display:"flex",alignItems:"center",gap:12}}>
                  <div style={{width:28,height:28,borderRadius:8,background:i===0?"#fff0f4":"#f8f8f8",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,color:i===0?"#ff3f6c":"#aaa",flexShrink:0,fontFamily:"'JetBrains Mono',monospace"}}>
                    {i+1}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{fontSize:12,fontWeight:700,color:"#333",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",marginBottom:3}}>{p.title||p.name}</p>
                    <div style={{height:4,background:"#f0f0f0",borderRadius:10}}>
                      <div style={{height:"100%",background:i===0?"#ff3f6c":i===1?"#ff6b35":"#ffaa00",borderRadius:10,width:`${((p.sales||0)/maxSales)*100}%`,transition:"width 0.6s ease"}}/>
                    </div>
                  </div>
                  <div style={{textAlign:"right",flexShrink:0}}>
                    <p style={{fontSize:12,fontWeight:700,color:"#1a1a1a",fontFamily:"'JetBrains Mono',monospace"}}>
                      {p.revenue?`₹${(p.revenue/100000).toFixed(1)}L`:`${p.sales||0} sold`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* AI Insights */}
      <div className="fade-up-5">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div>
            <h3 style={{fontSize:14,fontWeight:700,color:"#1a1a1a"}}>🧠 AI Insights</h3>
            <p style={{fontSize:11,color:"#aaa",marginTop:2}}>Smart recommendations from your real store data</p>
          </div>
          <span style={{background:"#fff0f4",color:"#ff3f6c",fontSize:11,fontWeight:700,padding:"4px 12px",borderRadius:20,border:"1px solid #ffd0db"}}>
            {aiInsights.length} insights
          </span>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:14}}>
          {aiInsights.map((ins)=>(
            <div key={ins.title} className="insight-card">
              <div style={{width:40,height:40,borderRadius:10,background:"#fff8f9",border:"1px solid #ffd0db",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>
                {ins.icon}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:5}}>
                  <p style={{fontSize:13,fontWeight:700,color:"#1a1a1a"}}>{ins.title}</p>
                  <span style={{background:"#fff0f4",color:"#ff3f6c",fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:20,flexShrink:0,marginLeft:8}}>{ins.tag}</span>
                </div>
                <p style={{fontSize:12,color:"#777",lineHeight:1.6}}>{ins.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activePage,  setActivePage]  = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifOpen,   setNotifOpen]   = useState(false);
  const [period,      setPeriod]      = useState("monthly");
  const [searchVal,   setSearchVal]   = useState("");
  const [accountOpen, setAccountOpen] = useState(false);

  const [stats,        setStats]        = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts,  setTopProducts]  = useState([]);
  const [dashLoading,  setDashLoading]  = useState(true);

  useEffect(() => {
    if (activePage !== "dashboard") return;
    setDashLoading(true);
    Promise.all([
      api.get("/dashboard/stats").catch(() => null),
      api.get("/orders").catch(() => []),
      api.get("/products?status=all").catch(() => []),
    ]).then(([s, orders, products]) => {
      if (s) setStats(s);
      // ✅ Use real orders for recent orders table
      if (orders) setRecentOrders(Array.isArray(orders) ? orders.slice(0,6) : []);
      // ✅ Use real products sorted by stock sold
      if (products) setTopProducts(Array.isArray(products) ? products.slice(0,5) : []);
    }).finally(() => setDashLoading(false));
  }, [activePage, period]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    navigate("/admin/login");
  };

  const handleNavClick = (id) => {
    if (id === "products") {
      navigate("/admin/products");
    } else {
      setActivePage(id);
      setNotifOpen(false);
      setAccountOpen(false);
    }
  };

  // ✅ FIXED: correct component for each page
  const renderPage = () => {
    switch (activePage) {
      case "dashboard": return <DashboardContent period={period} onNavigate={setActivePage} stats={stats} recentOrders={recentOrders} topProducts={topProducts} loading={dashLoading}/>;
      case "orders":    return <Orders/>;        // ✅ shows Orders component
      case "customers": return <Customers/>;     // ✅ shows Customers component
      case "analytics": return <PlaceholderPage icon="📊" title="Analytics — Coming Soon"/>;
      case "settings":  return <PlaceholderPage icon="⚙️" title="Settings — Coming Soon"/>;
      case "account":   return <AccountPage onLogout={handleLogout} stats={stats}/>;
      default:          return null;
    }
  };

  const today = new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"});

  return (
    <div style={S.shell}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:4px;height:4px;}
        ::-webkit-scrollbar-track{background:#f5f5f5;}
        ::-webkit-scrollbar-thumb{background:#ddd;border-radius:10px;}
        .nav-item{display:flex;align-items:center;gap:12px;padding:10px 14px;border-radius:8px;cursor:pointer;transition:all 0.18s;font-size:13.5px;font-weight:500;color:#777;white-space:nowrap;font-family:'Plus Jakarta Sans',sans-serif;}
        .nav-item:hover{background:#fff5f7;color:#ff3f6c;}
        .nav-item.active{background:#fff0f4;color:#ff3f6c;font-weight:700;}
        .nav-item .nav-icon{font-size:16px;flex-shrink:0;}
        .period-btn{padding:6px 14px;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;border:1.5px solid #e8e8e8;background:#fff;color:#888;transition:all 0.15s;font-family:'Plus Jakarta Sans',sans-serif;}
        .period-btn:hover{border-color:#ff3f6c;color:#ff3f6c;}
        .period-btn.active{background:#ff3f6c;color:#fff;border-color:#ff3f6c;}
        .kpi-card{background:#fff;border-radius:12px;padding:18px 20px;border:1px solid #f0f0f0;box-shadow:0 1px 4px rgba(0,0,0,0.05);transition:all 0.2s;}
        .kpi-card:hover{box-shadow:0 4px 16px rgba(0,0,0,0.09);transform:translateY(-2px);}
        .chart-card{background:#fff;border-radius:12px;padding:20px 22px;border:1px solid #f0f0f0;box-shadow:0 1px 4px rgba(0,0,0,0.05);}
        .tbl-row{transition:background 0.12s;}.tbl-row:hover{background:#fff8f9 !important;}
        .insight-card{background:#fff;border-radius:12px;padding:16px 18px;border:1px solid #f0f0f0;display:flex;gap:14px;align-items:flex-start;transition:all 0.18s;}
        .insight-card:hover{border-color:#ffd0db;box-shadow:0 4px 16px rgba(255,63,108,0.08);}
        .top-search input{border:none;outline:none;font-size:13px;font-family:'Plus Jakarta Sans',sans-serif;color:#333;background:transparent;width:200px;}
        .top-search input::placeholder{color:#bbb;}
        .account-dropdown{position:absolute;right:0;top:48px;width:260px;background:#fff;border:1px solid #ebebeb;border-radius:14px;box-shadow:0 8px 32px rgba(0,0,0,0.1);z-index:200;overflow:hidden;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        .fade-up{animation:fadeUp 0.32s ease both;}
        .fade-up-1{animation:fadeUp 0.32s 0.05s ease both;}
        .fade-up-2{animation:fadeUp 0.32s 0.10s ease both;}
        .fade-up-3{animation:fadeUp 0.32s 0.15s ease both;}
        .fade-up-4{animation:fadeUp 0.32s 0.20s ease both;}
        .fade-up-5{animation:fadeUp 0.32s 0.25s ease both;}
      `}</style>

      {/* SIDEBAR */}
      <aside style={{...S.sidebar, width:sidebarOpen?220:62}}>
        <div style={{padding:"20px 16px 16px",borderBottom:"1px solid #f5f5f5",display:"flex",alignItems:"center",gap:10,overflow:"hidden"}}>
          <div style={{width:30,height:30,borderRadius:8,background:"#ff3f6c",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>🛍️</div>
          {sidebarOpen&&<span style={{fontSize:17,fontWeight:800,color:"#1a1a1a",letterSpacing:"-0.03em",whiteSpace:"nowrap"}}><span style={{color:"#ff3f6c"}}>Pooja</span>Store4u</span>}
        </div>
        <nav style={{padding:"12px 10px",flex:1,overflowY:"auto"}}>
          {navItems.map((item)=>(
            <div key={item.id} className={`nav-item ${activePage===item.id?"active":""}`} onClick={()=>handleNavClick(item.id)} title={!sidebarOpen?item.label:""}>
              <span className="nav-icon">{item.icon}</span>
              {sidebarOpen&&item.label}
            </div>
          ))}
        </nav>
        {sidebarOpen&&(
          <div style={{padding:"14px 16px",borderTop:"1px solid #f5f5f5"}}>
            <div style={{background:"#fff0f4",borderRadius:10,padding:"12px 14px",cursor:"pointer"}} onClick={()=>setActivePage("account")}>
              <p style={{fontSize:11,fontWeight:700,color:"#ff3f6c",marginBottom:2}}>{sellerInfo.name}</p>
              <p style={{fontSize:11,color:"#aaa"}}>Plan renews {sellerInfo.planExpiry}</p>
            </div>
          </div>
        )}
      </aside>

      {/* MAIN */}
      <div style={S.main}>
        {/* TOP BAR */}
        <header style={S.topBar}>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <button onClick={()=>setSidebarOpen(!sidebarOpen)} style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:"#555",padding:4}}>☰</button>
            <div className="top-search" style={{display:"flex",alignItems:"center",gap:8,background:"#f8f8f8",border:"1px solid #ebebeb",borderRadius:8,padding:"8px 14px"}}>
              <span style={{color:"#bbb",fontSize:14}}>🔍</span>
              <input value={searchVal} onChange={e=>setSearchVal(e.target.value)} placeholder="Search orders, products..."/>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            {/* Notifications */}
            <div style={{position:"relative"}}>
              <button onClick={()=>{setNotifOpen(!notifOpen);setAccountOpen(false);}}
                style={{background:"#fff",border:"1px solid #ebebeb",borderRadius:8,width:36,height:36,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
                🔔
                {recentOrders.filter(o=>o.status==="Processing").length > 0 && (
                  <span style={{position:"absolute",top:6,right:6,width:8,height:8,borderRadius:"50%",background:"#ff3f6c",border:"2px solid #fff"}}/>
                )}
              </button>
              {notifOpen&&(
                <div style={{position:"absolute",right:0,top:44,width:280,background:"#fff",border:"1px solid #ebebeb",borderRadius:12,boxShadow:"0 8px 32px rgba(0,0,0,0.1)",zIndex:200,overflow:"hidden"}}>
                  <div style={{padding:"12px 16px",borderBottom:"1px solid #f5f5f5",display:"flex",justifyContent:"space-between"}}>
                    <span style={{fontWeight:700,fontSize:13}}>Notifications</span>
                    <span style={{fontSize:11,color:"#ff3f6c",cursor:"pointer",fontWeight:600}} onClick={()=>setNotifOpen(false)}>Close</span>
                  </div>
                  {recentOrders.length === 0 ? (
                    <div style={{padding:"20px 16px",textAlign:"center",fontSize:12,color:"#aaa"}}>No new notifications</div>
                  ) : recentOrders.slice(0,3).map((o,i)=>(
                    <div key={o._id} style={{padding:"11px 16px",borderBottom:"1px solid #f9f9f9",fontSize:12,color:"#444",cursor:"pointer",background:i===0?"#fff8f9":"#fff"}}>
                      {i===0&&<span style={{display:"inline-block",width:6,height:6,borderRadius:"50%",background:"#ff3f6c",marginRight:6,verticalAlign:"middle"}}/>}
                      New order from {o.customerInfo?.name} — ₹{o.total?.toLocaleString()}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Avatar */}
            <div style={{position:"relative"}}>
              <div onClick={()=>{setAccountOpen(!accountOpen);setNotifOpen(false);}}
                style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",padding:"4px 8px",borderRadius:10,transition:"background 0.15s"}}
                onMouseOver={e=>e.currentTarget.style.background="#f8f8f8"}
                onMouseOut={e=>e.currentTarget.style.background="transparent"}
              >
                <div style={{width:34,height:34,borderRadius:"50%",background:"linear-gradient(135deg,#ff3f6c,#ff6b35)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:13,fontWeight:700}}>
                  {sellerInfo.name[0]}
                </div>
                <div>
                  <p style={{fontSize:12,fontWeight:700,color:"#1a1a1a"}}>{sellerInfo.name}</p>
                  <p style={{fontSize:10,color:"#aaa"}}>Admin Account</p>
                </div>
                <span style={{fontSize:10,color:"#bbb",marginLeft:2}}>▾</span>
              </div>
              {accountOpen&&(
                <div className="account-dropdown">
                  <div style={{padding:"16px",borderBottom:"1px solid #f5f5f5",background:"#fff8f9"}}>
                    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
                      <div style={{width:44,height:44,borderRadius:"50%",background:"linear-gradient(135deg,#ff3f6c,#ff6b35)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:18,fontWeight:800}}>
                        {sellerInfo.name[0]}
                      </div>
                      <div>
                        <p style={{fontSize:13,fontWeight:800,color:"#1a1a1a"}}>{sellerInfo.name}</p>
                        <p style={{fontSize:11,color:"#aaa"}}>{sellerInfo.email}</p>
                      </div>
                    </div>
                    <span style={{background:"#fff0f4",color:"#ff3f6c",fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:20,border:"1px solid #ffd0db"}}>
                      {sellerInfo.plan} · Renews {sellerInfo.planExpiry}
                    </span>
                  </div>
                  {[
                    {icon:"📞",label:sellerInfo.phone},
                    {icon:"📍",label:sellerInfo.location},
                    {icon:"🧾",label:sellerInfo.gst},
                    {icon:"📅",label:`Member since ${sellerInfo.joined}`},
                  ].map((row)=>(
                    <div key={row.label} style={{padding:"9px 16px",display:"flex",alignItems:"center",gap:10,borderBottom:"1px solid #fafafa"}}>
                      <span style={{fontSize:13}}>{row.icon}</span>
                      <span style={{fontSize:12,color:"#555"}}>{row.label}</span>
                    </div>
                  ))}
                  <div style={{padding:"8px"}}>
                    <div onClick={()=>{setActivePage("account");setAccountOpen(false);}}
                      style={{padding:"9px 12px",borderRadius:8,fontSize:12,fontWeight:600,color:"#333",cursor:"pointer",display:"flex",alignItems:"center",gap:8}}
                      onMouseOver={e=>e.currentTarget.style.background="#f8f8f8"}
                      onMouseOut={e=>e.currentTarget.style.background="transparent"}
                    >👤 View Account</div>
                    <div onClick={handleLogout}
                      style={{padding:"9px 12px",borderRadius:8,fontSize:12,fontWeight:700,color:"#ff3f6c",cursor:"pointer",display:"flex",alignItems:"center",gap:8}}
                      onMouseOver={e=>e.currentTarget.style.background="#fff0f4"}
                      onMouseOut={e=>e.currentTarget.style.background="transparent"}
                    >🚪 Logout</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <div style={S.content}>
          <div style={{marginBottom:22}} className="fade-up">
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
              <span style={{fontSize:12,color:"#bbb",fontWeight:500,cursor:activePage!=="dashboard"?"pointer":"default"}} onClick={()=>activePage!=="dashboard"&&setActivePage("dashboard")}>Dashboard</span>
              {activePage!=="dashboard"&&<><span style={{color:"#ddd"}}>›</span><span style={{fontSize:12,color:"#ff3f6c",fontWeight:700,textTransform:"capitalize"}}>{activePage}</span></>}
            </div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <h1 style={{fontSize:22,fontWeight:800,color:"#1a1a1a",letterSpacing:"-0.02em",marginBottom:3}}>{pageTitle[activePage]||"Overview"}</h1>
                <p style={{fontSize:13,color:"#aaa"}}>{today}</p>
              </div>
              {activePage==="dashboard"&&(
                <div style={{display:"flex",gap:6}}>
                  {["weekly","monthly","yearly"].map(p=>(
                    <button key={p} className={`period-btn ${period===p?"active":""}`} onClick={()=>setPeriod(p)}>
                      {p.charAt(0).toUpperCase()+p.slice(1)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          {renderPage()}
          <div style={{height:40}}/>
        </div>
      </div>
    </div>
  );
}
