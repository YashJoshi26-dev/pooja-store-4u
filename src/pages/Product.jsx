import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Thumbs } from "swiper/modules"

import { getProductById } from "../api/productApi"
import { useCart } from "../Context/CartContext"

import "swiper/css"
import "swiper/css/navigation"

function Product() {

  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [thumbsSwiper, setThumbsSwiper] = useState(null)
  const [selectedVariant, setSelectedVariant] = useState(null)

  const { addToCart, buyNow } = useCart()
  const navigate = useNavigate()

  useEffect(() => {
    async function loadProduct() {
      const data = await getProductById(id)
      setProduct(data)
    }
    loadProduct()
  }, [id])

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto p-10">
        Loading...
      </div>
    )
  }

  const images = product.images?.length > 0
    ? product.images
    : product.image
      ? [product.image]
      : ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"]

  const getMatchedVariant = () => {
    if (!product.variants?.length || !selectedVariant) return null
    return product.variants.find(v =>
      (!selectedVariant.size   || v.size   === selectedVariant.size)   &&
      (!selectedVariant.color  || v.color  === selectedVariant.color)  &&
      (!selectedVariant.design || v.design === selectedVariant.design)
    )
  }

  const matchedVariant = getMatchedVariant()
  const currentPrice   = matchedVariant?.price || product.price
  const currentStock   = matchedVariant ? matchedVariant.stock : product.stock

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid lg:grid-cols-2 gap-10">

        {/* PRODUCT GALLERY */}
        <div>
          <Swiper
            modules={[Navigation, Thumbs]}
            navigation
            thumbs={{ swiper: thumbsSwiper }}
            className="rounded-xl overflow-hidden"
          >
            {images.map((img, index) => (
              <SwiperSlide key={index}>
                <img src={img} alt="product" className="w-full h-[420px] object-cover" />
              </SwiperSlide>
            ))}
          </Swiper>

          <Swiper onSwiper={setThumbsSwiper} spaceBetween={10} slidesPerView={4} className="mt-4">
            {images.map((img, index) => (
              <SwiperSlide key={index}>
                <img src={img} alt="thumb" className="h-24 w-full object-cover rounded-lg cursor-pointer" />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* PRODUCT INFO */}
        <div className="space-y-6">

          <h1 className="text-2xl font-bold">{product.title}</h1>

          {/* RATING */}
          <div className="flex items-center gap-2 text-yellow-500">
            {"★".repeat(Math.floor(product.rating))}
            {"☆".repeat(5 - Math.floor(product.rating))}
            <span className="text-gray-500 text-sm ml-2">({product.reviews} reviews)</span>
          </div>

          {/* PRICE */}
          <div className="flex items-center gap-4">
            <span className="text-3xl font-bold">₹{currentPrice}</span>
            {product.oldPrice && (
              <span className="line-through text-gray-400">₹{product.oldPrice}</span>
            )}
          </div>

          {/* VARIANTS */}
          {product.variants?.length > 0 && (
            <div className="space-y-3">
              {[...new Set(product.variants.map(v => v.size).filter(Boolean))].length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-2">Size</p>
                  <div className="flex gap-2 flex-wrap">
                    {[...new Set(product.variants.map(v => v.size).filter(Boolean))].map(s => (
                      <button key={s}
                        onClick={() => setSelectedVariant(v => ({ ...v, size: s }))}
                        className={"px-3 py-1.5 rounded-lg border text-sm font-semibold transition " + (selectedVariant?.size === s ? "border-slate-900 bg-slate-900 text-white" : "border-gray-200 hover:border-slate-400")}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {[...new Set(product.variants.map(v => v.color).filter(Boolean))].length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-2">Color</p>
                  <div className="flex gap-2 flex-wrap">
                    {[...new Set(product.variants.map(v => v.color).filter(Boolean))].map(c => (
                      <button key={c}
                        onClick={() => setSelectedVariant(v => ({ ...v, color: c }))}
                        className={"px-3 py-1.5 rounded-lg border text-sm font-semibold transition " + (selectedVariant?.color === c ? "border-slate-900 bg-slate-900 text-white" : "border-gray-200 hover:border-slate-400")}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {[...new Set(product.variants.map(v => v.design).filter(Boolean))].length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-2">Design</p>
                  <div className="flex gap-2 flex-wrap">
                    {[...new Set(product.variants.map(v => v.design).filter(Boolean))].map(d => (
                      <button key={d}
                        onClick={() => setSelectedVariant(v => ({ ...v, design: d }))}
                        className={"px-3 py-1.5 rounded-lg border text-sm font-semibold transition " + (selectedVariant?.design === d ? "border-slate-900 bg-slate-900 text-white" : "border-gray-200 hover:border-slate-400")}>
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STOCK */}
          <div>
            {currentStock > 5 ? (
              <span className="text-green-600 font-semibold text-sm">✓ IN STOCK</span>
            ) : currentStock > 0 ? (
              <span className="text-orange-500 font-semibold text-sm">⚠ Only {currentStock} items left</span>
            ) : (
              <span className="text-red-600 font-semibold text-sm">✕ Out of Stock</span>
            )}
          </div>

          {/* QUANTITY */}
          <div className="flex items-center gap-4">
            <span className="font-medium">Quantity</span>
            <div className="flex items-center border rounded-lg">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2">-</button>
              <span className="px-4">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="px-3 py-2">+</button>
            </div>
          </div>

          {/* BUTTONS */}
          <div className="flex gap-4 flex-wrap">
            <button
              disabled={currentStock === 0}
              className={"px-6 py-3 rounded-lg font-semibold transition " + (currentStock === 0 ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-slate-900 text-white hover:bg-slate-800")}
              onClick={() => addToCart({ ...product, quantity, selectedVariant, price: currentPrice })}
            >
              Add to Cart
            </button>

            {currentStock > 0 ? (
              <button
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
                onClick={() => {
                  if (product.variants?.length > 0 && !selectedVariant) {
                    alert("Please select a variant first")
                    return
                  }
                  buyNow({ ...product, selectedVariant, price: currentPrice }, quantity)
                  navigate("/checkout")
                }}
              >
                Buy Now
              </button>
            ) : (
              <button
                className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition font-semibold"
                onClick={() => {
                  const contact = window.prompt("Enter your email or phone to get notified:")
                  if (contact && contact.trim()) {
                    alert("We will notify you at " + contact.trim() + " when back in stock!")
                  }
                }}
              >
                🔔 Notify Me
              </button>
            )}
          </div>

          {/* DESCRIPTION */}
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-gray-600 text-sm" style={{ whiteSpace: "pre-line" }}>
              {product.description}
            </p>
          </div>

          {/* SPECIFICATIONS */}
          <div>
            <h3 className="font-semibold mb-2">Specifications</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              {product.brand && <li>Brand: {product.brand}</li>}
              {product.weight && <li>Weight: {product.weight} kg</li>}
              {product.specifications?.warranty && <li>Warranty: {product.specifications.warranty}</li>}
            </ul>
          </div>

        </div>
      </div>

      {/* REVIEWS */}
      <div className="mt-16">
        <h2 className="text-xl font-bold mb-6">Customer Reviews</h2>
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <div className="text-yellow-500 mb-1">★★★★☆</div>
            <p className="text-sm text-gray-600">Great product, excellent quality and fast delivery.</p>
          </div>
          <div className="border rounded-lg p-4">
            <div className="text-yellow-500 mb-1">★★★★★</div>
            <p className="text-sm text-gray-600">Highly recommended. Worth the price.</p>
          </div>
        </div>
      </div>

    </div>
  )
}

export default Product