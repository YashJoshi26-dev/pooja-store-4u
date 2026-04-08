import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, saveAdminSession } from "../../api/api";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }
    setLoading(true);
    try {
      const data = await api.post("/auth/admin/login", { email, password });
      saveAdminSession(data.token, {
        _id: data._id, name: data.name, email: data.email,
        store: data.store, plan: data.plan,
      });
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center",
      background:"linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#0f172a 100%)",
      fontFamily:"'Plus Jakarta Sans',sans-serif", padding:"20px",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        .login-card { animation:fadeUp 0.4s ease both; }
        .login-input { width:100%; background:rgba(255,255,255,0.07); border:1.5px solid rgba(255,255,255,0.12); border-radius:10px; padding:13px 16px; color:#fff; font-size:14px; font-family:'Plus Jakarta Sans',sans-serif; outline:none; transition:border-color 0.2s; box-sizing:border-box; }
        .login-input:focus { border-color:#ff3f6c; background:rgba(255,255,255,0.1); }
        .login-input::placeholder { color:rgba(255,255,255,0.35); }
        .login-btn { width:100%; background:#ff3f6c; color:#fff; border:none; border-radius:10px; padding:14px; font-size:15px; font-weight:700; cursor:pointer; font-family:'Plus Jakarta Sans',sans-serif; transition:all 0.2s; }
        .login-btn:hover:not(:disabled) { background:#e6325a; transform:translateY(-1px); box-shadow:0 6px 20px rgba(255,63,108,0.4); }
        .login-btn:disabled { background:#666; cursor:not-allowed; transform:none; }
      `}</style>

      <div className="login-card" style={{
        background:"rgba(255,255,255,0.05)", backdropFilter:"blur(20px)",
        border:"1px solid rgba(255,255,255,0.1)", borderRadius:20,
        padding:"40px 36px", width:"100%", maxWidth:420,
        boxShadow:"0 25px 60px rgba(0,0,0,0.4)",
      }}>
        {/* Logo */}
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{width:52,height:52,borderRadius:14,background:"#ff3f6c",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,margin:"0 auto 16px"}}>🛍️</div>
          <h1 style={{fontSize:22,fontWeight:800,color:"#fff",marginBottom:6,letterSpacing:"-0.02em"}}>
            <span style={{color:"#ff3f6c"}}>Pooja</span>Store4u
          </h1>
          <p style={{fontSize:13,color:"rgba(255,255,255,0.45)",fontWeight:500}}>Admin Panel — Sign in to continue</p>
        </div>

        {/* Error */}
        {error && (
          <div style={{background:"rgba(255,63,108,0.15)",border:"1px solid rgba(255,63,108,0.3)",borderRadius:10,padding:"12px 16px",marginBottom:20,display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:16}}>⚠️</span>
            <p style={{fontSize:13,color:"#ff6b8a",fontWeight:600,margin:0}}>{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} style={{display:"flex",flexDirection:"column",gap:16}}>
          <div>
            <label style={{display:"block",fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.5)",letterSpacing:"0.08em",marginBottom:8}}>EMAIL ADDRESS</label>
            <input className="login-input" type="email" placeholder="admin@test.com" value={email} onChange={(e)=>setEmail(e.target.value)} disabled={loading}/>
          </div>
          <div>
            <label style={{display:"block",fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.5)",letterSpacing:"0.08em",marginBottom:8}}>PASSWORD</label>
            <div style={{position:"relative"}}>
              <input className="login-input" type={showPass?"text":"password"} placeholder="••••••••" value={password} onChange={(e)=>setPassword(e.target.value)} disabled={loading} style={{paddingRight:48}}/>
              <button type="button" onClick={()=>setShowPass(!showPass)} style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:16,color:"rgba(255,255,255,0.4)"}}>
                {showPass?"🙈":"👁️"}
              </button>
            </div>
          </div>
          <button className="login-btn" type="submit" disabled={loading} style={{marginTop:8}}>
            {loading ? "Signing in..." : "Sign In →"}
          </button>
        </form>

        <p style={{textAlign:"center",fontSize:12,color:"rgba(255,255,255,0.25)",marginTop:24}}>Authorized personnel only</p>
      </div>
    </div>
  );
}
