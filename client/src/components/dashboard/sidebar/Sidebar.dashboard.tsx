"use client"

import type React from "react"
import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { motion } from "framer-motion"
import {
  PlusCircle,
  Trash2,
  LayoutDashboard,
  Settings,
  Users,
  ShoppingBag,
  BarChart3,
  ChevronRight,
  MessageCircle,
  Plus,
  Edit,
  Trash,
} from "lucide-react"
import { useSelector } from 'react-redux';
import { RootState } from '../../../hooks/store/store';
import { useProfileLoader } from '../../../hooks/useProfileLoader';

export const Sidebar: React.FC = () => {
  const location = useLocation()
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(true)
  
  // Ensure user profile data is loaded
  useProfileLoader();

  // Get the user data from Redux store
  const { data: userData } = useSelector((state: RootState) => state.user);

  // Navigation items with icons
  const navItems = [
    {
      path: "/dashboard",
      label: "Overview",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      path: "/dashboard/add-product",
      label: "Add Product",
      icon: <PlusCircle className="h-5 w-5" />,
    },
    {
      path: "/dashboard/add-category",
      label: "Add Category",
      icon: <PlusCircle className="h-5 w-5" />,
    },
    {
      path: "/dashboard/delete-category",
      label: "Delete Category",
      icon: <Trash2 className="h-5 w-5" />,
    },
    {
      path: "/dashboard/delete-product",
      label: "Delete Product",
      icon: <Trash2 className="h-5 w-5" />,
    },
    {
      path: "/dashboard/delete-reviews",
      label: "Manage Reviews",
      icon: <MessageCircle className="h-5 w-5" />,
    },
    {
      path: "/dashboard/user-reviews",
      label: "User",
      icon: <Users className="h-5 w-5" />,
    },
    {
      path: "/dashboard/update-product",
      label: "Update Product",
      icon: <Edit size={20} />,
    },
    // {
    //   path: "/dashboard/products",
    //   label: "Products",
    //   icon: <ShoppingBag className="h-5 w-5" />,
    // },
    // {
    //   path: "/dashboard/analytics",
    //   label: "Analytics",
    //   icon: <BarChart3 className="h-5 w-5" />,
    // },
    // {
    //   path: "/dashboard/users",
    //   label: "Users",
    //   icon: <Users className="h-5 w-5" />,
    // },
    // {
    //   path: "/dashboard/settings",
    //   label: "Settings",
    //   icon: <Settings className="h-5 w-5" />,
    // },
  ]

  // Check if a path is active
  const isActive = (path: string) => {
    return location.pathname === path
  }

  // Add this helper function at the top of your component
  const getProfileImageUrl = (imagePath: string | undefined): string => {
    if (!imagePath) return `http://localhost:5000/profileImages/avatar.png`;
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:5000/profileImages/${imagePath}`;
  };

  // Then in your component, add this to access the current user data
  const profileImage = userData?.data?.profileImage 
    ? getProfileImageUrl(userData.data.profileImage)
    : `http://localhost:5000/profileImages/avatar.png`;

  return (
    <motion.div
      className={`${
        isExpanded ? "w-64" : "w-20"
      } h-full bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col p-4 pt-8 relative transition-all duration-300 ease-in-out`}
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Toggle button */}
      <motion.button
        className="absolute -right-3 top-10 bg-primary-500 rounded-full p-1 shadow-md z-10"
        onClick={() => setIsExpanded(!isExpanded)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <motion.div animate={{ rotate: isExpanded ? 0 : 180 }} transition={{ duration: 0.3 }}>
          <ChevronRight className="h-4 w-4 text-white" />
        </motion.div>
      </motion.button>

      {/* Decorative elements */}
      <motion.div
        className="absolute top-20 right-4 h-8 w-8 rounded-full bg-pink-500/10"
        initial={{ scale: 0 }}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
      />
      <motion.div
        className="absolute bottom-20 left-4 h-6 w-6 bg-warning-500/10"
        initial={{ scale: 0 }}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2.5, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
      />
      <motion.div
        className="absolute top-1/2 right-6 h-0 w-0 border-l-[8px] border-l-transparent border-b-[14px] border-b-teal-500/10 border-r-[8px] border-r-transparent"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 3.5, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
      />

      {/* Header */}
      <div className="flex items-center mb-8">
        <motion.div
          className="h-10 w-10 rounded-lg bg-gradient-to-r from-teal-500 to-teal-400 flex items-center justify-center shadow-lg mr-3"
          whileHover={{ rotate: [0, -10, 10, -10, 0] }}
          transition={{ duration: 0.5 }}
        >
          <LayoutDashboard className="h-6 w-6 text-white" />
        </motion.div>
        {isExpanded && (
          <motion.h2
            className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            Dashboard
          </motion.h2>
        )}
      </div>

      {/* Navigation */}
      <ul className="space-y-2 flex-1">
        {navItems.map((item, index) => {
          const isItemActive = isActive(item.path)
          return (
            <motion.li
              key={item.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              onMouseEnter={() => setHoveredItem(item.path)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <Link
                to={item.path}
                className={`flex items-center px-4 py-3 rounded-lg transition-all relative ${
                  isItemActive
                    ? "bg-gradient-to-r from-teal-600 to-teal-500 text-white"
                    : "hover:bg-gray-700/50 text-gray-300"
                }`}
              >
                <motion.div
                  className={`${isItemActive ? "text-white" : "text-gray-400"}`}
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  {item.icon}
                </motion.div>
                {isExpanded && (
                  <span className="ml-3 whitespace-nowrap overflow-hidden text-ellipsis">{item.label}</span>
                )}
                {isExpanded && hoveredItem === item.path && !isItemActive && (
                  <motion.div
                    className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500 rounded-full"
                    layoutId="sidebar-indicator"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            </motion.li>
          )
        })}
      </ul>

      {/* User profile section */}
      <motion.div
        className={`mt-auto pt-4 border-t border-gray-700 ${isExpanded ? "px-2" : "px-0"}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className={`flex items-center ${isExpanded ? "justify-between" : "justify-center"}`}>
          <Link to="/profile" className="flex items-center">
            <motion.div
              className="h-8 w-8 rounded-full overflow-hidden border border-gray-600"
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <img
                src={profileImage}
                alt={userData?.data?.name || "Admin User"}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `http://localhost:5000/profileImages/avatar.png`;
                }}
              />
            </motion.div>
            {isExpanded && (
              <div className="ml-3">
                <p className="text-sm font-medium text-white">{userData?.data?.name || "Admin User"}</p>
                <p className="text-xs text-gray-400">{userData?.data?.email || "admin@gadget.com"}</p>
              </div>
            )}
          </Link>
        </div>
      </motion.div>
    </motion.div>
  )
}


