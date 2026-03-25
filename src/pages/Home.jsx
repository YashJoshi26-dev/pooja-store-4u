import { useEffect, useState } from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation } from "swiper/modules"
import { Link } from "react-router-dom"

import HeroBanner from "../components/HeroBanner"
import CategoryGrid from "../components/CategoryGrid"
import ProductCard from "../components/ProductCard"

import { getAllProducts } from "../api/productApi"

// ✅ Loading skeleton card
function SkeletonCard() {
  return (
    <div className="bg-white rounded-3xl shadow-md overflow-hidden animate-pulse">
      <div className="h-52 bg-gray-200" />
      <div className="p-4 flex flex-col gap-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="h-4 bg-gray-200 rounded w-1/3" />
        <div className="h-9 bg-gray-200 rounded-lg" />
      </div>
    </div>
  )
}

function Home() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)  // ✅ FIX: error state

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getAllProducts()
        setProducts(data)
      } catch (err) {
        setError("Failed to load products. Please try again.")
      } finally {
        setLoading(false)
      }
    }
    loadProducts()
  }, [])

  // ✅ FIX: Only slice when products are loaded
  const trending = products.slice(0, 12)
  const deals = products.slice(12, 20)
  const featured = products.slice(20, 32)

  // ✅ FIX: Error state UI
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <p className="text-red-500 font-medium">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-slate-900 text-white px-6 py-2 rounded-lg hover:bg-slate-800 transition"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div>

      {/* HERO BANNER */}
      <HeroBanner />

      {/* CATEGORY GRID */}
      <CategoryGrid />

      {/* TRENDING PRODUCTS */}
      <section className="container-main py-20">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Trending Products</h2>
          <Link to="/products" className="text-sm text-blue-600 hover:underline">
            View All →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <Swiper
            modules={[Navigation]}
            navigation
            spaceBetween={20}
            breakpoints={{
              320: { slidesPerView: 1.5 },
              640: { slidesPerView: 2 },
              768: { slidesPerView: 3 },
              1024: { slidesPerView: 4 },
            }}
          >
            {trending.map((product) => (
              <SwiperSlide key={product.id}>
                <ProductCard product={product} />
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </section>

      {/* BEST DEALS */}
      <section className="container-main py-20">
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-10">
          Best Deals
        </h2>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {deals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="container-main py-12">
        <h2 className="text-2xl font-bold mb-6">Featured Products</h2>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <Swiper
            modules={[Navigation]}
            navigation
            spaceBetween={20}
            breakpoints={{
              320: { slidesPerView: 1.2 },
              640: { slidesPerView: 2 },
              768: { slidesPerView: 3 },
              1024: { slidesPerView: 4 },
            }}
          >
            {featured.map((product) => (
              <SwiperSlide key={product.id}>
                <ProductCard product={product} />
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </section>

      {/* NEWSLETTER */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-4">Join Our Newsletter</h2>
          <p className="text-gray-300 mb-6">Get the latest deals and product updates</p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <input
              type="email"
              placeholder="Enter your email"
              className="px-4 py-3 rounded-lg text-black w-full md:w-80 outline-none"
            />
            <button className="bg-blue-600 px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium">
              Subscribe
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER — ✅ FIX: branding changed from ShopVerse to PoojaStore4u */}
      <footer className="bg-gray-100 py-10 mt-10">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold mb-3">PoojaStore4u</h3>
            <p className="text-sm text-gray-600">
              Premium modern eCommerce experience with the latest products.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Shop</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              {["Electronics", "Fashion", "Home & Kitchen", "Books"].map(c => (
                <li key={c}>
                  <Link to={`/category/${c}`} className="hover:text-blue-600 transition">{c}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Company</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>About</li>
              <li>Careers</li>
              <li>Contact</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Support</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>Help Center</li>
              <li>Returns</li>
              <li>Privacy</li>
            </ul>
          </div>
        </div>
        <div className="text-center text-sm text-gray-500 mt-10">
          © 2026 PoojaStore4u. All rights reserved.
        </div>
      </footer>

    </div>
  )
}

export default Home
