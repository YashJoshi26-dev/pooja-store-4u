import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Product from "./pages/Product";
import Category from "./pages/Category";
import Cart from "./pages/Cart";
import NotFound from "./pages/NotFound";


// ADMIN
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLogin from "./pages/admin/AdminLogin";
import Products from "./pages/admin/Products";
import AddProduct from "./pages/admin/AddProduct";

import ProtectedRoute from "./routes/ProtectedRoute";
import { CartProvider } from "./Context/CartContext";
import Checkout from "./pages/Checkout";
import AllProducts from "./pages/Allproducts";

function LayoutWrapper() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <>
      {!isAdminRoute && <Navbar />}

      <Routes>
        {/* USER ROUTES */}
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<Product />} />
        <Route path="/category/:name" element={<Category />} />
        <Route path="/cart" element={<Cart />} />


        {/* ADMIN ROUTES */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
        <Route path="/admin/add-product" element={<ProtectedRoute><AddProduct /></ProtectedRoute>} />
         <Route path="/checkout" element={<Checkout />} />
         <Route path="/products" element={<AllProducts />} />
        {/* ✅ 404 fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <CartProvider>
      <Router>
        <LayoutWrapper />
      </Router>
    </CartProvider>
  );
}

export default App;
