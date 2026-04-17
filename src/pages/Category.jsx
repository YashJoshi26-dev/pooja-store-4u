import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import ProductCard from "../components/ProductCard"
import { getProductsByCategory } from "../api/productApi"
import { CATEGORIES } from "../data/categories"

function SkeletonCard() {
  return (
    <div className="bg-white rounded-3xl shadow-md overflow-hidden animate-pulse">
      <div className="h-52 bg-gray-200"/>
      <div className="p-4 flex flex-col gap-3">
        <div className="h-4 bg-gray-200 rounded w-3/4"/>
        <div className="h-3 bg-gray-200 rounded w-1/2"/>
        <div className="h-4 bg-gray-200 rounded w-1/3"/>
        <div className="h-9 bg-gray-200 rounded-lg"/>
      </div>
    </div>
  )
}

function Category() {
  const { name } = useParams()
  const decodedName = decodeURIComponent(name)

  const [products, setProducts] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)

  const [sort,     setSort]     = useState("")
  const [maxPrice, setMaxPrice] = useState(50000)
  const [rating,   setRating]   = useState(0)
  const [inStock,  setInStock]  = useState(false)

  // ✅ Check if this is a parent category with subcategories
  const parentCat  = CATEGORIES.find(c => c.label === decodedName)
  const hasSubCats = parentCat?.sub?.length > 0

  useEffect(() => {
    setSort(""); setMaxPrice(50000); setRating(0); setInStock(false)
    setLoading(true); setError(null)

    async function load() {
      try {
        let data = []

       if (hasSubCats) {
  // "All" tab — load from ALL subcategories
  const results = await Promise.all(
    parentCat.sub.map(sub => getProductsByCategory(sub.label))
  )
  const seen = new Set()
  data = results.flat().filter(p => {
    if (seen.has(p._id)) return false
    seen.add(p._id)
    return true
  })
} else {
  // Check if this is a subcategory page
  const parentOfThis = CATEGORIES.find(c => c.sub?.some(s => s.label === decodedName))
  if (parentOfThis) {
    // Sub-tab clicked — load only this subcategory products
    data = await getProductsByCategory(decodedName)
  } else {
    data = await getProductsByCategory(decodedName)
  }
}

        setProducts(Array.isArray(data) ? data : [])
        setFiltered(Array.isArray(data) ? data : [])
      } catch (err) {
        setError("Failed to load products. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [name])

  // ─── Client-side filter + sort ────────────────────────────────────────────
  useEffect(() => {
    let data = [...products]
    data = data.filter(p => p.price <= maxPrice)
    if (rating > 0) data = data.filter(p => p.rating >= rating)
    if (inStock)    data = data.filter(p => p.stock > 0)
    if (sort === "low")    data.sort((a, b) => a.price - b.price)
    if (sort === "high")   data.sort((a, b) => b.price - a.price)
    if (sort === "rating") data.sort((a, b) => b.rating - a.rating)
    setFiltered(data)
  }, [products, maxPrice, rating, inStock, sort])

  const handleReset = () => {
    setSort(""); setMaxPrice(50000); setRating(0); setInStock(false)
  }

  if (error) return (
    <div className="min-h-screen flex items-center justify-center flex-col gap-4">
      <p className="text-red-500 font-medium">{error}</p>
      <button onClick={() => window.location.reload()} className="bg-slate-900 text-white px-6 py-2 rounded-lg">Retry</button>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">

      {/* Breadcrumb */}
      {/* Breadcrumb */}
<div className="flex items-center gap-2 text-sm text-gray-400 mb-4 flex-wrap">
  <Link to="/" className="hover:text-red-500">Home</Link>
  <span>›</span>
  {(() => {
    const parentOfThis = CATEGORIES.find(c =>
      c.sub?.some(s => s.label === decodedName)
    )
    if (parentOfThis) {
      return (
        <>
          <Link
            to={`/category/${encodeURIComponent(parentOfThis.label)}`}
            className="hover:text-red-500"
          >
            {parentOfThis.label}
          </Link>
          <span>›</span>
          <span className="text-gray-700 font-medium">{decodedName}</span>
        </>
      )
    }
    return <span className="text-gray-700 font-medium">{decodedName}</span>
  })()}
</div>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{decodedName}</h1>
        {!loading && (
          <p className="text-sm text-gray-400 mt-1">{filtered.length} products found</p>
        )}
      </div>

      {/* ✅ Subcategory tabs for parent categories like Pujan Samagri */}
    {/* Subcategory tabs — show on both parent AND sub pages */}
{(() => {
  const tabParent = hasSubCats
    ? parentCat
    : CATEGORIES.find(c => c.sub?.some(s => s.label === decodedName))

  if (!tabParent) return null

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {/* All tab */}
      <Link
        to={`/category/${encodeURIComponent(tabParent.label)}`}
        className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition ${
          decodedName === tabParent.label
            ? "bg-red-500 text-white border-red-500"
            : "border-gray-200 text-gray-600 hover:border-red-400 hover:text-red-500"
        }`}
      >
        All
      </Link>
      {/* Sub tabs */}
      {tabParent.sub.map(sub => (
        <Link
          key={sub.id}
          to={`/category/${encodeURIComponent(sub.label)}`}
          className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition ${
            decodedName === sub.label
              ? "bg-red-500 text-white border-red-500"
              : "border-gray-200 text-gray-600 hover:border-red-400 hover:text-red-500"
          }`}
        >
          {sub.label}
        </Link>
      ))}
    </div>
  )
})()}

      <div className="grid lg:grid-cols-4 gap-8">

        {/* FILTER SIDEBAR */}
        <div className="space-y-6 bg-white p-5 rounded-2xl shadow-sm border border-gray-100 self-start">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-sm">Filters</h3>
            <button onClick={handleReset} className="text-xs text-red-500 hover:underline font-medium">Reset all</button>
          </div>

          {/* Price */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Price Range</h3>
            <input type="range" min="0" max="50000" value={maxPrice}
              onChange={e => setMaxPrice(Number(e.target.value))}
              className="w-full accent-red-500"/>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>₹0</span>
              <span className="font-semibold text-gray-700">₹{Number(maxPrice).toLocaleString()}</span>
              <span>₹50,000</span>
            </div>
          </div>

          {/* Rating */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Rating</h3>
            <div className="flex flex-col gap-2">
              {[0, 4, 3, 2].map(r => (
                <label key={r} className="flex items-center gap-2 cursor-pointer text-sm">
                  <input type="radio" name="rating" value={r} checked={rating === r}
                    onChange={() => setRating(r)} className="accent-red-500"/>
                  {r === 0 ? "All Ratings" : `${r}★ & above`}
                </label>
              ))}
            </div>
          </div>

          {/* Stock */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Availability</h3>
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input type="checkbox" checked={inStock} onChange={() => setInStock(!inStock)}
                className="accent-red-500"/>
              In Stock Only
            </label>
          </div>
        </div>

        {/* PRODUCTS */}
        <div className="lg:col-span-3">
          <div className="flex justify-between items-center mb-6">
            <p className="text-sm text-gray-500">
              {loading ? "Loading..." : `${filtered.length} products`}
            </p>
            <select value={sort} onChange={e => setSort(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm outline-none focus:border-red-400">
              <option value="">Sort By</option>
              <option value="low">Price: Low → High</option>
              <option value="high">Price: High → Low</option>
              <option value="rating">Best Rating</option>
            </select>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {Array.from({length:6}).map((_,i) => <SkeletonCard key={i}/>)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
              <div className="text-5xl">🔍</div>
              <p className="font-semibold text-gray-700 text-lg">No products found</p>
              <p className="text-sm text-gray-400">
                {products.length === 0
                  ? "No products listed in this category yet."
                  : "Try adjusting your filters"}
              </p>
              {products.length > 0 && (
                <button onClick={handleReset}
                  className="bg-slate-900 text-white px-6 py-2 rounded-lg text-sm hover:bg-slate-800 transition">
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-6">
              {filtered.map(product => (
                // ✅ Use _id (MongoDB) with fallback to id
                <ProductCard key={product._id || product.id} product={product}/>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Category
