import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FaWhatsapp, FaInstagram, FaFacebookF, FaYoutube } from "react-icons/fa"
import { FiShare2, FiX } from "react-icons/fi"

const SOCIALS = [
  { icon: <FaWhatsapp size={18}/>,  href: "https://whatsapp.com/channel/0029VajCR73IN9imWUvSMr46",              bg: "#25D366", label: "WhatsApp" },
  { icon: <FaInstagram size={18}/>, href: "https://www.instagram.com/poojastore4u?igsh=bTI0ZGp3a2g3c2s2",       bg: "#E1306C", label: "Instagram" },
  { icon: <FaFacebookF size={18}/>, href: "https://www.facebook.com/profile.php?id=100085843568595",            bg: "#1877F2", label: "Facebook" },
  { icon: <FaYoutube size={18}/>,   href: "https://youtube.com/@poojastore4u?si=S2MQf-vrrz4799rt",              bg: "#FF0000", label: "YouTube" },
]

export default function SocialSidebar() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* ── DESKTOP: left expandable sidebar ── */}
      <div className="hidden md:flex fixed left-0 top-1/2 -translate-y-1/2 z-50 flex-col gap-1.5">
        {SOCIALS.map(s => (
          <motion.a
            key={s.label}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            title={s.label}
            initial={{ x: -4, opacity: 0.85 }}
            whileHover={{ x: 0, opacity: 1 }}
            className="group flex items-center overflow-hidden text-white rounded-r-xl shadow-md"
            style={{ background: s.bg, width: 40 }}
            onMouseEnter={e => e.currentTarget.style.width = "120px"}
            onMouseLeave={e => e.currentTarget.style.width = "40px"}
            // Use inline transition instead of Tailwind to avoid conflict
          >
            <span
              className="w-10 h-10 flex-shrink-0 flex items-center justify-center"
              style={{ transition: "width 0.3s ease" }}
            >
              {s.icon}
            </span>
            <span className="text-xs font-bold pr-3 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {s.label}
            </span>
          </motion.a>
        ))}
      </div>

      {/* ── MOBILE: FAB + radial menu ── */}
      <div className="md:hidden fixed bottom-20 right-4 z-50 flex flex-col items-end gap-2">

        {/* Expanded icons */}
        <AnimatePresence>
          {open && (
            <>
              {[...SOCIALS].reverse().map((s, i) => (
                <motion.a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, scale: 0.5, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.5, y: 10 }}
                  transition={{ delay: i * 0.05, type: "spring", stiffness: 300 }}
                  className="w-11 h-11 rounded-full flex items-center justify-center text-white shadow-xl"
                  style={{ background: s.bg }}
                  title={s.label}
                >
                  {s.icon}
                </motion.a>
              ))}
            </>
          )}
        </AnimatePresence>

        {/* FAB toggle */}
        <motion.button
          onClick={() => setOpen(o => !o)}
          whileTap={{ scale: 0.9 }}
          animate={{ rotate: open ? 45 : 0 }}
          className="w-13 h-13 rounded-full flex items-center justify-center text-white shadow-2xl"
          style={{ background: open ? "#666" : "#25D366", width: 52, height: 52 }}
        >
          {open ? <FiX size={22}/> : <FiShare2 size={20}/>}
        </motion.button>
      </div>

      {/* ── MOBILE: bottom social bar ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg flex justify-around items-center h-14 px-4">
        {SOCIALS.map(s => (
          <a
            key={s.label}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-0.5 active:scale-90 transition-transform"
          >
            <span className="w-8 h-8 rounded-full flex items-center justify-center text-white"
              style={{ background: s.bg }}>
              {s.icon}
            </span>
          </a>
        ))}
      </div>
    </>
  )
}