'use client';

import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, ExternalLink } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useEffect } from 'react';
import { RootState } from '../../hooks/store/store';

const Footer = () => {  // Get authentication state
  const { isLoggedIn, token } = useSelector((state: RootState) => state.user);

  // Effect to force re-render when auth state changes
  useEffect(() => {
    // This effect will run whenever isLoggedIn or token changes
  }, [isLoggedIn, token]);

  // Animation variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 24 },
    },
  };

  // Define navigation links
  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/about', label: 'About' },
    { to: '/categories', label: 'Categories' },
    // Only show admin login if user is not logged in
    ...(!isLoggedIn ? [{ to: '/admin/login', label: 'Admin login' }] : []),
  ];

  return (
    <footer className="relative overflow-hidden bg-gray-50 border-t border-gray-200">
      {/* Decorative elements */}
      <motion.div
        className="absolute top-10 right-[5%] h-16 w-16 rounded-full border-4 border-teal-400/30"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 0.7, scale: 1 }}
        transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, repeatType: 'reverse' }}
      />
      <motion.div
        className="absolute bottom-20 left-[10%] h-10 w-10 bg-pink-400/20"
        initial={{ opacity: 0, rotate: 0 }}
        animate={{ opacity: 0.6, rotate: 90 }}
        transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, repeatType: 'reverse' }}
      />
      <motion.div
        className="absolute top-1/3 left-[80%] h-0 w-0 border-l-[15px] border-l-transparent border-b-[25px] border-b-yellow-400/30 border-r-[15px] border-r-transparent"
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 0.5 }}
        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatType: 'reverse' }}
      />

      <div className="max-w-screen-xl mx-auto p-6 md:p-8 relative z-10">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {/* Navigation Links */}
          <motion.div variants={itemVariants}>
            <motion.h3
              className="text-lg font-semibold text-gray-900 mb-4 inline-flex items-center"
              whileHover={{ x: 5 }}
            >
              <span className="relative">
                Quick Links
                <motion.span
                  className="absolute -bottom-1 left-0 h-0.5 bg-teal-500"
                  initial={{ width: 0 }}
                  whileInView={{ width: '100%' }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                />
              </span>
            </motion.h3>
            <ul className="space-y-3">
              {navLinks.map((link, index) => (
                <motion.li key={index} variants={itemVariants}>
                  <Link
                    to={link.to}
                    className="text-base text-gray-600 hover:text-teal-600 transition-colors duration-200 inline-flex items-center group"
                  >
                    <motion.span
                      className="inline-block w-1 h-1 rounded-full bg-teal-500 mr-2 opacity-0 group-hover:opacity-100"
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                    />
                    {link.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Information */}
          <motion.div variants={itemVariants}>
            <motion.h3
              className="text-lg font-semibold text-gray-900 mb-4 inline-flex items-center"
              whileHover={{ x: 5 }}
            >
              <span className="relative">
                Contact Us
                <motion.span
                  className="absolute -bottom-1 left-0 h-0.5 bg-pink-500"
                  initial={{ width: 0 }}
                  whileInView={{ width: '100%' }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                />
              </span>
            </motion.h3>
            <ul className="space-y-3 text-base text-gray-600">
              <motion.li
                className="flex items-start gap-2"
                variants={itemVariants}
                whileHover={{ x: 5 }}
              >
                <Mail className="h-5 w-5 text-pink-500 mt-0.5 flex-shrink-0" />
                <span>support@gadget.com</span>
              </motion.li>
              <motion.li
                className="flex items-start gap-2"
                variants={itemVariants}
                whileHover={{ x: 5 }}
              >
                <Phone className="h-5 w-5 text-pink-500 mt-0.5 flex-shrink-0" />
                <span>+1 (555) 123-4567</span>
              </motion.li>
              <motion.li
                className="flex items-start gap-2"
                variants={itemVariants}
                whileHover={{ x: 5 }}
              >
                <MapPin className="h-5 w-5 text-pink-500 mt-0.5 flex-shrink-0" />
                <span>123 Gadget Street, Tech City, 90210</span>
              </motion.li>
            </ul>
          </motion.div>

          {/* Social Media Links */}
          <motion.div variants={itemVariants}>
            <motion.h3
              className="text-lg font-semibold text-gray-900 mb-4 inline-flex items-center"
              whileHover={{ x: 5 }}
            >
              <span className="relative">
                Follow Us
                <motion.span
                  className="absolute -bottom-1 left-0 h-0.5 bg-yellow-500"
                  initial={{ width: 0 }}
                  whileInView={{ width: '100%' }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                />
              </span>
            </motion.h3>
            <ul className="space-y-3 text-base text-gray-600">
              <motion.li variants={itemVariants}>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-teal-600 transition-colors duration-200 flex items-center gap-2 group"
                >
                  <motion.div
                    className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-200 group-hover:bg-teal-100"
                    whileHover={{ rotate: 15 }}
                  >
                    <Twitter className="h-4 w-4 text-gray-700 group-hover:text-teal-600" />
                  </motion.div>
                  <span>Twitter</span>
                  <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </motion.li>
              <motion.li variants={itemVariants}>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-pink-600 transition-colors duration-200 flex items-center gap-2 group"
                >
                  <motion.div
                    className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-200 group-hover:bg-pink-100"
                    whileHover={{ rotate: 15 }}
                  >
                    <Facebook className="h-4 w-4 text-gray-700 group-hover:text-pink-600" />
                  </motion.div>
                  <span>Facebook</span>
                  <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </motion.li>
              <motion.li variants={itemVariants}>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-yellow-600 transition-colors duration-200 flex items-center gap-2 group"
                >
                  <motion.div
                    className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-200 group-hover:bg-yellow-100"
                    whileHover={{ rotate: 15 }}
                  >
                    <Instagram className="h-4 w-4 text-gray-700 group-hover:text-yellow-600" />
                  </motion.div>
                  <span>Instagram</span>
                  <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </motion.li>
            </ul>
          </motion.div>
        </motion.div>
        {/* Copyright Section */}
        <motion.div
          className="mt-8 border-t border-gray-200 pt-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="flex justify-center mb-4 space-x-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            {[...Array(5)].map((_, i) => (
              <motion.span
                key={i}
                className={`inline-block h-1 w-1 rounded-full ${
                  i === 0
                    ? 'bg-teal-500'
                    : i === 1
                    ? 'bg-pink-500'
                    : i === 2
                    ? 'bg-yellow-500'
                    : i === 3
                    ? 'bg-teal-300'
                    : 'bg-pink-300'
                }`}
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ delay: 0.8 + i * 0.1 }}
              />
            ))}
          </motion.div>
          <p className="text-base text-gray-600">
            &copy; {new Date().getFullYear()} Gadget. All rights reserved.
          </p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
