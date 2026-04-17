import React, { useEffect, useState, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Thumbs } from "swiper/modules"

import { getProductById } from "../api/productApi"
import { useCart } from "../Context/CartContext"

import "swiper/css"
import "swiper/css/navigation"

// ── Share component — defined OUTSIDE Product so no hook-order issues ─────────
function ShareProduct({ title }) {
  const [copied, setCopied] = useState(false)
  const url = window.location.href

  const handleCopy = () => {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({ title, text: `Check out this product: ${title}`, url })
    } else {
      handleCopy()
    }
  }

  const shareOptions = [
    {
      label: "WhatsApp",
      color: "#25D366",
      onClick: () => window.open(`https://wa.me/?text=${encodeURIComponent(title + " " + url)}`, "_blank"),
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884" />
        </svg>
      ),
    },
    {
      label: "Facebook",
      color: "#1877F2",
      onClick: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank"),
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
  ]

  return (
    <div className="pt-2">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Share this product</p>
      <div className="flex items-center gap-2 flex-wrap">
        {shareOptions.map(opt => (
          <button key={opt.label} onClick={opt.onClick}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:border-gray-400 hover:shadow-sm transition-all">
            <span style={{ color: opt.color }}>{opt.icon}</span>
            {opt.label}
          </button>
        ))}
        <button onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition-all"
          style={{ borderColor: copied ? "#22c55e" : "#e5e7eb", color: copied ? "#22c55e" : "#6b7280", background: copied ? "#f0fdf4" : "#fff" }}>
          {copied ? "✓ Copied!" : "Copy Link"}
        </button>
        {typeof navigator !== "undefined" && navigator.share && (
          <button onClick={handleNativeShare}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:border-gray-400 hover:shadow-sm transition-all">
            More
          </button>
        )}
      </div>
    </div>
  )
}

