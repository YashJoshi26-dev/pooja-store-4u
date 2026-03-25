import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
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

  const { addToCart } = useCart()

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

  const images = [
    product.image,
    product.image,
    product.image,
    product.image
  ]

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

                <img
                  src={img}
                  alt="product"
                  className="w-full h-[420px] object-cover"
                />

              </SwiperSlide>

            ))}

          </Swiper>

          {/* THUMBNAILS */}

          <Swiper
            onSwiper={setThumbsSwiper}
            spaceBetween={10}
            slidesPerView={4}
            className="mt-4"
          >

            {images.map((img, index) => (

              <SwiperSlide key={index}>

                <img
                  src={img}
                  alt="thumb"
                  className="h-24 w-full object-cover rounded-lg cursor-pointer"
                />

              </SwiperSlide>

            ))}

          </Swiper>

        </div>

        {/* PRODUCT INFO */}

        <div className="space-y-6">

          <h1 className="text-2xl font-bold">
            {product.title}
          </h1>

          {/* RATING */}

          <div className="flex items-center gap-2 text-yellow-500">

            {"★".repeat(Math.floor(product.rating))}
            {"☆".repeat(5 - Math.floor(product.rating))}

            <span className="text-gray-500 text-sm ml-2">
              ({product.reviews} reviews)
            </span>

          </div>

          {/* PRICE */}

          <div className="flex items-center gap-4">

            <span className="text-3xl font-bold">
              ₹{product.price}
            </span>

            {product.oldPrice && (

              <span className="line-through text-gray-400">

                ₹{product.oldPrice}

              </span>

            )}

          </div>

          {/* STOCK */}

          <div>

            {product.stock > 0 ? (

              <span className="text-green-600 font-medium">
                In Stock
              </span>

            ) : (

              <span className="text-red-600 font-medium">
                Out of Stock
              </span>

            )}

          </div>

          {/* QUANTITY */}

          <div className="flex items-center gap-4">

            <span className="font-medium">
              Quantity
            </span>

            <div className="flex items-center border rounded-lg">

              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-2"
              >
                -
              </button>

              <span className="px-4">
                {quantity}
              </span>

              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-3 py-2"
              >
                +
              </button>

            </div>

          </div>

          {/* BUTTONS */}

          <div className="flex gap-4">

            <button
              onClick={() => addToCart({ ...product, quantity })}
              className="bg-slate-900 text-white px-6 py-3 rounded-lg hover:bg-slate-800 transition"
            >
              Add to Cart
            </button>

            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
              Buy Now
            </button>

          </div>

          {/* DESCRIPTION */}

          <div>

            <h3 className="font-semibold mb-2">
              Description
            </h3>

            <p className="text-gray-600 text-sm">
              {product.description}
            </p>

          </div>

          {/* SPECIFICATIONS */}

          <div>

            <h3 className="font-semibold mb-2">
              Specifications
            </h3>

            <ul className="text-sm text-gray-600 space-y-1">

              <li>
                Brand: {product.specifications.brand}
              </li>

              <li>
                Weight: {product.specifications.weight}
              </li>

              <li>
                Warranty: {product.specifications.warranty}
              </li>

            </ul>

          </div>

        </div>

      </div>

      {/* REVIEWS SECTION */}

      <div className="mt-16">

        <h2 className="text-xl font-bold mb-6">
          Customer Reviews
        </h2>

        <div className="space-y-4">

          <div className="border rounded-lg p-4">

            <div className="text-yellow-500 mb-1">
              ★★★★☆
            </div>

            <p className="text-sm text-gray-600">
              Great product, excellent quality and fast delivery.
            </p>

          </div>

          <div className="border rounded-lg p-4">

            <div className="text-yellow-500 mb-1">
              ★★★★★
            </div>

            <p className="text-sm text-gray-600">
              Highly recommended. Worth the price.
            </p>

          </div>

        </div>

      </div>

    </div>

  )
}

export default Product