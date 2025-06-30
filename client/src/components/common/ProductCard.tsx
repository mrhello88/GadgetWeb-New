import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LazyImage } from './LazyImage';

interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    description: string;
    price: number;
    images: string[];
    rating?: number;
    reviewCount?: number;
  };
  fadeInUp?: any;
}

const ProductCard: React.FC<ProductCardProps> = memo(({ product, fadeInUp }) => {
  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);

  const getImageSrc = (imagePath: string) => {
    return imagePath?.startsWith('http')
      ? imagePath
      : `http://localhost:5000/images/${imagePath}`;
  };

  return (
    <motion.div
      variants={fadeInUp}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform hover:shadow-lg hover:-translate-y-1"
    >
      <Link to={`/product/${product._id}`} className="block">
        <div className="relative pb-[60%] overflow-hidden">
          <LazyImage
            src={getImageSrc(product.images[0])}
            alt={product.name}
            className="absolute inset-0 h-full w-full"
            placeholder="/placeholder.svg"
          />
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-1 text-gray-900 dark:text-gray-100 line-clamp-2">
            {product.name}
          </h3>
          
          {/* Rating Section */}
          {product.rating && product.rating > 0 && product.reviewCount && product.reviewCount > 0 && (
            <div className="flex items-center mt-2.5 mb-3">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(product.rating || 0) ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 22 20"
                >
                  <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
                </svg>
              ))}
              <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded dark:bg-blue-200 dark:text-blue-800 ms-3">
                {product.reviewCount} reviews
              </span>
            </div>
          )}
          
          {/* Price */}
          <p className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {formatPrice(product.price)}
          </p>
          
          {/* Description */}
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
            {product.description}
          </p>
        </div>
      </Link>
    </motion.div>
  );
});

ProductCard.displayName = 'ProductCard';

export { ProductCard };