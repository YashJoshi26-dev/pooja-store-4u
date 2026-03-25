import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";

export default function AdminMobileDrawer({ open, setOpen }) {
  return (
    <>
      {open && (
        <motion.div
          initial={{ x: -250 }}
          animate={{ x: 0 }}
          className="fixed top-0 left-0 w-64 h-full glass p-4 z-50 md:hidden"
        >
          <button onClick={() => setOpen(false)}>Close</button>

          <nav className="mt-6 space-y-3">
            <NavLink to="/admin/dashboard">Dashboard</NavLink>
            <NavLink to="/admin/products">Products</NavLink>
          </nav>
        </motion.div>
      )}
    </>
  );
}