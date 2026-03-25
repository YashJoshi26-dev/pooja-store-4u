import { motion } from "framer-motion"
import { Link } from "react-router-dom"

const categories = [
  {
    name: "Electronics",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600",
  },
  {
    name: "Mobiles",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9",
  },
  {
    name: "Fashion",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050",
  },
  {
    name: "Home & Kitchen",
    image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511",
  },
  {
    name: "Beauty",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348",
  },
  {
    name: "Books",
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794",
  },
  {
    name: "Sports",
    image: "https://images.unsplash.com/photo-1517649763962-0c623066013b",
  },
  {
    name: "Toys",
    image: "https://images.unsplash.com/photo-1558877385-81a1c7e67d72",
  },
  {
    name: "Computers",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8",
  },
  {
    name: "Accessories",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
  },
  {
    name: "Furniture",
    image: "https://images.unsplash.com/photo-1503602642458-232111445657",
  },
]

function CategoryGrid() {
  return (
    <section className="container-main py-20">

      <h2 className="text-2xl font-bold mb-8">
        Shop by Category
      </h2>

   <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-8">

        {categories.map((category, index) => (

          <motion.div
            key={category.name}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            viewport={{ once: true }}
          >

            <Link
              to={`/category/${category.name}`}
              className="group block bg-white rounded-2xl shadow-soft overflow-hidden hover:shadow-lg transition"
            >

              {/* IMAGE */}

              <div className="h-44 overflow-hidden">

                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                  loading="lazy"
                />

              </div>

              {/* TITLE */}

              <div className="p-4 text-center">

                <h3 className="font-medium text-sm md:text-base group-hover:text-blue-600 transition">

                  {category.name}

                </h3>

              </div>

            </Link>

          </motion.div>

        ))}

      </div>

    </section>
  )
}

export default CategoryGrid