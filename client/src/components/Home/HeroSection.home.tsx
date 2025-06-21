'use client';

import { motion } from 'framer-motion';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../hooks/store/store';
export default function HeroSection() {
  const { isLoggedIn } = useSelector((state: RootState) => state.user);
  return (
    <section className="relative overflow-hidden bg-white py-12 sm:py-16 md:py-20">
      {/* Decorative elements - responsive positioning */}
      <motion.div
        className="absolute top-10 sm:top-20 left-5 sm:left-10 h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-pink-400"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 0.7, scale: 1 }}
        transition={{ duration: 0.5, repeat: Number.POSITIVE_INFINITY, repeatType: 'reverse' }}
      />
      <motion.div
        className="absolute bottom-10 sm:bottom-20 left-[15%] sm:left-1/4 h-8 w-8 sm:h-12 sm:w-12 bg-warning-300"
        initial={{ opacity: 0, rotate: 0 }}
        animate={{ opacity: 0.6, rotate: 180 }}
        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatType: 'reverse' }}
      />
      <motion.div
        className="absolute top-1/4 sm:top-1/3 right-5 sm:right-10 h-0 w-0 border-l-[15px] sm:border-l-[20px] border-l-transparent border-b-[25px] sm:border-b-[34px] border-b-teal-400 border-r-[15px] sm:border-r-[20px] border-r-transparent"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 0.8 }}
        transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, repeatType: 'reverse' }}
      />

      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-8 sm:gap-10 lg:flex-row lg:gap-8">
          {/* Left side - Text content - responsive typography */}
          <motion.div
            className="flex-1 space-y-4 sm:space-y-6 text-center lg:text-left"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <motion.span
              className="inline-block rounded-full bg-primary-100 px-3 py-1 text-xs sm:text-sm font-medium text-primary-800"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Latest Gadgets 2025
            </motion.span>
            <motion.h1
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-gray-900"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Find Your Perfect <span className="text-primary-600">Tech Match</span>
            </motion.h1>
            <motion.p
              className="max-w-2xl mx-auto lg:mx-0 text-base sm:text-lg text-gray-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Compare the latest gadgets side by side and discover which one fits your needs
              perfectly. Our detailed comparisons help you make informed decisions.
            </motion.p>
            <motion.div
              className="flex flex-wrap justify-center lg:justify-start gap-3 sm:gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              {isLoggedIn ? (
                <>
                  <Link
                    to="/compare"
                    className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 sm:px-6 py-2 sm:py-3 text-sm font-medium text-white transition-colors hover:bg-primary-700"
                  >
                    Compare Now <ChevronRight className="h-4 w-4" />
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/user/login"
                    className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 sm:px-6 py-2 sm:py-3 text-sm font-medium text-white transition-colors hover:bg-primary-700"
                  >
                    Compare Now <ChevronRight className="h-4 w-4" />
                  </Link>
                </>
              )}
              <Link
                to="/categories"
                className="inline-flex items-center gap-2 rounded-lg border border-pink-500 bg-white px-4 sm:px-6 py-2 sm:py-3 text-sm font-medium text-pink-600 transition-colors hover:bg-pink-50"
              >
                Get Started <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          </motion.div>

          {/* Right side - Custom interactive image composition - responsive sizing */}
          <motion.div
            className="relative flex-1 w-full max-w-[500px] lg:max-w-none"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
          >
            <div className="relative h-[300px] sm:h-[400px] md:h-[450px] lg:h-[500px] w-full">
              {/* Background gradient */}
              <motion.div
                className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-br from-teal-600/90 via-pink-500/70 to-yellow-400/80 p-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {/* Inner content with dark overlay */}
                <div className="relative h-full w-full overflow-hidden rounded-lg sm:rounded-xl bg-black/80 p-3 sm:p-6">
                  {/* Decorative grid lines */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="h-full w-full bg-[linear-gradient(0deg,transparent_24px,white_25px),linear-gradient(90deg,transparent_24px,white_25px)] bg-[size:25px_25px]" />
                  </div>

                  {/* Floating devices - responsive sizing */}
                  <motion.div
                    className="absolute left-[10%] top-[15%] h-24 sm:h-32 md:h-40 w-12 sm:w-16 md:w-20 rounded-xl bg-black shadow-[0_0_15px_rgba(0,255,255,0.5)]"
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    whileHover={{ y: -10, rotate: -5, transition: { duration: 0.3 } }}
                  >
                    {/* Smartphone screen */}
                    <div className="mx-auto mt-1 sm:mt-2 h-20 sm:h-24 md:h-32 w-[90%] rounded-lg bg-gradient-to-br from-teal-500 to-blue-600">
                      {/* App icons grid */}
                      <div className="grid grid-cols-3 gap-0.5 sm:gap-1 p-0.5 sm:p-1">
                        {[...Array(9)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="aspect-square rounded-sm sm:rounded-md bg-white/20"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.8 + i * 0.05 }}
                          />
                        ))}
                      </div>
                    </div>
                    {/* Home button */}
                    <div className="mx-auto mt-1 sm:mt-2 h-2 sm:h-3 w-6 sm:w-8 rounded-full bg-gray-700" />
                  </motion.div>

                  {/* Tablet device - responsive sizing */}
                  <motion.div
                    className="absolute right-[15%] top-[25%] h-28 sm:h-36 md:h-48 w-40 sm:w-52 md:w-64 rounded-xl bg-black shadow-[0_0_15px_rgba(255,105,180,0.5)]"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.7, duration: 0.8 }}
                    whileHover={{ y: -5, rotate: 3, transition: { duration: 0.3 } }}
                  >
                    {/* Tablet screen */}
                    <div className="mx-auto mt-1 sm:mt-2 h-24 sm:h-30 md:h-40 w-[95%] rounded-lg bg-gradient-to-tr from-pink-600 to-purple-600 p-1 sm:p-2">
                      {/* Content visualization */}
                      <div className="h-4 sm:h-6 w-3/4 rounded-md bg-white/20" />
                      <div className="mt-1 sm:mt-2 h-16 sm:h-20 md:h-28 w-full rounded-md bg-white/10 p-1 sm:p-2">
                        <div className="flex gap-1 sm:gap-2">
                          <div className="h-8 sm:h-10 md:h-12 w-8 sm:w-10 md:w-12 rounded-md bg-white/20" />
                          <div className="flex flex-col gap-0.5 sm:gap-1">
                            <div className="h-2 sm:h-3 w-12 sm:w-20 rounded-sm bg-white/30" />
                            <div className="h-2 sm:h-3 w-10 sm:w-16 rounded-sm bg-white/20" />
                            <div className="h-2 sm:h-3 w-14 sm:w-24 rounded-sm bg-white/10" />
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Home button */}
                    <div className="mx-auto mt-1 sm:mt-2 h-2 sm:h-3 w-6 sm:w-8 rounded-full bg-gray-700" />
                  </motion.div>

                  {/* Laptop device - responsive sizing */}
                  <motion.div
                    className="absolute bottom-[15%] left-[20%] h-20 sm:h-24 md:h-32 w-36 sm:w-44 md:w-56 rounded-t-lg bg-gray-800 shadow-[0_0_15px_rgba(255,215,0,0.5)]"
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.9, duration: 0.8 }}
                    whileHover={{ y: -8, transition: { duration: 0.3 } }}
                  >
                    {/* Laptop screen */}
                    <div className="mx-auto mt-1 sm:mt-2 h-16 sm:h-18 md:h-24 w-[90%] rounded-sm bg-gradient-to-br from-yellow-400 to-orange-600 p-1 sm:p-2">
                      {/* Screen content */}
                      <div className="flex flex-col gap-0.5 sm:gap-1">
                        <div className="h-1.5 sm:h-3 w-full rounded-sm bg-white/20" />
                        <div className="h-1.5 sm:h-3 w-3/4 rounded-sm bg-white/15" />
                        <div className="h-1.5 sm:h-3 w-5/6 rounded-sm bg-white/10" />
                        <div className="mt-1 sm:mt-2 grid grid-cols-2 gap-0.5 sm:gap-1">
                          <div className="h-4 sm:h-8 rounded bg-white/20" />
                          <div className="h-4 sm:h-8 rounded bg-white/10" />
                        </div>
                      </div>
                    </div>
                    {/* Laptop base */}
                    <motion.div
                      className="mx-auto h-2 sm:h-4 w-32 sm:w-40 md:w-48 rounded-b-lg bg-gray-700"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: 1.1 }}
                    />
                  </motion.div>

                  {/* Smartwatch - responsive sizing */}
                  <motion.div
                    className="absolute bottom-[25%] right-[25%] h-10 sm:h-12 md:h-16 w-8 sm:w-10 md:w-14 rounded-lg bg-gray-800 shadow-[0_0_15px_rgba(64,224,208,0.5)]"
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1.1, duration: 0.8 }}
                    whileHover={{ rotate: 10, scale: 1.1, transition: { duration: 0.3 } }}
                  >
                    {/* Watch face */}
                    <div className="mx-auto mt-0.5 sm:mt-1 h-8 sm:h-10 md:h-12 w-8 sm:w-10 md:w-12 rounded-full bg-gradient-to-br from-teal-400 to-cyan-600 p-0.5 sm:p-1">
                      <div className="flex h-full flex-col items-center justify-center">
                        <div className="h-0.5 sm:h-1 w-2 sm:w-4 rounded-full bg-white/50" />
                        <div className="mt-0.5 sm:mt-1 h-0.5 sm:h-1 w-3 sm:w-6 rounded-full bg-white/30" />
                        <div className="mt-0.5 sm:mt-1 h-0.5 sm:h-1 w-1.5 sm:w-3 rounded-full bg-white/20" />
                      </div>
                    </div>
                    {/* Watch band connector */}
                    <div className="mx-auto h-0.5 sm:h-1 w-4 sm:w-6 bg-gray-700" />
                  </motion.div>

                  {/* Floating circles - fewer on mobile */}
                  {[...Array(window.innerWidth < 640 ? 4 : 8)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute h-2 sm:h-3 w-2 sm:w-3 rounded-full bg-white"
                      style={{
                        left: `${15 + Math.random() * 70}%`,
                        top: `${15 + Math.random() * 70}%`,
                        opacity: 0.2 + Math.random() * 0.3,
                      }}
                      initial={{ scale: 0 }}
                      animate={{
                        scale: [0, 1, 1, 0],
                        x: [0, Math.random() * 30 - 15, Math.random() * 30 - 15, 0],
                        y: [0, Math.random() * 30 - 15, Math.random() * 30 - 15, 0],
                      }}
                      transition={{
                        duration: 4 + Math.random() * 3,
                        repeat: Number.POSITIVE_INFINITY,
                        delay: Math.random() * 2,
                        repeatType: 'loop',
                      }}
                    />
                  ))}

                  {/* Tech connection lines - simplified on mobile */}
                  <svg
                    className="absolute inset-0 h-full w-full"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <motion.path
                      d="M100,150 C150,100 200,200 250,150"
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="1"
                      fill="none"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 1.5, delay: 1.3 }}
                    />
                    <motion.path
                      d="M250,150 C300,100 350,200 400,180"
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="1"
                      fill="none"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 1.5, delay: 1.5 }}
                    />
                    <motion.path
                      d="M200,300 C250,250 300,350 350,300"
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="1"
                      fill="none"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 1.5, delay: 1.7 }}
                    />
                  </svg>

                  {/* Glowing orb */}
                  <motion.div
                    className="absolute left-1/2 top-1/2 h-10 sm:h-12 md:h-16 w-10 sm:w-12 md:w-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-pink-500 to-teal-500 opacity-80 blur-md"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.7, 0.9, 0.7],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Number.POSITIVE_INFINITY,
                      repeatType: 'reverse',
                    }}
                  />

                  {/* Tech data text - hidden on smallest screens */}
                  <motion.div
                    className="absolute bottom-2 sm:bottom-6 left-2 sm:left-6 text-[8px] sm:text-xs font-mono text-white/50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.9 }}
                  >
                    GADGET_COMPARE_v2.5
                  </motion.div>
                  <motion.div
                    className="absolute bottom-2 sm:bottom-6 right-2 sm:right-6 text-[8px] sm:text-xs font-mono text-white/50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2 }}
                  >
                    TECH_SYNC: ACTIVE
                  </motion.div>
                </div>
              </motion.div>

              {/* Floating elements over the image - responsive sizing */}
              <motion.div
                className="absolute -bottom-2 sm:-bottom-4 -left-2 sm:-left-4 rounded-lg bg-warning-400 p-2 sm:p-4 shadow-lg"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1 }}
                whileHover={{ y: -5 }}
              >
                <p className="text-sm sm:text-base font-bold text-black">4.9/5 Rating</p>
                <p className="text-xs sm:text-sm text-black/80">From 2,000+ reviews</p>
              </motion.div>

              <motion.div
                className="absolute -top-2 sm:-top-4 -right-2 sm:-right-4 rounded-lg bg-pink-500 p-2 sm:p-4 shadow-lg"
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.2 }}
                whileHover={{ y: 5 }}
              >
                <p className="text-sm sm:text-base font-bold text-white">New Arrivals</p>
                <p className="text-xs sm:text-sm text-white/80">Updated weekly</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
