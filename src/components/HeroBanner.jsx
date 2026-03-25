import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay, Pagination, Navigation } from "swiper/modules"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"

import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"

const slides = [
  {
    id: 1,
    title: "Latest Electronics",
    subtitle: "Upgrade Your Tech Today",
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600",
    link: "/category/Electronics",
  },
  {
    id: 2,
    title: "Fashion Collection 2026",
    subtitle: "Trendy Styles Just Arrived",
    image:
      "https://images.unsplash.com/photo-1445205170230-053b83016050",
    link: "/category/Fashion",
  },
  {
    id: 3,
    title: "Home & Kitchen Deals",
    subtitle: "Make Your Home Beautiful",
    image:
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511",
    link: "/category/Home & Kitchen",
  },
]

function HeroBanner() {
  return (
    <section className="w-full">

      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        autoplay={{ delay: 4000 }}
        pagination={{ clickable: true }}
        navigation
        loop
        className="h-[420px] md:h-[520px]"
      >

        {slides.map((slide) => (

          <SwiperSlide key={slide.id}>

            <div className="relative w-full h-full">

              {/* BACKGROUND IMAGE */}

              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />

              {/* OVERLAY */}

              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/10"></div>

              {/* CONTENT */}

              <div className="absolute inset-0 flex items-center">

                <div className="max-w-7xl mx-auto px-6">

                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-white max-w-xl"
                  >

                    <h1 className="text-3xl md:text-5xl font-bold mb-4">
                      {slide.title}
                    </h1>

                    <p className="text-lg md:text-xl mb-6 text-gray-200">
                      {slide.subtitle}
                    </p>

                    <Link to={slide.link}>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-white text-black px-6 py-3 rounded-full font-medium shadow-soft"
                      >

                        Shop Now

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

export default HeroBanner