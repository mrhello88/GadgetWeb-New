"use client"

import { useEffect } from "react"
import { Helmet } from "react-helmet"
import { Link } from "react-router-dom"
import { motion, useAnimation, useInView } from "framer-motion"
import { useRef } from "react"
import { ArrowRight, CheckCircle, Users, Award, Clock, ChevronRight } from "lucide-react"

// Custom SVG components for geometric decorations
const CircleDecoration = ({ className }: { className: string }) => (
  <svg className={className} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="50" fill="currentColor" />
  </svg>
)

const TriangleDecoration = ({ className }: { className: string }) => (
  <svg className={className} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <polygon points="50,0 100,100 0,100" fill="currentColor" />
  </svg>
)

const SquareDecoration = ({ className }: { className: string }) => (
  <svg className={className} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" fill="currentColor" />
  </svg>
)

const AboutPage = () => {
  // Animation for sections when they come into view
  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  }

  // Staggered animation for lists
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  // Animation for team members
  const teamMemberVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  }

  // Animation for timeline items
  const timelineVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  }

  // Refs and animations for scroll-triggered animations
  const missionRef = useRef(null)
  const teamRef = useRef(null)
  const timelineRef = useRef(null)
  const valuesRef = useRef(null)
  const ctaRef = useRef(null)

  const missionInView = useInView(missionRef, { once: false, amount: 0.3 })
  const teamInView = useInView(teamRef, { once: false, amount: 0.2 })
  const timelineInView = useInView(timelineRef, { once: false, amount: 0.2 })
  const valuesInView = useInView(valuesRef, { once: false, amount: 0.3 })
  const ctaInView = useInView(ctaRef, { once: false, amount: 0.5 })

  const missionControls = useAnimation()
  const teamControls = useAnimation()
  const timelineControls = useAnimation()
  const valuesControls = useAnimation()
  const ctaControls = useAnimation()

  useEffect(() => {
    if (missionInView) missionControls.start("visible")
    if (teamInView) teamControls.start("visible")
    if (timelineInView) timelineControls.start("visible")
    if (valuesInView) valuesControls.start("visible")
    if (ctaInView) ctaControls.start("visible")
  }, [
    missionInView,
    teamInView,
    timelineInView,
    valuesInView,
    ctaInView,
    missionControls,
    teamControls,
    timelineControls,
    valuesControls,
    ctaControls,
  ])

  // Team members data
  const teamMembers = [
    {
      name: "Alex Johnson",
      role: "Founder & CEO",
      image:
        "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80",
    },
    {
      name: "Sarah Williams",
      role: "CTO",
      image:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80",
    },
    {
      name: "Michael Chen",
      role: "Head of Design",
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80",
    },
    {
      name: "Priya Sharma",
      role: "Product Manager",
      image:
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80",
    },
  ]

  // Timeline data
  const timelineItems = [
    {
      year: "2018",
      title: "Company Founded",
      description: "Our journey began with a simple idea: to make technology more accessible and easier to compare.",
    },
    {
      year: "2019",
      title: "First Product Launch",
      description: "We launched our first comparison platform, focusing on smartphones and laptops.",
    },
    {
      year: "2021",
      title: "Expansion",
      description: "Expanded our categories to include smart home devices, wearables, and audio equipment.",
    },
    {
      year: "2023",
      title: "Global Reach",
      description: "Reached over 1 million monthly users across 50+ countries worldwide.",
    },
  ]

  // Company values
  const companyValues = [
    {
      title: "User-Focused",
      description: "We put our users first in everything we do, ensuring our platform is intuitive and helpful.",
      icon: <Users className="h-6 w-6" />,
    },
    {
      title: "Accuracy",
      description: "We're committed to providing accurate, unbiased information to help users make informed decisions.",
      icon: <CheckCircle className="h-6 w-6" />,
    },
    {
      title: "Innovation",
      description: "We continuously innovate to improve our platform and stay ahead of technological trends.",
      icon: <Award className="h-6 w-6" />,
    },
    {
      title: "Timeliness",
      description: "We ensure our product information and comparisons are always up-to-date with the latest releases.",
      icon: <Clock className="h-6 w-6" />,
    },
  ]

  return (
    <>
      <Helmet>
        <title>About Us | Gadget Comparison Platform</title>
        <meta
          name="description"
          content="Learn about our mission to help users make informed decisions about technology products through detailed comparisons and reviews."
        />
      </Helmet>

      <div className="relative overflow-hidden">
        {/* Decorative background elements */}
        <motion.div
          className="absolute top-20 right-[10%] w-64 h-64 text-primary-500 opacity-50 z-0"
          initial={{ scale: 0, rotate: 0 }}
          animate={{ scale: 1, rotate: 45 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          <SquareDecoration className="w-full h-full" />
        </motion.div>

        <motion.div
          className="absolute top-[40%] left-[5%] w-40 h-40 text-warning-500 opacity-50 z-0"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
        >
          <CircleDecoration className="w-full h-full" />
        </motion.div>

        <motion.div
          className="absolute bottom-20 right-[20%] w-48 h-48 text-pink-500 opacity-50 z-0"
          initial={{ scale: 0, rotate: 0 }}
          animate={{ scale: 1, rotate: 180 }}
          transition={{ duration: 1.5, delay: 0.6, ease: "easeOut" }}
        >
          <TriangleDecoration className="w-full h-full" />
        </motion.div>

        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-block mb-4"
              >
                <span className="px-4 py-1 rounded-full bg-primary-100 text-primary-500 text-sm font-medium">About Us</span>
              </motion.div>

              <motion.h1
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
              >
                Helping You Make <span className="text-primary-500">Smarter</span> Tech Decisions
              </motion.h1>

              <motion.p
                className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.4 }}
              >
                We're on a mission to simplify technology choices by providing detailed comparisons, honest reviews, and
                expert insights on the latest gadgets and tech products.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.6 }}
              >
                <Link
                  to="/categories"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary-300 text-white font-medium rounded-lg hover:bg-primary-900 transition-colors group"
                >
                  Explore Our Categories
                  <motion.span
                    initial={{ x: 0 }}
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <ArrowRight className="h-5 w-5" />
                  </motion.span>
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20 bg-white relative" ref={missionRef}>
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center gap-12">
              <motion.div
                className="flex-1 order-2 md:order-1"
                variants={fadeInUp}
                initial="hidden"
                animate={missionControls}
              >
                <span className="text-warning-500 font-medium mb-2 inline-block">Our Mission</span>
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
                  Empowering Consumers Through <span className="text-primary-500">Technology</span>
                </h2>
                <p className="text-gray-600 mb-6">
                  In today's fast-paced tech world, making the right choice can be overwhelming. That's why we've built
                  a platform that cuts through the noise and provides clear, unbiased comparisons of the latest gadgets.
                </p>
                <p className="text-gray-600 mb-6">
                  Our team of tech enthusiasts and experts work tirelessly to test, analyze, and compare products across
                  multiple categories, ensuring you have all the information you need to make confident purchasing
                  decisions.
                </p>

                <motion.div
                  className="flex items-center gap-4"
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Link to="/categories" className="text-primary-500 font-medium inline-flex items-center gap-1 group">
                    Learn about our services
                    <motion.span
                      initial={{ x: 0 }}
                      whileHover={{ x: 3 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </motion.span>
                  </Link>
                </motion.div>
              </motion.div>

              <motion.div
                className="flex-1 order-1 md:order-2 relative"
                variants={fadeInUp}
                initial="hidden"
                animate={missionControls}
              >
                <div className="relative">
                  <motion.div
                    className="absolute -top-4 -left-4 w-full h-full border-2 border-yellow rounded-lg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  />
                  <img
                    src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80"
                    alt="Team working on gadget comparisons"
                    className="rounded-lg shadow-lg w-full h-auto object-cover"
                  />
                  <motion.div
                    className="absolute -bottom-4 -right-4 bg-pink-500 py-3 px-6 rounded-lg shadow-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    <p className="text-white font-medium">Trusted by 1M+ users worldwide</p>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 bg-gray-50 relative" ref={teamRef}>
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <motion.span
                className="text-warning-500 font-medium mb-2 inline-block"
                variants={fadeInUp}
                initial="hidden"
                animate={teamControls}
              >
                Our Team
              </motion.span>
              <motion.h2
                className="text-3xl md:text-4xl font-bold mb-6 text-gray-900"
                variants={fadeInUp}
                initial="hidden"
                animate={teamControls}
              >
                Meet the <span className="text-primary-500">Experts</span> Behind Our Platform
              </motion.h2>
              <motion.p className="text-gray-600" variants={fadeInUp} initial="hidden" animate={teamControls}>
                Our diverse team brings together expertise in technology, design, and consumer insights to create the
                most comprehensive gadget comparison platform.
              </motion.p>
            </div>

            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
              variants={staggerContainer}
              initial="hidden"
              animate={teamControls}
            >
              {teamMembers.map((member, index) => (
                <motion.div
                  key={index}
                  className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                  variants={teamMemberVariants}
                  whileHover={{ y: -10 }}
                >
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={member.image || "/placeholder.svg"}
                      alt={member.name}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <h3 className="font-bold text-lg">{member.name}</h3>
                      <p className="text-white/80">{member.role}</p>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-center space-x-4">
                      {/* Social icons would go here */}
                      <motion.div
                        className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-500"
                        whileHover={{ scale: 1.2 }}
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M22.162 5.656a8.384 8.384 0 0 1-2.402.658A4.196 4.196 0 0 0 21.6 4c-.82.488-1.719.83-2.656 1.015a4.182 4.182 0 0 0-7.126 3.814 11.874 11.874 0 0 1-8.62-4.37 4.168 4.168 0 0 0-.566 2.103c0 1.45.738 2.731 1.86 3.481a4.168 4.168 0 0 1-1.894-.523v.052a4.185 4.185 0 0 0 3.355 4.101 4.21 4.21 0 0 1-1.89.072A4.185 4.185 0 0 0 7.97 16.65a8.394 8.394 0 0 1-6.191 1.732 11.83 11.83 0 0 0 6.41 1.88c7.693 0 11.9-6.373 11.9-11.9 0-.18-.005-.362-.013-.54a8.496 8.496 0 0 0 2.087-2.165z" />
                        </svg>
                      </motion.div>
                      <motion.div
                        className="w-8 h-8 rounded-full bg-warning-100 flex items-center justify-center text-warning-500"
                        whileHover={{ scale: 1.2 }}
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M16.98 0a6.9 6.9 0 0 1 5.08 1.98A6.94 6.94 0 0 1 24 7.02v9.96c0 2.08-.68 3.87-1.98 5.13A7.14 7.14 0 0 1 16.94 24H7.06a7.06 7.06 0 0 1-5.03-1.89A6.96 6.96 0 0 1 0 16.94V7.02C0 2.8 2.8 0 7.02 0h9.96zm.05 2.23H7.06c-1.45 0-2.7.43-3.53 1.25a4.82 4.82 0 0 0-1.3 3.54v9.92c0 1.5.43 2.7 1.3 3.58a5 5 0 0 0 3.53 1.25h9.88a5 5 0 0 0 3.53-1.25 4.73 4.73 0 0 0 1.4-3.54V7.02a5 5 0 0 0-1.3-3.49 4.82 4.82 0 0 0-3.54-1.3zM12 5.76c3.39 0 6.2 2.8 6.2 6.2a6.2 6.2 0 0 1-12.4 0 6.2 6.2 0 0 1 6.2-6.2zm0 2.22a3.99 3.99 0 0 0-3.97 3.97A3.99 3.99 0 0 0 12 15.92a3.99 3.99 0 0 0 3.97-3.97A3.99 3.99 0 0 0 12 7.98zm6.44-3.77a1.4 1.4 0 1 1 0 2.8 1.4 1.4 0 0 1 0-2.8z" />
                        </svg>
                      </motion.div>
                      <motion.div
                        className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-pink-500"
                        whileHover={{ scale: 1.2 }}
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M22.23 0H1.77C.8 0 0 .77 0 1.72v20.56C0 23.23.8 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.2 0 22.23 0zM7.27 20.1H3.65V9.24h3.62V20.1zM5.47 7.76h-.03c-1.22 0-2-.83-2-1.87 0-1.06.8-1.87 2.05-1.87 1.24 0 2 .8 2.02 1.87 0 1.04-.78 1.87-2.05 1.87zM20.34 20.1h-3.63v-5.8c0-1.45-.52-2.45-1.83-2.45-1 0-1.6.67-1.87 1.32-.1.23-.11.55-.11.88v6.05H9.28s.05-9.82 0-10.84h3.63v1.54a3.6 3.6 0 0 1 3.26-1.8c2.39 0 4.18 1.56 4.18 4.89v6.21z" />
                        </svg>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="py-20 bg-white relative" ref={timelineRef}>
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <motion.span
                className="text-pink-500 font-medium mb-2 inline-block"
                variants={fadeInUp}
                initial="hidden"
                animate={timelineControls}
              >
                Our Journey
              </motion.span>
              <motion.h2
                className="text-3xl md:text-4xl font-bold mb-6 text-gray-900"
                variants={fadeInUp}
                initial="hidden"
                animate={timelineControls}
              >
                The <span className="text-pink-500">Story</span> Behind Our Success
              </motion.h2>
              <motion.p className="text-gray-600" variants={fadeInUp} initial="hidden" animate={timelineControls}>
                From a small startup to a trusted tech comparison platform, our journey has been driven by a passion for
                helping consumers make informed decisions.
              </motion.p>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="relative">
                {/* Timeline line */}
                <motion.div
                  className="absolute left-0 md:left-1/2 top-0 bottom-0 w-1 bg-gray-200 transform md:translate-x-[-50%]"
                  initial={{ height: 0 }}
                  animate={{ height: "100%" }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                />

                {/* Timeline items */}
                {timelineItems.map((item, index) => (
                  <motion.div
                    key={index}
                    className={`relative flex flex-col md:flex-row items-center mb-12 last:mb-0 ${
                      index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                    }`}
                    variants={timelineVariants}
                    initial="hidden"
                    animate={timelineControls}
                    transition={{ delay: index * 0.2 }}
                  >
                    <div className="flex-1 md:w-1/2 mb-6 md:mb-0 md:px-8">
                      <motion.div
                        className={`p-6 rounded-lg shadow-md ${index % 2 === 0 ? "bg-primary-500" : "bg-warning-500"}`}
                        whileHover={{ y: -5 }}
                        transition={{ type: "spring", stiffness: 300, damping: 10 }}
                      >
                        <span className="text-2xl font-bold text-gray-900">{item.year}</span>
                        <h3 className="text-xl font-semibold mt-2 mb-3 text-gray-800">{item.title}</h3>
                        <p className="text-gray-600">{item.description}</p>
                      </motion.div>
                    </div>

                    <motion.div
                      className="absolute left-0 md:left-1/2 w-10 h-10 rounded-full bg-white border-4 border-primary-500 flex items-center justify-center transform md:translate-x-[-50%]"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.2 + 0.5, type: "spring" }}
                    >
                      <span className="text-primary-500 font-bold">{index + 1}</span>
                    </motion.div>

                    <div className="flex-1 md:w-1/2" />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 bg-gray-50 relative" ref={valuesRef}>
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <motion.span
                className="text-primary-500 font-medium mb-2 inline-block"
                variants={fadeInUp}
                initial="hidden"
                animate={valuesControls}
              >
                Our Values
              </motion.span>
              <motion.h2
                className="text-3xl md:text-4xl font-bold mb-6 text-gray-900"
                variants={fadeInUp}
                initial="hidden"
                animate={valuesControls}
              >
                The <span className="text-primary-500">Principles</span> That Guide Us
              </motion.h2>
              <motion.p className="text-gray-600" variants={fadeInUp} initial="hidden" animate={valuesControls}>
                Our core values shape everything we do, from how we build our platform to how we interact with our users
                and partners.
              </motion.p>
            </div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
              variants={staggerContainer}
              initial="hidden"
              animate={valuesControls}
            >
              {companyValues.map((value, index) => (
                <motion.div
                  key={index}
                  className="bg-white p-8 rounded-lg shadow-md"
                  variants={fadeInUp}
                  whileHover={{ y: -10 }}
                  transition={{ type: "spring", stiffness: 300, damping: 10 }}
                >
                  <motion.div
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                      index % 4 === 0
                        ? "bg-primary-100 text-primary-500"
                        : index % 4 === 1
                          ? "bg-warning-100 text-warning-500"
                          : index % 4 === 2
                            ? "bg-pink-100 text-pink-500"
                            : "bg-primary-100 text-primary-500"
                    }`}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.7 }}
                  >
                    {value.icon}
                  </motion.div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-800">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-teal-300 to-teal-900 relative" ref={ctaRef}>
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <motion.h2
                className="text-3xl md:text-4xl font-bold mb-6 text-white"
                variants={fadeInUp}
                initial="hidden"
                animate={ctaControls}
              >
                Ready to Make Smarter Tech Decisions?
              </motion.h2>
              <motion.p
                className="text-xl text-white/90 mb-8"
                variants={fadeInUp}
                initial="hidden"
                animate={ctaControls}
                transition={{ delay: 0.2 }}
              >
                Join thousands of tech enthusiasts who use our platform to compare and choose the best gadgets for their
                needs.
              </motion.p>
              <motion.div variants={fadeInUp} initial="hidden" animate={ctaControls} transition={{ delay: 0.4 }}>
                <Link
                  to="/categories"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-500 font-medium rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Start Comparing Now
                  <motion.span
                    initial={{ x: 0 }}
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <ArrowRight className="h-5 w-5" />
                  </motion.span>
                </Link>
              </motion.div>
            </div>
          </div>

          {/* Decorative elements */}
          <motion.div
            className="absolute bottom-10 left-10 w-20 h-20 text-white/10"
            animate={{
              rotate: [0, 180],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
          >
            <CircleDecoration className="w-full h-full" />
          </motion.div>
          <motion.div
            className="absolute top-10 right-10 w-16 h-16 text-white/10"
            animate={{
              rotate: [180, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 7, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
          >
            <SquareDecoration className="w-full h-full" />
          </motion.div>
        </section>
      </div>
    </>
  )
}

export default AboutPage
