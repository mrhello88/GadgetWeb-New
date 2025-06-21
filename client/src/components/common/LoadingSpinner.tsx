import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, ShoppingCart, Package, User, Search } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  type?: 'default' | 'products' | 'categories' | 'users' | 'search';
  message?: string;
  fullScreen?: boolean;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  type = 'default',
  message,
  fullScreen = false,
  className = '',
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          icon: 'w-6 h-6',
          text: 'text-sm',
          spacing: 'gap-2',
        };
      case 'md':
        return {
          icon: 'w-8 h-8',
          text: 'text-base',
          spacing: 'gap-3',
        };
      case 'lg':
        return {
          icon: 'w-12 h-12',
          text: 'text-lg',
          spacing: 'gap-4',
        };
      case 'xl':
        return {
          icon: 'w-16 h-16',
          text: 'text-xl',
          spacing: 'gap-6',
        };
      default:
        return {
          icon: 'w-8 h-8',
          text: 'text-base',
          spacing: 'gap-3',
        };
    }
  };

  const getTypeContent = () => {
    switch (type) {
      case 'products':
        return {
          icon: Package,
          message: message || 'Loading products...',
          color: 'text-primary-600',
          bgColor: 'bg-primary-50',
        };
      case 'categories':
        return {
          icon: ShoppingCart,
          message: message || 'Loading categories...',
          color: 'text-pink-600',
          bgColor: 'bg-pink-50',
        };
      case 'users':
        return {
          icon: User,
          message: message || 'Loading users...',
          color: 'text-primary-600',
          bgColor: 'bg-primary-50',
        };
      case 'search':
        return {
          icon: Search,
          message: message || 'Searching...',
          color: 'text-warning-600',
          bgColor: 'bg-warning-50',
        };
      default:
        return {
          icon: Loader2,
          message: message || 'Loading...',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
        };
    }
  };

  const sizeClasses = getSizeClasses();
  const typeContent = getTypeContent();
  const IconComponent = typeContent.icon;

  const SpinnerContent = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`flex flex-col items-center justify-center ${sizeClasses.spacing} ${className}`}
    >
      {/* Background blur effect */}
      <div className="relative">
        <motion.div
          className={`absolute inset-0 ${typeContent.bgColor} rounded-full opacity-20 blur-xl`}
          initial={{ scale: 0.5 }}
          animate={{ scale: [0.5, 1.2, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className={`relative z-10 ${typeContent.color} ${sizeClasses.icon}`}
        >
          <IconComponent className="w-full h-full" />
        </motion.div>
      </div>

      {typeContent.message && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`${typeContent.color} ${sizeClasses.text} font-medium text-center`}
        >
          {typeContent.message}
        </motion.p>
      )}
    </motion.div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center relative overflow-hidden">
        {/* Animated background elements */}
        <motion.div
          className="absolute w-64 h-64 bg-gradient-to-r from-primary-200 to-pink-200 rounded-full opacity-10"
          initial={{ x: -100, y: -100 }}
          animate={{ 
            x: [-100, 100, -100], 
            y: [-100, 100, -100],
            rotate: [0, 360, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          style={{ left: '10%', top: '20%' }}
        />
        <motion.div
          className="absolute w-48 h-48 bg-gradient-to-r from-pink-200 to-warning-200 rounded-full opacity-10"
          initial={{ x: 100, y: 100 }}
          animate={{ 
            x: [100, -100, 100], 
            y: [100, -100, 100],
            rotate: [360, 0, 360]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          style={{ right: '15%', bottom: '25%' }}
        />

        <SpinnerContent />
      </div>
    );
  }

  return <SpinnerContent />;
};

// Specialized loading components for different use cases
export const ProductsLoading: React.FC<{ message?: string; fullScreen?: boolean }> = ({ 
  message, 
  fullScreen = false 
}) => (
  <LoadingSpinner 
    type="products" 
    size="lg" 
    message={message} 
    fullScreen={fullScreen} 
  />
);

export const CategoriesLoading: React.FC<{ message?: string; fullScreen?: boolean }> = ({ 
  message, 
  fullScreen = false 
}) => (
  <LoadingSpinner 
    type="categories" 
    size="lg" 
    message={message} 
    fullScreen={fullScreen} 
  />
);

export const UsersLoading: React.FC<{ message?: string; fullScreen?: boolean }> = ({ 
  message, 
  fullScreen = false 
}) => (
  <LoadingSpinner 
    type="users" 
    size="lg" 
    message={message} 
    fullScreen={fullScreen} 
  />
);

export const SearchLoading: React.FC<{ message?: string }> = ({ message }) => (
  <LoadingSpinner 
    type="search" 
    size="sm" 
    message={message} 
    className="py-4"
  />
);

export default LoadingSpinner; 