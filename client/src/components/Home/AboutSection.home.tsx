"use client"

import { motion } from "framer-motion"
import { CheckCircle, Info } from "lucide-react"

export default function AboutUsSection() {
  const features = [
    "Side-by-side product comparisons",
    "Detailed specifications breakdown",
    "User reviews and ratings",
    "Price tracking and alerts",
  ]

  return (
    <section className="relative overflow-hidden bg-gray-50 py-12 sm:py-16 md:py-20">
      {/* Decorative elements */}
      <motion.div
        className="absolute top-10 sm:top-20 right-[5%] sm:right-[10%] h-10 sm:h-16 w-10 sm:w-16 rounded-full border-2 sm:border-4 border-teal-400"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 0.7, scale: 1 }}
        transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
      />
      <motion.div
        className="absolute bottom-5 sm:bottom-10 left-[10%] sm:left-[20%] h-6 sm:h-10 w-6 sm:w-10 bg-pink-400"
        initial={{ opacity: 0, rotate: 0 }}
        animate={{ opacity: 0.6, rotate: 90 }}
        transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
      />
      <motion.div
        className="absolute top-1/2 left-5 sm:left-10 h-12 sm:h-20 w-12 sm:w-20 rounded-full bg-yellow-200"
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 0.5 }}
        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
      />

      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-10 sm:gap-12 lg:flex-row lg:gap-12">
          {/* Left side - Image with decorative elements */}
          <motion.div
            className="relative flex-1 w-full max-w-[500px] lg:max-w-none"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <motion.div
              className="relative h-[250px] sm:h-[300px] md:h-[350px] lg:h-[400px] w-full overflow-hidden rounded-xl sm:rounded-2xl"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <img
                src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
                alt="Tech comparison"
                className="h-full w-full object-cover"
              />
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-teal-600/40 to-transparent"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              />
            </motion.div>

            {/* Floating elements - responsive sizing */}
            <motion.div
              className="absolute -top-3 sm:-top-6 -right-3 sm:-right-6 h-16 sm:h-20 md:h-24 w-16 sm:w-20 md:w-24 rounded-full bg-pink-500 p-3 sm:p-5 text-center text-white shadow-lg"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.8, type: "spring" }}
            >
              <p className="mt-0.5 sm:mt-1 text-base sm:text-lg font-bold">100+</p>
              <p className="text-[10px] sm:text-xs">Products</p>
            </motion.div>

            <motion.div
              className="absolute -bottom-3 sm:-bottom-6 -left-3 sm:-left-6 h-16 sm:h-20 md:h-24 w-16 sm:w-20 md:w-24 rounded-full bg-yellow-400 p-3 sm:p-5 text-center shadow-lg"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1, type: "spring" }}
            >
              <p className="mt-0.5 sm:mt-1 text-base sm:text-lg font-bold">50+</p>
              <p className="text-[10px] sm:text-xs">Categories</p>
            </motion.div>
          </motion.div>

          {/* Right side - Text content */}
          <motion.div
            className="flex-1 space-y-4 sm:space-y-6 text-center lg:text-left"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <span className="inline-flex items-center gap-1 sm:gap-2 rounded-full bg-teal-100 px-3 sm:px-4 py-1 text-xs sm:text-sm font-medium text-teal-800">
                <Info className="h-3 w-3 sm:h-4 sm:w-4" /> About Us
              </span>
            </motion.div>

            <motion.h2
              className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-gray-900"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              We Help You <span className="text-pink-600">Compare</span> Before You Decide
            </motion.h2>

            <motion.p
              className="text-base sm:text-lg text-gray-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              At GadgetCompare, we believe in making tech decisions simple. Our platform allows you to compare products
              within their categories, helping you understand the differences that matter most to you.
            </motion.p>

            <motion.p
              className="text-base sm:text-lg text-gray-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              Whether you're looking for smartphones, laptops, headphones, or smart home devices, we provide detailed
              comparisons that highlight the strengths and weaknesses of each product.
            </motion.p>

            <motion.ul
              className="space-y-2 sm:space-y-3 pt-2 sm:pt-4 text-left max-w-md mx-auto lg:mx-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              {features.map((feature, index) => (
                <motion.li
                  key={index}
                  className="flex items-center gap-2 sm:gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                >
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-teal-600 flex-shrink-0" />
                  <span className="text-sm sm:text-base">{feature}</span>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
