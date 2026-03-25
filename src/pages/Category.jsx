import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import ProductCard from "../components/ProductCard"
import { getProductsByCategory } from "../api/productApi"

// ✅ Skeleton loader
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

function Category() {
  const { name } = useParams()

  const [products, setProducts] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)   // ✅ FIX: loading state
  const [error, setError] = useState(null)        // ✅ FIX: error state

  const [sort, setSort] = useState("")
  const [maxPrice, setMaxPrice] = useState(50000)
  const [rating, setRating] = useState(0)
  const [inStock, setInStock] = useState(false)

  // ✅ FIX: Reset filters when category changes
  useEffect(() => {
    setSort("")
    setMaxPrice(50000)
    setRating(0)
    setInStock(false)
    setLoading(true)
    setError(null)

    async function load() {
      try {
        const data = await getProductsByCategory(name)
        setProducts(data)
        setFiltered(data)
      } catch (err) {
        setError("Failed to load products. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [name])

  // Filter & sort
  useEffect(() => {
    let data = [...products]

    data = data.filter((p) => p.price <= maxPrice)

    if (rating > 0) data = data.filter((p) => p.rating >= rating)
    if (inStock)    data = data.filter((p) => p.stock > 0)

    if (sort === "low")    data.sort((a, b) => a.price - b.price)
    if (sort === "high")   data.sort((a, b) => b.price - a.price)
    if (sort === "rating") data.sort((a, b) => b.rating - a.rating)

    setFiltered(data)
  }, [products, maxPrice, rating, inStock, sort])

  // ✅ FIX: Reset all filters
  const handleReset = () => {
    setSort("")
    setMaxPrice(50000)
    setRating(0)
    setInStock(false)
  }

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
    <div className="max-w-7xl mx-auto px-4 py-10">

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">{name}</h1>
        {!loading && (
          <p className="text-sm text-gray-400 mt-1">{filtered.length} products found</p>
        )}
      </div>

      <div className="grid lg:grid-cols-4 gap-8">

        {/* FILTER SIDEBAR */}
        <div className="space-y-6 bg-white p-5 rounded-2xl shadow-sm border border-gray-100 self-start">

          <div className="flex justify-between items-center">
            <h3 className="font-bold text-sm">Filters</h3>
            {/* ✅ FIX: Reset button */}
            <button
              onClick={handleReset}
              className="text-xs text-blue-500 hover:underline"
            >
              Reset all
            </button>
          </div>

          {/* PRICE FILTER */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Price Range</h3>
            <input
              type="range"
              min="0"
              max="50000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}  // ✅ FIX: parse as Number
              className="w-full accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>₹0</span>
              <span className="font-semibold text-gray-700">Up to ₹{Number(maxPrice).toLocaleString()}</span>
              <span>₹50,000</span>
            </div>
          </div>

          {/* RATING FILTER */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Rating</h3>
            <div className="flex flex-col gap-2">
              {[0, 4, 3, 2].map((r) => (
                <label key={r} className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="radio"
                    name="rating"
                    value={r}
                    checked={rating === r}
                    onChange={() => setRating(r)}
                    className="accent-blue-600"
                  />
                  {r === 0 ? "All Ratings" : `${r}★ & above`}
                </label>
              ))}
            </div>
          </div>

          {/* STOCK FILTER */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Availability</h3>
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={inStock}
                onChange={() => setInStock(!inStock)}
                className="accent-blue-600"
              />
              In Stock Only
            </label>
          </div>

        </div>

        {/* PRODUCT AREA */}
        <div className="lg:col-span-3">

          {/* SORTING BAR */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-sm text-gray-500">
              {loading ? "Loading..." : `${filtered.length} products`}
            </p>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
            >
              <option value="">Sort By</option>
              <option value="low">Price: Low → High</option>
              <option value="high">Price: High → Low</option>
              <option value="rating">Best Rating</option>
            </select>
          </div>

          {/* LOADING SKELETONS */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            // ✅ FIX: Empty state
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
              <div className="text-5xl">🔍</div>
              <p className="font-semibold text-gray-700">No products found</p>
              <p className="text-sm text-gray-400">Try adjusting your filters</p>
              <button
                onClick={handleReset}
                className="bg-slate-900 text-white px-6 py-2 rounded-lg text-sm hover:bg-slate-800 transition"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default Category