// ── Main Product component ────────────────────────────────────────────────────
function Product() {
  const { id }       = useParams()
  const navigate     = useNavigate()
  const { addToCart, buyNow } = useCart()

  const [product,       setProduct]       = useState(null)
  const [productError,  setProductError]  = useState(null)
  const [quantity,      setQuantity]      = useState(1)
  const [thumbsSwiper,  setThumbsSwiper]  = useState(null)
  const [swiperRef,     setSwiperRef]     = useState(null)
  const [selectedVariant, setSelectedVariant] = useState(null)

  const prevVariantRef = useRef(null)

  // ── Load product ────────────────────────────────────────────────────────────
  useEffect(() => {
    async function loadProduct() {
      try {
        const data = await getProductById(id)
        setProduct(data)
      } catch (err) {
        setProductError("Product not found or unavailable.")
      }
    }
    loadProduct()
  }, [id])

  // ── Error state ─────────────────────────────────────────────────────────────
  if (productError) {
    return (
      <div className="max-w-7xl mx-auto p-10 text-center">
        <div className="text-5xl mb-4">😕</div>
        <h2 className="text-xl font-bold text-gray-700 mb-2">Product Not Found</h2>
        <p className="text-gray-400 mb-6">{productError}</p>
        <button onClick={() => navigate("/")}
          className="bg-slate-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-slate-800 transition">
          Go to Home
        </button>
      </div>
    )
  }

  // ── Loading state ───────────────────────────────────────────────────────────
  if (!product) {
    return (
      <div className="max-w-7xl mx-auto p-10 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-400">Loading product...</p>
        </div>
      </div>
    )
  }

  // ── Variant matching ────────────────────────────────────────────────────────
  const getMatchedVariant = () => {
    if (!product.variants?.length || !selectedVariant) return null
    return product.variants.find(v =>
      (!selectedVariant.size   || v.size   === selectedVariant.size)   &&
      (!selectedVariant.color  || v.color  === selectedVariant.color)  &&
      (!selectedVariant.design || v.design === selectedVariant.design)
    )
  }

  const matchedVariant     = getMatchedVariant()
  const hasVariantSelected = selectedVariant && Object.values(selectedVariant).some(v => v !== "" && v != null)
  const currentPrice       = (hasVariantSelected && matchedVariant?.price) ? matchedVariant.price  : product.price
  const currentMrp         = (hasVariantSelected && matchedVariant?.mrp)   ? matchedVariant.mrp    : product.oldPrice
  const currentStock       = (hasVariantSelected && matchedVariant)        ? matchedVariant.stock  : product.stock

  // ── Images — show variant image when selected ───────────────────────────────
  const variantImage = matchedVariant?.image || null
  const images = variantImage
    ? [variantImage, ...(product.images || []).filter(img => img !== variantImage)]
    : product.images?.length > 0
      ? product.images
      : product.image
        ? [product.image]
        : ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"]

  // ── Reset swiper to first image when variant changes ────────────────────────
  if (swiperRef && matchedVariant?._id !== prevVariantRef.current) {
    swiperRef.slideTo(0)
    prevVariantRef.current = matchedVariant?._id
  }

  // ── Color dot map ───────────────────────────────────────────────────────────
  const cssColors = {
    red: "#e53935", blue: "#1e88e5", green: "#43a047", yellow: "#fdd835",
    black: "#212121", white: "#fafafa", pink: "#e91e63", purple: "#8e24aa",
    orange: "#fb8c00", grey: "#9e9e9e", gray: "#9e9e9e", brown: "#6d4c41",
    golden: "#f9a825", silver: "#bdbdbd",
  }

  return (
    <div className="max-w-7xl mx-auto px-3 py-4 md:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">

        {/* ── GALLERY ──────────────────────────────────────────────────────── */}
        <div>
          <Swiper
            modules={[Navigation, Thumbs]}
            navigation
            thumbs={{ swiper: thumbsSwiper }}
            onSwiper={setSwiperRef}
            className="rounded-xl overflow-hidden"
            style={{ background: "#f8f8f8", aspectRatio: "1/1" }}
          >
            {images.map((img, i) => (
              <SwiperSlide key={i}>
                <img src={img} alt="product"
                  style={{ width: "100%", height: "100%", objectFit: "contain", padding: 16 }}
                  onError={e => e.target.src = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"}
                />
              </SwiperSlide>
            ))}
          </Swiper>

          <Swiper onSwiper={setThumbsSwiper} spaceBetween={8} slidesPerView={4}
            className="mt-3" watchSlidesProgress>
            {images.map((img, i) => (
              <SwiperSlide key={i}>
                <div style={{
                  border: "2px solid #e0e0e0", borderRadius: 8, overflow: "hidden",
                  cursor: "pointer", aspectRatio: "1/1", background: "#f8f8f8",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }} className="hover:border-blue-400 transition-all">
                  <img src={img} alt={`thumb-${i}`}
                    style={{ width: "100%", height: "100%", objectFit: "contain", padding: 4 }}
                    onError={e => e.target.src = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"}
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* ── PRODUCT INFO ──────────────────────────────────────────────────── */}
        <div className="space-y-6">

          <h1 className="text-lg sm:text-2xl font-bold">{product.title}</h1>

          {/* Rating */}
          <div className="flex items-center gap-2 text-yellow-500">
            {"★".repeat(Math.floor(product.rating))}
            {"☆".repeat(5 - Math.floor(product.rating))}
            <span className="text-gray-500 text-sm ml-2">({product.reviews} reviews)</span>
          </div>

          {/* Price — updates per variant */}
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="text-2xl sm:text-3xl font-bold text-gray-900">
              ₹{currentPrice?.toLocaleString("en-IN")}
            </span>
            {currentMrp && currentMrp > currentPrice && (
              <>
                <span className="text-base text-gray-400 line-through">
                  ₹{currentMrp?.toLocaleString("en-IN")}
                </span>
                <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">
                  {Math.round(((currentMrp - currentPrice) / currentMrp) * 100)}% off
                </span>
              </>
            )}
          </div>
          {currentMrp && currentMrp > currentPrice && (
            <p className="text-xs text-gray-400 -mt-3">Inclusive of all taxes</p>
          )}

          {/* Variants — Flipkart style */}
          {product.variants?.length > 0 && (
            <div className="space-y-4 border-t border-b border-gray-100 py-4">

              {/* SIZE */}
              {[...new Set(product.variants.map(v => v.size).filter(Boolean))].length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-sm font-bold text-gray-800">Size</p>
                    {selectedVariant?.size && (
                      <span className="text-sm text-gray-500">: <strong>{selectedVariant.size}</strong></span>
                    )}
                    {selectedVariant?.size && (
                      <button onClick={() => setSelectedVariant(v => ({ ...v, size: "" }))}
                        className="ml-auto text-xs text-blue-500 hover:underline">Clear</button>
                    )}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {[...new Set(product.variants.map(v => v.size).filter(Boolean))].map(s => {
                      const vf = product.variants.find(v => v.size === s)
                      const isOutOfStock = vf?.stock === 0
                      const isSelected   = selectedVariant?.size === s
                      return (
                        <button key={s}
                          onClick={() => !isOutOfStock && setSelectedVariant(v => ({ ...v, size: v?.size === s ? "" : s }))}
                          disabled={isOutOfStock}
                          style={{
                            minWidth: 48, padding: "8px 14px", borderRadius: 4, position: "relative",
                            border: isSelected ? "2px solid #2874F0" : "1.5px solid #e0e0e0",
                            background: isSelected ? "#e8f0fe" : isOutOfStock ? "#f9f9f9" : "#fff",
                            color: isSelected ? "#2874F0" : isOutOfStock ? "#ccc" : "#333",
                            fontWeight: isSelected ? 700 : 500, fontSize: 13,
                            cursor: isOutOfStock ? "not-allowed" : "pointer", transition: "all 0.15s",
                          }}>
                          {s}
                          {isOutOfStock && (
                            <span style={{ position: "absolute", inset: 0, borderRadius: 4,
                              background: "repeating-linear-gradient(135deg,transparent,transparent 4px,rgba(0,0,0,0.07) 4px,rgba(0,0,0,0.07) 5px)" }} />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* COLOR */}
              {[...new Set(product.variants.map(v => v.color).filter(Boolean))].length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-sm font-bold text-gray-800">Color</p>
                    {selectedVariant?.color && (
                      <span className="text-sm text-gray-500">: <strong>{selectedVariant.color}</strong></span>
                    )}
                    {selectedVariant?.color && (
                      <button onClick={() => setSelectedVariant(v => ({ ...v, color: "" }))}
                        className="ml-auto text-xs text-blue-500 hover:underline">Clear</button>
                    )}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {[...new Set(product.variants.map(v => v.color).filter(Boolean))].map(c => {
                      const vf = product.variants.find(v => v.color === c)
                      const isOutOfStock = vf?.stock === 0
                      const isSelected   = selectedVariant?.color === c
                      const dotColor     = cssColors[c.toLowerCase()]
                      return (
                        <button key={c}
                          onClick={() => !isOutOfStock && setSelectedVariant(v => ({ ...v, color: v?.color === c ? "" : c }))}
                          disabled={isOutOfStock}
                          style={{
                            display: "flex", alignItems: "center", gap: 6,
                            padding: "7px 12px", borderRadius: 4,
                            border: isSelected ? "2px solid #2874F0" : "1.5px solid #e0e0e0",
                            background: isSelected ? "#e8f0fe" : "#fff",
                            color: isSelected ? "#2874F0" : isOutOfStock ? "#bbb" : "#333",
                            fontWeight: isSelected ? 700 : 500, fontSize: 13,
                            cursor: isOutOfStock ? "not-allowed" : "pointer",
                            opacity: isOutOfStock ? 0.5 : 1, transition: "all 0.15s",
                          }}>
                          {dotColor && (
                            <span style={{ width: 14, height: 14, borderRadius: "50%",
                              background: dotColor, border: "1px solid rgba(0,0,0,0.15)", flexShrink: 0 }} />
                          )}
                          {c}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* DESIGN */}
              {[...new Set(product.variants.map(v => v.design).filter(Boolean))].length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-sm font-bold text-gray-800">Design</p>
                    {selectedVariant?.design && (
                      <span className="text-sm text-gray-500">: <strong>{selectedVariant.design}</strong></span>
                    )}
                    {selectedVariant?.design && (
                      <button onClick={() => setSelectedVariant(v => ({ ...v, design: "" }))}
                        className="ml-auto text-xs text-blue-500 hover:underline">Clear</button>
                    )}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {[...new Set(product.variants.map(v => v.design).filter(Boolean))].map(d => {
                      const vf = product.variants.find(v => v.design === d)
                      const isOutOfStock = vf?.stock === 0
                      const isSelected   = selectedVariant?.design === d
                      return (
                        <button key={d}
                          onClick={() => !isOutOfStock && setSelectedVariant(v => ({ ...v, design: v?.design === d ? "" : d }))}
                          disabled={isOutOfStock}
                          style={{
                            padding: "7px 14px", borderRadius: 4, position: "relative",
                            border: isSelected ? "2px solid #2874F0" : "1.5px solid #e0e0e0",
                            background: isSelected ? "#e8f0fe" : isOutOfStock ? "#f9f9f9" : "#fff",
                            color: isSelected ? "#2874F0" : isOutOfStock ? "#ccc" : "#333",
                            fontWeight: isSelected ? 700 : 500, fontSize: 13,
                            cursor: isOutOfStock ? "not-allowed" : "pointer",
                            opacity: isOutOfStock ? 0.5 : 1, transition: "all 0.15s",
                          }}>
                          {d}
                          {isOutOfStock && (
                            <span style={{ position: "absolute", inset: 0, borderRadius: 4,
                              background: "repeating-linear-gradient(135deg,transparent,transparent 4px,rgba(0,0,0,0.07) 4px,rgba(0,0,0,0.07) 5px)" }} />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Warning */}
              {product.variants?.length > 0 && !matchedVariant && hasVariantSelected && (
                <p className="text-xs text-orange-500 font-semibold">
                  ⚠ Please select all options to see price and stock
                </p>
              )}
            </div>
          )}

          {/* Stock */}
          <div>
            {currentStock > 5 ? (
              <span className="text-green-600 font-semibold text-sm">✓ IN STOCK</span>
            ) : currentStock > 0 ? (
              <span className="text-orange-500 font-semibold text-sm">⚠ Only {currentStock} items left</span>
            ) : (
              <span className="text-red-600 font-semibold text-sm">✕ Out of Stock</span>
            )}
          </div>

          {/* Quantity */}
          <div className="flex items-center gap-4">
            <span className="font-medium">Quantity</span>
            <div className="flex items-center border rounded-lg">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2">-</button>
              <span className="px-4">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="px-3 py-2">+</button>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 flex-wrap w-full">
            <button
              disabled={currentStock === 0}
              className={"px-6 py-3 rounded-lg font-semibold transition " +
                (currentStock === 0 ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-slate-900 text-white hover:bg-slate-800")}
              onClick={() => addToCart({ ...product, quantity, selectedVariant, price: currentPrice })}
            >
              Add to Cart
            </button>

            {currentStock > 0 ? (
              <button
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
                onClick={() => {
                  if (product.variants?.length > 0 && !matchedVariant) {
                    alert("Please select all variant options first")
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
                  if (contact?.trim()) alert("We will notify you at " + contact.trim() + " when back in stock!")
                }}
              >
                🔔 Notify Me
              </button>
            )}
          </div>

          {/* Share */}
          <ShareProduct title={product.title} />

          {/* Description */}
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-gray-600 text-sm" style={{ whiteSpace: "pre-line" }}>
              {product.description}
            </p>
          </div>

          {/* Specifications */}
          <div>
            <h3 className="font-semibold mb-2">Specifications</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              {product.brand && <li>Brand: {product.brand}</li>}
              {product.specifications?.warranty && <li>Warranty: {product.specifications.warranty}</li>}
            </ul>
          </div>

        </div>
      </div>

      {/* Reviews */}
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