import { FaWhatsapp, FaInstagram, FaFacebookF, FaLinkedinIn } from "react-icons/fa"

const PHONE = "919876543210" // ✅ replace with your WhatsApp number
const SOCIALS = [
  {
    icon: <FaWhatsapp size={18}/>,
    href: `https://wa.me/${PHONE}`,
    bg:   "bg-green-500 hover:bg-green-600",
    label:"WhatsApp",
  },
  {
    icon: <FaInstagram size={18}/>,
    href: "https://instagram.com/",
    bg:   "bg-gradient-to-b from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600",
    label:"Instagram",
  },
  {
    icon: <FaFacebookF size={18}/>,
    href: "https://facebook.com/YOUR_PAGE",
    bg:   "bg-blue-600 hover:bg-blue-700",
    label:"Facebook",
  },
]

export default function SocialSidebar() {
  return (
    <div className="fixed left-0 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-1">
  {SOCIALS.map((s) => (
    <a
      key={s.label}
          href={s.href}
          target="_blank"
          rel="noopener noreferrer"
          title={s.label}
          className={`
            group flex items-center overflow-hidden
            ${s.bg} text-white
            w-10 hover:w-28 transition-all duration-300
            rounded-r-xl shadow-lg
          `}
        >
          <span className="w-10 h-10 flex items-center justify-center flex-shrink-0">
            {s.icon}
          </span>
          <span className="text-xs font-semibold pr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            {s.label}
          </span>
        </a>
      ))}
    </div>
  )
}