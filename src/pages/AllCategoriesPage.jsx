import { Link } from "react-router-dom"
import { CATEGORIES } from "../data/categories"

export default function AllCategoriesPage() {
  const parentCats = CATEGORIES.filter(c => c.sub.length === 0 || c.sub.length > 0)

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link to="/" className="hover:text-red-500">Home</Link>
        <span>›</span>
        <span className="text-gray-700 font-medium">All Categories</span>
      </div>
      <h1 className="text-2xl font-bold mb-6">All Categories</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {parentCats.map(cat => (
          <Link
            key={cat.id}
            to={`/category/${encodeURIComponent(cat.label)}`}
            className="flex flex-col items-center gap-2 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:border-red-300 hover:shadow-md transition"
          >
            <span className="text-sm font-semibold text-center text-gray-700">{cat.label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}