import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay, Pagination, Navigation } from "swiper/modules"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import puja from "../assets/puja.jpeg"

import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"

const slides = [
{
  id: 1,
  title: "Pujan Samagri",
  subtitle: "Trending Puja Essentials for Every Ritual",
  image: puja,
  link: "/category/Pujan%20Samagri",
  badge: "New Collection",
  cta: "Shop Now",
  accent: "#FF6B35",
  style: {
    width: "100%",
    maxWidth: "1400px",
    height: "450px",
    objectFit: "cover"
  }
},
  {
    id: 2,
    title: "Fashion Collection",
    subtitle: "Trendy Styles at Unbeatable Prices",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1400",
    link: "/category/Fashion",
    badge: "Trending Now",
    cta: "Explore →",
    accent: "#2874F0",
  },
  {
    id: 3,
    title: "Home & Kitchen Deals",
    subtitle: "Make Your Home Beautiful",
    image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1400",
    link: "/category/Home%20%26%20Kitchen%20Care",
    badge: "Best Deals",
    cta: "Shop Deals →",
    accent: "#388E3C",
  },
]

export default function HeroBanner() {
  return (
    <section className="w-full">
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        autoplay={{ delay: 4500, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        navigation
        loop
        className="h-[200px] sm:h-[300px] md:h-[400px] lg:h-[460px]"
      >
        {slides.map(slide => (
          <SwiperSlide key={slide.id}>
            <div className="relative w-full h-full">

              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />

              {/* gradient */}
              <div className="absolute inset-0"
                style={{ background: "rgba(0,0,0,0.45)" }}
              />

              {/* content */}
              <div className="absolute inset-0 flex items-center">
                <div className="w-full flex justify-center px-4">
                  <motion.div
                    key={slide.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center max-w-xs sm:max-w-md md:max-w-2xl"
                  >
                    {/* badge */}
                    <span
                      className="inline-block text-white text-[9px] sm:text-[11px] font-black px-2.5 py-1 rounded-sm mb-2 sm:mb-3 uppercase tracking-widest"
                      style={{ background: slide.accent }}
                    >
                      {slide.badge}
                    </span>

                    {/* title */}
                    <h1 className="text-xl sm:text-3xl md:text-5xl font-black text-white leading-tight mb-1 sm:mb-2 md:mb-3">
                      {slide.title}
                    </h1>

                    {/* subtitle */}
                    <p className="hidden sm:block text-xs sm:text-sm md:text-base text-gray-200 mb-3 md:mb-5 font-medium">
                      {slide.subtitle}
                    </p>

                    {/* CTA */}
                    <Link to={slide.link}>
                      <motion.button
                        whileHover={{ scale: 1.04, y: -1 }}
                        whileTap={{ scale: 0.97 }}
                        className="text-gray-900 text-xs sm:text-sm font-black px-4 sm:px-6 py-2 sm:py-2.5 rounded-sm shadow-lg transition-all"
                        style={{ background: "white" }}
                      >
                        {slide.cta}
                      </motion.button>
                    </Link>
                  </motion.div>
                </div>
              </div>

            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  )
}