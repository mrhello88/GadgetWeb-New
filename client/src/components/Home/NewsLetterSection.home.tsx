"use client"

import { motion } from "framer-motion"
import { Bell, Send } from "lucide-react"
import { type FormEvent, useState } from "react"

export default function NewsletterSection() {
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    // Here you would typically handle the newsletter signup
    setIsSubmitted(true)
  }

  return (
    <section className="relative overflow-hidden bg-primary-900 py-12 sm:py-16 md:py-20 text-white">
      {/* Decorative elements */}
      <motion.div
        className="absolute top-5 sm:top-10 left-[5%] sm:left-[10%] h-10 sm:h-16 w-10 sm:w-16 rounded-full bg-pink-500/20"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
      />
      <motion.div
        className="absolute bottom-5 sm:bottom-10 right-[10%] sm:right-[20%] h-12 sm:h-20 w-12 sm:w-20 bg-warning-400/20"
        initial={{ opacity: 0, rotate: 0 }}
        animate={{ opacity: 1, rotate: 90 }}
        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
      />
      <motion.div
        className="absolute top-1/3 right-5 sm:right-10 h-0 w-0 border-l-[15px] sm:border-l-[25px] border-l-transparent border-b-[25px] sm:border-b-[40px] border-b-teal-400/30 border-r-[15px] sm:border-r-[25px] border-r-transparent"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
      />

      <div className="container relative mx-auto px-4">
        <motion.div
          className="mx-auto max-w-3xl text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <motion.div
            className="mx-auto mb-4 sm:mb-6 flex h-12 sm:h-16 w-12 sm:w-16 items-center justify-center rounded-full bg-pink-500"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, delay: 0.3 }}
          >
            <Bell className="h-6 w-6 sm:h-8 sm:w-8" />
          </motion.div>

          <motion.h2
            className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Stay Updated on the <span className="text-warning-400">Latest Tech</span>
          </motion.h2>

          <motion.p
            className="mx-auto mt-2 sm:mt-4 max-w-xl text-base sm:text-lg text-primary-100"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Subscribe to our newsletter and be the first to know about new product releases, exclusive comparisons, and
            tech tips.
          </motion.p>

          <motion.form
            className="mt-6 sm:mt-8"
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            {!isSubmitted ? (
              <div className="flex flex-col items-center gap-3 sm:gap-4 sm:flex-row">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full flex-1 rounded-lg border-0 bg-white/10 px-3 sm:px-4 py-2 sm:py-3 text-white placeholder-white/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/50 text-sm sm:text-base"
                  required
                />
                <motion.button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-pink-600 px-4 sm:px-5 py-2 sm:py-3 text-sm font-medium text-white transition-colors hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-teal-900 sm:w-auto"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Subscribe <Send className="h-3 w-3 sm:h-4 sm:w-4" />
                </motion.button>
              </div>
            ) : (
              <motion.div
                className="rounded-lg bg-primary-800 p-3 sm:p-4 text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring" }}
              >
                <p className="text-base sm:text-lg font-medium">Thanks for subscribing!</p>
                <p className="text-sm text-primary-100">We'll keep you updated with the latest tech news.</p>
              </motion.div>
            )}
          </motion.form>

          <motion.p
            className="mt-3 sm:mt-4 text-xs sm:text-sm text-primary-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            We respect your privacy. Unsubscribe at any time.
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}
