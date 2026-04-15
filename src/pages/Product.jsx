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
  function ShareProduct({ title, image }) {
  const [copied, setCopied] = useState(false)
  const url = window.location.href

  const handleCopy = () => {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({
        title: title,
        text: `Check out this product: ${title}`,
        url: url,
      })
    } else {
      handleCopy() // fallback on desktop
    }
  }

  const shareOptions = [
    {
      label: "WhatsApp",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884"/>
        </svg>
      ),
      color: "#25D366",
      onClick: () => window.open(`https://wa.me/?text=${encodeURIComponent(title + " " + url)}`, "_blank"),
    },
    {
      label: "Facebook",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      color: "#1877F2",
      onClick: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank"),
    },
    
  ]

  return (
    <div className="pt-2">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Share this product</p>
      <div className="flex items-center gap-2 flex-wrap">

        {/* Social buttons */}
        {shareOptions.map(opt => (
          <button
            key={opt.label}
            onClick={opt.onClick}
            title={`Share on ${opt.label}`}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:border-gray-400 hover:shadow-sm transition-all"
          >
            <span style={{ color: opt.color }}>{opt.icon}</span>
            {opt.label}
          </button>
        ))}

        {/* Copy Link */}
        <button
          onClick={handleCopy}
          title="Copy link"
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition-all"
          style={{
            borderColor: copied ? "#22c55e" : "#e5e7eb",
            color:       copied ? "#22c55e" : "#6b7280",
            background:  copied ? "#f0fdf4" : "#fff",
          }}
        >
          {copied ? (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
              </svg>
              Copy Link
            </>
          )}
        </button>

        {/* Native Share — shows on mobile */}
        {typeof navigator !== "undefined" && navigator.share && (
          <button
            onClick={handleNativeShare}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:border-gray-400 hover:shadow-sm transition-all"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
            More
          </button>
        )}

      </div>
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
      (!selectedVariant.size || v.size === selectedVariant.size) &&
      (!selectedVariant.color || v.color === selectedVariant.color) &&
      (!selectedVariant.design || v.design === selectedVariant.design)
    )
  }

  const matchedVariant = getMatchedVariant()
  const hasVariantSelected = selectedVariant && Object.values(selectedVariant).some(v => v !== "" && v != null)
  const currentPrice = (hasVariantSelected && matchedVariant?.price) ? matchedVariant.price : product.price
  const currentMrp = (hasVariantSelected && matchedVariant?.mrp) ? matchedVariant.mrp : product.oldPrice
  const currentStock = (hasVariantSelected && matchedVariant) ? matchedVariant.stock : product.stock

  return (
    <div className="max-w-7xl mx-auto px-3 py-4 md:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">

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
                <img src={img} alt="product" className="w-full h-[260px] sm:h-[360px] lg:h-[420px] object-cover" />              </SwiperSlide>
            ))}
          </Swiper>

          <Swiper onSwiper={setThumbsSwiper} spaceBetween={10} slidesPerView={4} className="mt-4">
            {images.map((img, index) => (
              <SwiperSlide key={index}>
                <img src={img} alt="thumb" className="h-16 sm:h-24 w-full object-cover rounded-lg cursor-pointer" />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* PRODUCT INFO */}
        <div className="space-y-6">

          <h1 className="text-lg sm:text-2xl font-bold">{product.title}</h1>

          {/* RATING */}
          <div className="flex items-center gap-2 text-yellow-500">
            {"★".repeat(Math.floor(product.rating))}
            {"☆".repeat(5 - Math.floor(product.rating))}
            <span className="text-gray-500 text-sm ml-2">({product.reviews} reviews)</span>
          </div>

          {/* PRICE */}
          <span className="text-2xl sm:text-3xl font-bold">₹{currentPrice}</span>
          {currentMrp && currentMrp > currentPrice && (
            <span className="line-through text-gray-400">₹{currentMrp}</span>
          )}

          {/* VARIANTS */}
          {product.variants?.length > 0 && (
            <div className="space-y-3">
              {[...new Set(product.variants.map(v => v.size).filter(Boolean))].length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-2">Size</p>
                  <div className="flex gap-2 flex-wrap">
                    {[...new Set(product.variants.map(v => v.size).filter(Boolean))].map(s => (
                      <button key={s}
                        onClick={() => setSelectedVariant(v => ({ ...v, size: v?.size === s ? "" : s }))}
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
                        onClick={() => setSelectedVariant(v => ({ ...v, color: v?.color === c ? "" : c }))}
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
                        onClick={() => setSelectedVariant(v => ({ ...v, design: v?.design === d ? "" : d }))}
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
          <div className="flex gap-3 flex-wrap w-full">
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

{/* SHARE */}
          <ShareProduct title={product.title} image={product.image || product.images?.[0]} />
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
              {/* {product.weight && <li>Weight: {product.weight} kg</li>} */}
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