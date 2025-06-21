import React from 'react';
import { motion } from 'framer-motion';
import { Search, Package, RefreshCw, ShoppingBag } from 'lucide-react';

interface DataNotFoundProps {
  title?: string;
  message?: string;
  type?: 'products' | 'categories' | 'reviews' | 'users' | 'general';
  onRetry?: () => void;
  showRetryButton?: boolean;
  className?: string;
}

const DataNotFound: React.FC<DataNotFoundProps> = ({
  title,
  message,
  type = 'general',
  onRetry,
  showRetryButton = true,
  className = '',
}) => {
  const getDefaultContent = () => {
    switch (type) {
      case 'products':
        return {
          title: title || 'No Products Found',
          message: message || 'We couldn\'t find any products matching your criteria. Try adjusting your filters or search terms.',
          icon: Package,
          iconColor: 'text-primary-500',
          bgColor: 'bg-primary-50',
        };
      case 'categories':
        return {
          title: title || 'No Categories Found',
          message: message || 'No categories are available at the moment. Please check back later.',
          icon: ShoppingBag,
          iconColor: 'text-pink-500',
          bgColor: 'bg-pink-50',
        };
      case 'reviews':
        return {
          title: title || 'No Reviews Found',
          message: message || 'No reviews have been posted yet. Be the first to share your experience!',
          icon: Search,
          iconColor: 'text-warning-500',
          bgColor: 'bg-warning-50',
        };
      case 'users':
        return {
          title: title || 'No Users Found',
          message: message || 'No users match your search criteria.',
          icon: Search,
          iconColor: 'text-primary-500',
          bgColor: 'bg-primary-50',
        };
      default:
        return {
          title: title || 'No Data Found',
          message: message || 'The requested data is not available at the moment.',
          icon: Search,
          iconColor: 'text-gray-500',
          bgColor: 'bg-gray-50',
        };
    }
  };

  const content = getDefaultContent();
  const IconComponent = content.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`flex flex-col items-center justify-center py-16 px-6 ${className}`}
    >
      {/* Animated background elements */}
      <div className="relative">
        <motion.div
          className={`absolute w-32 h-32 ${content.bgColor} rounded-full opacity-20`}
          initial={{ scale: 0.8 }}
          animate={{ scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
        />
        
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={`relative z-10 p-6 ${content.bgColor} rounded-full mb-6`}
        >
          <IconComponent className={`w-16 h-16 ${content.iconColor}`} />
        </motion.div>
      </div>

      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-2xl font-bold text-gray-800 mb-3 text-center"
      >
        {content.title}
      </motion.h3>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-gray-600 text-center max-w-md mb-6"
      >
        {content.message}
      </motion.p>

      {showRetryButton && onRetry && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          onClick={onRetry}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 via-pink-500 to-warning-500 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200 transform hover:scale-105"
        >
          <RefreshCw className="w-5 h-5" />
          Try Again
        </motion.button>
      )}
    </motion.div>
  );
};

export default DataNotFound; 