// Environment-based configuration
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// API Configuration
export const API_CONFIG = {
  // Base URL for API calls
  BASE_URL: isProduction 
    ? import.meta.env.VITE_API_URL || 'https://your-production-api.com'
    : 'http://localhost:5000',
  
  // GraphQL endpoint
  GRAPHQL_URL: isProduction
    ? `${import.meta.env.VITE_API_URL || 'https://your-production-api.com'}/graphql`
    : 'http://localhost:5000/graphql',
  
  // Upload endpoints
  UPLOAD_URL: isProduction
    ? `${import.meta.env.VITE_API_URL || 'https://your-production-api.com'}/api/upload`
    : 'http://localhost:5000/api/upload',
  
  CATEGORY_UPLOAD_URL: isProduction
    ? `${import.meta.env.VITE_API_URL || 'https://your-production-api.com'}/api/category`
    : 'http://localhost:5000/api/category',
};

// Image URLs
export const IMAGE_CONFIG = {
  // Base URL for product images
  PRODUCT_IMAGES: isProduction
    ? `${import.meta.env.VITE_API_URL || 'https://your-production-api.com'}/images/`
    : 'http://localhost:5000/images/',
  
  // Base URL for category images
  CATEGORY_IMAGES: isProduction
    ? `${import.meta.env.VITE_API_URL || 'https://your-production-api.com'}/categoryImage/`
    : 'http://localhost:5000/categoryImage/',
  
  // Base URL for profile images
  PROFILE_IMAGES: isProduction
    ? `${import.meta.env.VITE_API_URL || 'https://your-production-api.com'}/profileImages/`
    : 'http://localhost:5000/profileImages/',
  
  // Default avatar image
  DEFAULT_AVATAR: isProduction
    ? `${import.meta.env.VITE_API_URL || 'https://your-production-api.com'}/profileImages/avatar.png`
    : 'http://localhost:5000/profileImages/avatar.png',
  
  // Placeholder image
  PLACEHOLDER_IMAGE: '/placeholder.svg',
};

// App Configuration
export const APP_CONFIG = {
  NAME: 'Gadgetier',
  VERSION: '1.0.0',
  DESCRIPTION: 'Full-stack e-commerce application',
  
  // Pagination defaults
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  
  // Search configuration
  SEARCH_DELAY: 300, // milliseconds
  MAX_SEARCH_RESULTS: 5,
  
  // File upload limits
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  
  // Environment flags
  IS_DEVELOPMENT: isDevelopment,
  IS_PRODUCTION: isProduction,
};

// Helper functions
export const getImageUrl = (imagePath: string | undefined, type: 'product' | 'category' | 'profile' = 'product'): string => {
  if (!imagePath) {
    return type === 'profile' ? IMAGE_CONFIG.DEFAULT_AVATAR : IMAGE_CONFIG.PLACEHOLDER_IMAGE;
  }
  
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  switch (type) {
    case 'product':
      return `${IMAGE_CONFIG.PRODUCT_IMAGES}${imagePath}`;
    case 'category':
      return `${IMAGE_CONFIG.CATEGORY_IMAGES}${imagePath}`;
    case 'profile':
      return `${IMAGE_CONFIG.PROFILE_IMAGES}${imagePath}`;
    default:
      return `${IMAGE_CONFIG.PRODUCT_IMAGES}${imagePath}`;
  }
};

export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
}; 