import { Link } from "react-router-dom"

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 text-center px-4">
      <h1 className="text-8xl font-bold text-slate-900">404</h1>
      <p className="text-xl font-semibold text-gray-600">Page not found</p>
      <p className="text-gray-400 max-w-md">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="bg-slate-900 text-white px-8 py-3 rounded-lg hover:bg-slate-800 transition font-medium"
      >
        Back to Home
      </Link>
    </div>
  )
}
