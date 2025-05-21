'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../hooks/store/store';
import { GetProductsByCategory } from '../../hooks/store/thunk/product.thunk';
import type { productByCategory } from '../../hooks/store/slice/product.slices';

type ProductCardProps = {
  title: string;
  description: string;
  image: string;
  icon: React.ReactNode;
  delay: number;
  link: string;
};

const ProductCard = ({ title, description, image, icon, delay, link }: ProductCardProps) => ( 
  <motion.div
    className="group relative overflow-hidden rounded-xl bg-white shadow-lg"
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    whileHover={{ y: -10 }}
  >
    <div className="relative h-36 sm:h-48 overflow-hidden"> 
      <img
        // src={image || '/placeholder.svg'}
        src={
          image.startsWith('http')
            ? image
            : `${import.meta.env.VITE_API_URL}/images/${image}`
        }
        alt={title}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
    </div>

    <div className="relative p-4 sm:p-6">
      <div className="absolute -top-6 sm:-top-8 left-4 sm:left-6 rounded-full bg-teal-600 p-2 sm:p-3 text-white shadow-lg">
        {icon}
      </div>

      <h3 className="mt-2 sm:mt-4 text-lg sm:text-xl font-bold text-gray-900">{title}</h3>
      <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">{description}</p>

      <Link
        to={`/category/${link}`}
        className="mt-2 sm:mt-4 inline-flex items-center gap-1 sm:gap-2 text-sm sm:text-base font-medium text-pink-600 transition-colors hover:text-pink-700"
      >
        View Products <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
      </Link>
    </div>
  </motion.div>
);

export default function CategorySection() {
  const dispatch = useDispatch<AppDispatch>();
  const { data } = useSelector((state: RootState) => state.product);
  const [categories, setCategories] = useState<productByCategory[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const result = await dispatch(GetProductsByCategory()).unwrap();
        if (result.success && result.data) {
          // Get the latest 3 categories
          const latestCategories = result.data.slice(0, 3);
          setCategories(latestCategories);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };

    fetchCategories();
  }, [dispatch]);

  return (
    <section className="relative overflow-hidden bg-white py-12 sm:py-16 md:py-20">
      {/* Decorative elements */}
      <motion.div
        className="absolute top-5 sm:top-10 right-5 sm:right-10 h-8 sm:h-12 w-8 sm:w-12 bg-yellow-300"
        initial={{ opacity: 0, rotate: 0 }}
        animate={{ opacity: 0.6, rotate: 45 }}
        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatType: 'reverse' }}
      />
      <motion.div
        className="absolute bottom-10 sm:bottom-20 left-10 sm:left-20 h-6 sm:h-10 w-6 sm:w-10 rounded-full bg-pink-400"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 0.7, scale: 1 }}
        transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, repeatType: 'reverse' }}
      />
      <motion.div
        className="absolute top-1/3 left-5 sm:left-10 h-0 w-0 border-l-[10px] sm:border-l-[15px] border-l-transparent border-b-[15px] sm:border-b-[25px] border-b-teal-400 border-r-[10px] sm:border-r-[15px] border-r-transparent"
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 0.8 }}
        transition={{ duration: 1.2, repeat: Number.POSITIVE_INFINITY, repeatType: 'reverse' }}
      />

      <div className="container mx-auto px-4">
        <motion.div
          className="mb-8 sm:mb-12 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.span
            className="inline-block rounded-full bg-pink-100 px-3 sm:px-4 py-1 text-xs sm:text-sm font-medium text-pink-800"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Browse Categories
          </motion.span>
          <motion.h2
            className="mt-2 sm:mt-3 text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-gray-900"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Explore Our <span className="text-teal-600">Product Categories</span>
          </motion.h2>
          <motion.p
            className="mx-auto mt-2 sm:mt-4 max-w-2xl text-base sm:text-lg text-gray-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Find and compare the best gadgets across our most popular categories
          </motion.p>
        </motion.div>

        {categories.length > 0 ? (
        <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, index) => (
            <ProductCard
                key={category._id}
                title={category.category}
              description={category.description}
              image={category.image}
                icon={<BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />}
                link={category._id}
              delay={0.5 + index * 0.2}
            />
          ))}
        </div>
        ) : (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-gray-600 text-lg">No categories available at the moment.</p>
          </motion.div>
        )}

        <motion.div
          className="mt-8 sm:mt-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <Link
            to="/categories"
            className="inline-flex items-center gap-2 rounded-lg border border-teal-600 bg-white px-4 sm:px-6 py-2 sm:py-3 text-sm font-medium text-teal-600 transition-colors hover:bg-teal-50"
          >
            View All Categories <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
