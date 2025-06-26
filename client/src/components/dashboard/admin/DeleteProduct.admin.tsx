import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Star, ChevronLeft, ChevronRight, Trash2, Search, Filter } from 'lucide-react';
import { AppDispatch, RootState } from '../../../hooks/store/store';
import { GetAllProducts, DeleteProduct, GetCategories } from '../../../hooks/store/thunk/product.thunk';
import type {
  productResponse,
  productByCategoryResponse,
  DeleteProductResponse,
  Product,
  productByCategory,
} from '../../../hooks/store/slice/product.slices';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

// Format price utility
const formatPrice = (price: string | number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(typeof price === 'string' ? parseFloat(price) : price);
};

// Type guard for category response
const isProductByCategoryResponse = (
  data: any
): data is productByCategoryResponse => {
  return data && data.success && Array.isArray(data.data);
};

const DeleteProductComponent = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isInitialized, setIsInitialized] = useState(false);
  const [categoriesWithProducts, setCategoriesWithProducts] = useState<productByCategory[]>([]);

  const { loading, error, categories } = useSelector((state: RootState) => state.product);

  // Initial data fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await dispatch(GetCategories({ limit: 20, offset: 0 })).unwrap();
        if (!result.success) {
          toast.error(result.message || 'Failed to fetch categories');
          return;
        }
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to fetch categories');
      }
    };

    if (!isInitialized) {
      fetchData();
    }
  }, [dispatch, isInitialized]);

  // Handle data response from GetCategories
  useEffect(() => {
    if (categories && categories.data && Array.isArray(categories.data)) {
      setCategoriesWithProducts(categories.data as productByCategory[]);
    } else {
      setCategoriesWithProducts([]);
    }
  }, [categories]);

  // Get all products from all categories with safety checks
  const allProducts = categoriesWithProducts.flatMap(category => 
    category.products ? category.products.filter(product => product && product._id) : []
  );
  
  // Get available categories for filter dropdown
  const availableCategories = categoriesWithProducts.map(cat => ({
    id: cat._id,
    name: cat.category
  }));

  // Filter categories and products based on search term and selected category
  const filteredCategories = categoriesWithProducts.filter(category => {
    if (!category || !category.products) return false;
    
    // If a specific category is selected, only show that category
    if (selectedCategory !== 'all' && category._id !== selectedCategory) {
      return false;
    }
    
    // Filter products within the category based on search term
    const filteredProducts = category.products.filter(product => {
      if (!product || !product._id) return false;
      
      const matchesSearch = !searchTerm || 
        (product.name && product.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase()));
      
      return matchesSearch;
    });
    
    return filteredProducts.length > 0;
  }).map(category => ({
    ...category,
    products: category.products.filter(product => {
      if (!product || !product._id) return false;
      
      const matchesSearch = !searchTerm || 
        (product.name && product.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase()));
      
      return matchesSearch;
    })
  }));

  const handleDelete = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }
    
    try {
      const result = await dispatch(DeleteProduct(productId)).unwrap();
      if (result.success) {
        toast.success(result.message);
        // Refresh the categories and products
        dispatch(GetCategories({ limit: 20, offset: 0 }));
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete product');
    }
  };

  // Scroll function for horizontal product lists
  const scroll = (categoryId: string, direction: 'left' | 'right') => {
    const container = document.getElementById(`product-container-${categoryId}`);
    if (container) {
      const scrollAmount = 300;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  // Show loading state while initializing or loading
  if (!isInitialized || loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <section className="bg-gradient-to-r from-red-600 to-red-800 text-white py-16">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.h1
              className="text-4xl md:text-5xl font-bold mb-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              Delete Products
            </motion.h1>
            <motion.p
              className="text-xl text-red-100 mb-8 max-w-3xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.4 }}
            >
              Manage your product inventory by removing outdated or discontinued items.
              Browse through categories and delete products as needed.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8 bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {/* Category Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent bg-white appearance-none"
                >
                  <option value="all">All Categories</option>
                  {availableCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Results Counter */}
            <div className="flex justify-between items-center">
              <p className="text-gray-600">
                Showing {filteredCategories.reduce((acc, cat) => acc + (cat.products?.length || 0), 0)} products
                {searchTerm && <span className="ml-1">for "{searchTerm}"</span>}
                {selectedCategory !== 'all' && (
                  <span className="ml-1">
                    in {availableCategories.find(cat => cat.id === selectedCategory)?.name}
                  </span>
                )}
              </p>
              {(searchTerm || selectedCategory !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                  }}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Category Sections */}
      <div className="pb-16">
        {filteredCategories.length > 0 ? (
          filteredCategories.map((category, index) => (
            <motion.section
              key={category._id}
              className={`py-16 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} relative`}
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row items-center gap-8 mb-10">
                  <motion.div
                    className="w-full md:w-1/3"
                    variants={fadeInUp}
                  >
                    <div className="relative rounded-xl overflow-hidden aspect-[4/3]">
                      <img
                        src={
                          category.image?.startsWith('http')
                            ? category.image
                            : `http://localhost:5000/categoryImage/${category.image}`
                        }
                        alt={category.category}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder.svg';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <h2 className="text-3xl font-bold text-white mb-2">{category.category}</h2>
                        <p className="text-white/90">{category.description}</p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    className="w-full md:w-2/3"
                    variants={fadeInUp}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-bold text-gray-900">
                        Delete <span className="text-red-500">{category.category}</span> Products
                      </h3>
                      <div className="flex gap-2">
                        <motion.button
                          onClick={() => scroll(category._id, 'left')}
                          className="p-2 rounded-full bg-red-100 text-red-500 hover:bg-red-200 transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          aria-label={`Scroll ${category.category} left`}
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </motion.button>
                        <motion.button
                          onClick={() => scroll(category._id, 'right')}
                          className="p-2 rounded-full bg-red-100 text-red-500 hover:bg-red-200 transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          aria-label={`Scroll ${category.category} right`}
                        >
                          <ChevronRight className="h-5 w-5" />
                        </motion.button>
                      </div>
                    </div>

                    <div
                      id={`product-container-${category._id}`}
                      className="flex overflow-x-auto gap-6 pb-4 snap-x snap-mandatory hide-scrollbar"
                      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                      {category.products && category.products.length > 0 ? (
                        category.products.map((product) => (
                          <motion.div
                            key={product._id}
                            className="min-w-[280px] max-w-[280px] bg-white rounded-xl shadow-md overflow-hidden snap-start border border-red-100"
                            whileHover={{ y: -10 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 10 }}
                          >
                            <div className="h-40 overflow-hidden bg-gray-100 flex items-center justify-center relative">
                              <img
                                src={
                                  product.images && product.images[0]
                                    ? product.images[0].startsWith('http')
                                      ? product.images[0]
                                      : `http://localhost:5000/images/${product.images[0]}`
                                    : '/placeholder.svg'
                                }
                                alt={product.name}
                                className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = '/placeholder.svg';
                                }}
                              />
                              <div className="absolute top-2 right-2">
                                <motion.button
                                  onClick={() => handleDelete(product._id)}
                                  className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  title="Delete Product"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </motion.button>
                              </div>
                            </div>
                            <div className="p-4">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="text-lg font-semibold text-gray-900">{product.name}</h4>
                                <span className="text-lg font-bold text-red-500">
                                  {formatPrice(product.price)}
                                </span>
                              </div>
                              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                {product.description}
                              </p>
                              {/* Displaying product rating with stars */}
                              {product.rating && product.rating > 0 && product.reviewCount && product.reviewCount > 0 && (
                                <div className="flex items-center mb-4">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-4 w-4 ${
                                        i < Math.floor(product.rating || 0) ? 'text-yellow-500' : 'text-gray-300'
                                      }`}
                                      fill={i < Math.floor(product.rating || 0) ? 'currentColor' : 'none'}
                                    />
                                  ))}
                                  <span className="text-sm text-gray-600 ml-1">{product.rating.toFixed(1)}</span>
                                </div>
                              )}
                              <div className="flex gap-2">
                                <Link
                                  to={`/product/${product._id}`}
                                  className="flex-1 py-2 px-3 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors text-center"
                                >
                                  View Details
                                </Link>
                                <button
                                  onClick={() => handleDelete(product._id)}
                                  className="py-2 px-3 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors flex items-center gap-1"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Delete
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <div className="w-full text-center py-8 text-gray-500">
                          No products available in this category.
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.section>
          ))
        ) : (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h3 className="text-2xl font-semibold text-gray-600 mb-4">No Products Found</h3>
            <p className="text-gray-500 mb-8">
              {searchTerm || selectedCategory !== 'all'
                ? 'Try adjusting your search criteria or filters.'
                : 'No products are currently available for deletion.'}
            </p>
            {(searchTerm || selectedCategory !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
                className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </motion.div>
        )}
      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default DeleteProductComponent;

