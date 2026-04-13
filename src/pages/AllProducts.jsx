import { useEffect, useState } from "react"
import ProductCard from "../components/ProductCard"
import { getAllProducts } from "../api/productApi"

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

export default function AllProducts() {
  const [products, setProducts] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)
  const [search,   setSearch]   = useState("")
  const [sort,     setSort]     = useState("")

  useEffect(() => {
    getAllProducts()
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setError("Failed to load products. Please try again."))
      .finally(() => setLoading(false))
  }, [])

  const filtered = products
    .filter((p) => p.title?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === "low")    return a.price - b.price
      if (sort === "high")   return b.price - a.price
      if (sort === "rating") return b.rating - a.rating
      return 0
    })

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <p className="text-red-500 font-medium">{error}</p>
      <button onClick={() => window.location.reload()}
        className="bg-slate-900 text-white px-6 py-2 rounded-lg">Retry</button>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">All Products</h1>
          {!loading && <p className="text-sm text-gray-400 mt-1">{filtered.length} products</p>}
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-slate-400 w-full sm:w-64"
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-slate-400"
          >
            <option value="">Sort By</option>
            <option value="low">Price: Low to High</option>
            <option value="high">Price: High to Low</option>
            <option value="rating">Best Rating</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="text-5xl">🔍</div>
          <p className="font-semibold text-gray-700">No products found</p>
          <p className="text-sm text-gray-400">Try a different search term</p>
          {search && (
            <button onClick={() => setSearch("")}
              className="text-sm font-semibold text-red-500 hover:underline">
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filtered.map((p) => (
            <ProductCard key={p._id || p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  )
}