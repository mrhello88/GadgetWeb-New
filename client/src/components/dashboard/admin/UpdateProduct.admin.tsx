'use client';

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Upload,
  Plus,
  X,
  Check,
  Save,
  Smartphone,
  Laptop,
  Tablet,
  Headphones,
  BarChart3,
  Search,
  Edit,
  ChevronLeft,
  ChevronRight,
  Star,
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

import { GetAllProducts, GetProductById, UpdateProduct, GetProductsByCategory, GetCategories } from '../../../hooks/store/thunk/product.thunk';
import { refreshCategories } from '../../../hooks/store/slice/product.slices';
import { useLoadMore } from '../../../hooks/usePagination';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../hooks/store/store';
import { Product, productByCategory, productByCategoryResponse } from '../../../hooks/store/slice/product.slices';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

interface Specification {
  name: string;
  value: string;
}

// Type definition for product form state
interface ProductForm {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  brand: string;
  specifications: Specification[];
  features: string[];
  images: string[]; // Store image paths
  newImages?: File[]; // For new images being uploaded
}

interface FormErrors {
  images?: string;
  [key: string]: string | undefined;
}

// Category icons mapping
const CategoryIcon = ({ category }: { category: string }) => {
  switch (category) {
    case 'smartphones':
      return <Smartphone className="w-5 h-5" />;
    case 'laptops':
      return <Laptop className="w-5 h-5" />;
    case 'tablets':
      return <Tablet className="w-5 h-5" />;
    case 'headphones':
      return <Headphones className="w-5 h-5" />;
    default:
      return <BarChart3 className="w-5 h-5" />;
  }
};

// Category options
const categoryOptions = [
  { value: 'smartphones', label: 'Smartphones' },
  { value: 'laptops', label: 'Laptops' },
  { value: 'tablets', label: 'Tablets' },
  { value: 'headphones', label: 'Headphones' },
];

// Default specification templates by category
const defaultSpecifications: Record<string, Specification[]> = {
  smartphones: [
    { name: 'Display', value: '' },
    { name: 'Processor', value: '' },
    { name: 'RAM', value: '' },
    { name: 'Storage', value: '' },
    { name: 'Battery', value: '' },
    { name: 'Operating System', value: '' },
    { name: 'Rear Camera', value: '' },
    { name: 'Front Camera', value: '' },
  ],
  laptops: [
    { name: 'Display', value: '' },
    { name: 'Processor', value: '' },
    { name: 'RAM', value: '' },
    { name: 'Storage', value: '' },
    { name: 'Graphics', value: '' },
    { name: 'Operating System', value: '' },
    { name: 'Battery Life', value: '' },
  ],
  headphones: [
    { name: 'Type', value: '' },
    { name: 'Driver', value: '' },
    { name: 'Battery Life', value: '' },
    { name: 'Connectivity', value: '' },
    { name: 'Weight', value: '' },
    { name: 'Features', value: '' },
  ],
};

// Type guard for category response
const isProductByCategoryResponse = (
  data: any
): data is productByCategoryResponse => {
  return data && data.success && Array.isArray(data.data);
};

// Main UpdateProductPage component
const UpdateProductPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  // State for product selection
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [isProductSelected, setIsProductSelected] = useState(false);
  
  // Form state
  const [productForm, setProductForm] = useState<ProductForm>({
    _id: '',
    name: '',
    description: '',
    price: 0,
    category: '',
    brand: '',
    specifications: [],
    features: [''],
    images: [],
    newImages: [],
  });

  // UI state
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [showSuccessMessage, setShowSuccessMessage] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Redux state
  const { allProducts, loading, error, data } = useSelector((state: RootState) => state.product);
  const { loadMoreProducts } = useLoadMore();

  // Initial data fetch for product list
  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await dispatch(GetAllProducts({ limit: 20, offset: 0 })).unwrap();
        if (!result.success) {
          toast.error(result.message || 'Failed to fetch products');
          return;
        }
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to fetch products:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to fetch products');
      }
    };

    // Helper function to check if we have valid products data
    const hasValidProductsData = () => {
      return allProducts.data.length > 0;
    };
                      
    if (!isInitialized || !hasValidProductsData()) {
      fetchData();
    }
  }, [dispatch, isInitialized, allProducts.data]);

  // Get available categories for filter dropdown
  const availableCategories = [
    { id: 'all', name: 'All Categories' },
    ...categoryOptions.map(cat => ({ id: cat.value, name: cat.label }))
  ];

  // Filter products based on search term and selected category
  const filteredProducts = allProducts.data.filter(product => {
    const matchesSearch = !searchTerm || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || 
      product.category.toLowerCase() === selectedCategory.toLowerCase();
    
    return matchesSearch && matchesCategory;
  });
  
  // Load more products
  const handleLoadMore = () => {
    if (allProducts.hasMore && !allProducts.loading) {
      loadMoreProducts({
        currentData: allProducts.data,
        limit: 20,
        search: searchTerm || undefined
      });
    }
  };
  
  // If products list becomes empty but we thought we were initialized, reset initialization flag
  useEffect(() => {
    if (isInitialized && allProducts.data.length === 0 && !allProducts.loading && !selectedProductId) {
      setIsInitialized(false);
    }
  }, [isInitialized, allProducts.data.length, allProducts.loading, selectedProductId]);

  // Fetch product details when a product is selected
  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!selectedProductId) return;
      
      try {
        const result = await dispatch(GetProductById(selectedProductId)).unwrap();
        if (result.success && result.data) {
          const product = result.data;
          
          // Set form data from fetched product
          setProductForm({
            _id: product._id,
            name: product.name,
            description: product.description,
            price: parseFloat(product.price),
            category: product.category,
            brand: product.brand,
            specifications: product.specifications || [],
            features: product.features || [''],
            images: product.images || [],
            newImages: [],
          });
          
          // Set preview images
          const imageUrls = product.images.map((img: string) => 
            img.startsWith('http') ? img : `http://localhost:5000/images/${img}`
          );
          setPreviewImages(imageUrls);
          
          setIsProductSelected(true);
        } else {
          toast.error(result.message || 'Failed to fetch product details');
        }
      } catch (error) {
        console.error('Error fetching product details:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to fetch product details');
      }
    };
    
    fetchProductDetails();
  }, [dispatch, selectedProductId]);

  // Select a product to update
  const handleProductSelect = (productId: string) => {
    setSelectedProductId(productId);
  };

  // Reset product selection to choose another
  const handleResetSelection = () => {
    setSelectedProductId(null);
    setIsProductSelected(false);
    setProductForm({
      _id: '',
      name: '',
      description: '',
      price: 0,
      category: '',
      brand: '',
      specifications: [],
      features: [''],
      images: [],
      newImages: [],
    });
    setPreviewImages([]);
    setShowSuccessMessage(false);
  };

  // Get category label for display
// const getCategoryLabel = (categoryValue: string): string => {
//   const category = categoryOptions.find(opt => opt.value === categoryValue);
//   return category ? category.label : categoryValue;
// };

// Handle input change
const handleInputChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
) => {
  const { name, value } = e.target;

  // Handle numeric values
  if (name === 'price') {
    setProductForm((prev) => ({
      ...prev,
      [name]: parseFloat(value) || 0,
    }));
  } else {
    setProductForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

    // Clear error when field is updated
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Handle specification change
  const handleSpecChange = (index: number, field: 'name' | 'value', value: string) => {
    const updatedSpecs = [...(productForm.specifications || [])];
    updatedSpecs[index] = {
      ...updatedSpecs[index],
      [field]: value,
    };

    setProductForm((prev) => ({
      ...prev,
      specifications: updatedSpecs,
    }));
  };

  // Add a new specification
  const addSpecification = () => {
    setProductForm((prev) => ({
      ...prev,
      specifications: [...(prev.specifications || []), { name: '', value: '' }],
    }));
  };

  // Remove a specification
  const removeSpecification = (index: number) => {
    const updatedSpecs = [...(productForm.specifications || [])];
    updatedSpecs.splice(index, 1);

    setProductForm((prev) => ({
      ...prev,
      specifications: updatedSpecs,
    }));
  };

  // Handle feature change
  const handleFeatureChange = (index: number, value: string) => {
    const updatedFeatures = [...(productForm.features || [])];
    updatedFeatures[index] = value;

    setProductForm((prev) => ({
      ...prev,
      features: updatedFeatures,
    }));
  };

  // Add a new feature
  const addFeature = () => {
    setProductForm((prev) => ({
      ...prev,
      features: [...(prev.features || []), ''],
    }));
  };

  // Remove a feature
  const removeFeature = (index: number) => {
    const updatedFeatures = [...(productForm.features || [])];
    updatedFeatures.splice(index, 1);

    setProductForm((prev) => ({
      ...prev,
      features: updatedFeatures,
    }));
  };

  // Handle drag over for image upload
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  // Handle drag leave for image upload
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  // Handle drop for image upload
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleImageUpload(e.dataTransfer.files);
    }
  };

  // Handle image upload via input file
  const handleImageUploadClick = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      handleImageUpload(e.target.files);
    }
  };

  // Process the image files
  const handleImageUpload = (files: FileList) => {
    // Limit to 5 total images (existing + new)
    const remainingSlots = 5 - (productForm.images.length + (productForm.newImages?.length || 0));
    if (remainingSlots <= 0) {
      setFormErrors((prev) => ({
        ...prev,
        images: 'Maximum 5 images allowed',
      }));
      return;
    }

    const newPreviewImages: string[] = [];
    const newImageFiles: File[] = [];

    Array.from(files)
      .slice(0, remainingSlots) // Limit to remaining slots
      .forEach((file) => {
        if (!file.type.startsWith('image/')) {
          setFormErrors((prev) => ({
            ...prev,
            images: 'Only image files are allowed',
          }));
          return;
        }
        // Create preview URL for UI
        const previewUrl = URL.createObjectURL(file);
        newPreviewImages.push(previewUrl);
        newImageFiles.push(file); // Store actual File object
      });

    if (newImageFiles.length > 0) {
      // Add new previews to existing ones
      setPreviewImages([...previewImages, ...newPreviewImages]);
      
      // Add new files to newImages array in form
      setProductForm((prev) => ({
        ...prev,
        newImages: [...(prev.newImages || []), ...newImageFiles],
      }));

      // Clear error if it exists
      if (formErrors.images) {
        setFormErrors((prev) => ({
          ...prev,
          images: '',
        }));
      }
    }
  };

  // Clean up preview URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      previewImages.forEach((url) => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [previewImages]);

  // Remove an existing image
  const removeImage = (index: number) => {
    // Check if we're removing an existing image or a new one
    const isExistingImage = index < productForm.images.length;
    
    if (isExistingImage) {
      // Remove from existing images
      const updatedImages = [...productForm.images];
      updatedImages.splice(index, 1);
      
      // Also update preview images
      const updatedPreviews = [...previewImages];
      updatedPreviews.splice(index, 1);
      
      setProductForm(prev => ({ ...prev, images: updatedImages }));
      setPreviewImages(updatedPreviews);
    } else {
      // Remove from new images
      const newImageIndex = index - productForm.images.length;
      const updatedNewImages = [...(productForm.newImages || [])];
      updatedNewImages.splice(newImageIndex, 1);
      
      // Also update preview images
      const updatedPreviews = [...previewImages];
      updatedPreviews.splice(index, 1);
      
      setProductForm(prev => ({ ...prev, newImages: updatedNewImages }));
      setPreviewImages(updatedPreviews);
    }
  };

  // Validate the form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Basic field validation
    if (!productForm.name) {
      errors.name = 'Product name is required';
    } else if (/^\d+$/.test(productForm.name)) {
      errors.name = 'Product name cannot contain only numbers';
    }
    
    if (!productForm.description) {
      errors.description = 'Product description is required';
    }
    
    if (!productForm.price || productForm.price <= 0) {
      errors.price = 'Valid price is required (must be greater than zero)';
    }
    
    if (!productForm.category) {
      errors.category = 'Category is required';
    }
    
    if (!productForm.brand) {
      errors.brand = 'Brand is required';
    }
    
    // Check if there are images (either existing or new)
    if (
      (!productForm.images || productForm.images.length === 0) && 
      (!productForm.newImages || productForm.newImages.length === 0)
    ) {
      errors.images = 'At least one product image is required';
    }

    // Specifications validation
    if (!productForm.specifications || productForm.specifications.length === 0) {
      errors.specifications = 'At least one specification is required';
    } else {
      const hasEmptySpec = productForm.specifications.some((spec) => !spec.name || !spec.value);
      if (hasEmptySpec) {
        errors.specifications = 'All specifications must have both name and value';
      }
    }

    // Features validation
    if (!productForm.features || productForm.features.length === 0) {
      errors.features = 'At least one feature is required';
    } else {
      const hasEmptyFeature = productForm.features.some(feature => !feature.trim());
      if (hasEmptyFeature) {
        errors.features = 'Features cannot be empty';
      }
    }

    // Show errors in toast notifications
    if (Object.keys(errors).length > 0) {
      // Show the first error in a toast
      const firstError = Object.values(errors)[0];
      toast.error(firstError);
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (validateForm()) {
        // Handle image uploads if there are new images
        let allImageNames = [...productForm.images]; // Start with existing images
        
        if (productForm.newImages && productForm.newImages.length > 0) {
          // Upload new images
          const uploadImage = async (file: File) => {
            const formData = new FormData();
            formData.append('images', file);

            const response = await axios.post(`http://localhost:5000/api/upload`, formData);
            const fileNames = response.data.fileNames;
            return fileNames && fileNames.length > 0 ? fileNames[0] : null;
          };

          const uploadedImageNames = (await Promise.all(productForm.newImages.map(uploadImage)))
            .filter(Boolean);
            
          // Add new uploaded image names to the existing ones
          allImageNames = [...allImageNames, ...uploadedImageNames as string[]];
        }

        // Prepare the product data for update
        const productData = {
          name: productForm.name,
          description: productForm.description,
          price: productForm.price,
          category: productForm.category,
          brand: productForm.brand,
          specifications: productForm.specifications,
          features: productForm.features,
          images: allImageNames,
        };
        
        // Dispatch the update action
        const result = await dispatch(UpdateProduct({
          productId: productForm._id,
          productData
        })).unwrap();
        
        if (result.success) {
          setShowSuccessMessage(true);
          toast.success('Product updated successfully');
          
          // Refresh categories in Redux store to update navbar
          dispatch(refreshCategories());
          dispatch(GetCategories({ limit: 50, offset: 0 }));
          
          // IMPORTANT: Refresh the products list to show updated data
          await dispatch(GetAllProducts({ limit: 20, offset: 0 }));
          
          // Also refresh the specific product details if we want to stay on the edit form
          if (selectedProductId) {
            const updatedProductResult = await dispatch(GetProductById(selectedProductId)).unwrap();
            if (updatedProductResult.success && updatedProductResult.data) {
              const updatedProduct = updatedProductResult.data;
              
              // Update form with fresh data
              setProductForm({
                _id: updatedProduct._id,
                name: updatedProduct.name,
                description: updatedProduct.description,
                price: parseFloat(updatedProduct.price),
                category: updatedProduct.category,
                brand: updatedProduct.brand,
                specifications: updatedProduct.specifications || [],
                features: updatedProduct.features || [''],
                images: updatedProduct.images || [],
                newImages: [],
              });
              
              // Update preview images with fresh data
              const imageUrls = updatedProduct.images.map((img: string) => 
                img.startsWith('http') ? img : `http://localhost:5000/images/${img}`
              );
              setPreviewImages(imageUrls);
            }
          }
          
          // Auto-hide success message and optionally reset form after delay
          setTimeout(() => {
            setShowSuccessMessage(false);
            // Uncomment the line below if you want to go back to product selection after update
            // handleResetSelection();
          }, 3000);
        } else {
          toast.error(result.message || 'Failed to update product');
        }
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || 'Error during form submission');
        console.error('Error during form submission:', error);
      }
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

  // Show loading state while initializing or loading products
  if (!isInitialized || (loading && !selectedProductId)) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        <span className="ml-2">Loading products...</span>
      </div>
    );
  }

  // Display product selection interface if no product is selected
  if (!isProductSelected) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Helmet>
          <title>Update Product | Admin Dashboard</title>
          <meta name="description" content="Update existing products in your inventory" />
        </Helmet>
        
        {/* Header Section */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center justify-center mb-4">
                <Link
                  to="/dashboard"
                  className="mr-4 p-2 text-blue-100 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-6 h-6" />
                </Link>
                <motion.h1
                  className="text-4xl md:text-5xl font-bold"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                >
                  Update Products
                </motion.h1>
              </div>
              <motion.p
                className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.4 }}
              >
                Select a product from your inventory to update its information, pricing, or specifications.
                Browse through categories to find the product you want to modify.
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
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                {/* Category Filter */}
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <CategoryIcon category={selectedCategory} />
                  </div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white appearance-none"
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
                  Showing {filteredProducts.length} of {allProducts.total} products
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
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
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
          {/* Group products by category for display */}
          {(() => {
            const productsByCategory = filteredProducts.reduce((acc, product) => {
              const category = product.category || 'Uncategorized';
              if (!acc[category]) {
                acc[category] = [];
              }
              acc[category].push(product);
              return acc;
            }, {} as Record<string, Product[]>);

            return Object.entries(productsByCategory).map(([categoryName, products], index) => (
              <motion.section
                key={categoryName}
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
                      <div className="relative rounded-xl overflow-hidden aspect-[4/3] bg-gradient-to-br from-blue-400 to-blue-600">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <CategoryIcon category={categoryName.toLowerCase()} />
                          <div className="ml-4">
                            <h2 className="text-3xl font-bold text-white mb-2">{categoryName}</h2>
                            <p className="text-white/90">{products.length} products available</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      className="w-full md:w-2/3"
                      variants={fadeInUp}
                    >
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold text-gray-900">
                          Update <span className="text-blue-500">{categoryName}</span> Products
                        </h3>
                        <div className="flex gap-2">
                          <motion.button
                            onClick={() => scroll(categoryName, 'left')}
                            className="p-2 rounded-full bg-blue-100 text-blue-500 hover:bg-blue-200 transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            aria-label={`Scroll ${categoryName} left`}
                          >
                            <ChevronLeft className="h-5 w-5" />
                          </motion.button>
                          <motion.button
                            onClick={() => scroll(categoryName, 'right')}
                            className="p-2 rounded-full bg-blue-100 text-blue-500 hover:bg-blue-200 transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            aria-label={`Scroll ${categoryName} right`}
                          >
                            <ChevronRight className="h-5 w-5" />
                          </motion.button>
                        </div>
                      </div>

                      <div
                        id={`product-container-${categoryName}`}
                        className="flex overflow-x-auto gap-6 pb-4 snap-x snap-mandatory hide-scrollbar"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                      >
                        {products.map((product) => (
                          <motion.div
                            key={product._id}
                            className="min-w-[280px] max-w-[280px] bg-white rounded-xl shadow-md overflow-hidden snap-start border border-blue-100"
                            whileHover={{ y: -10 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 10 }}
                          >
                            <div className="h-40 overflow-hidden bg-gray-100 flex items-center justify-center relative">
                              <img
                                src={
                                  product.images && product.images.length > 0
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
                                  onClick={() => handleProductSelect(product._id)}
                                  className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors shadow-lg"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  title="Edit Product"
                                >
                                  <Edit className="h-4 w-4" />
                                </motion.button>
                              </div>
                            </div>
                            <div className="p-4">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="text-lg font-semibold text-gray-900">{product.name}</h4>
                                <span className="text-lg font-bold text-blue-500">
                                  ${Number(product.price).toFixed(2)}
                                </span>
                              </div>
                              <p className="text-gray-600 text-sm mb-2">Brand: {product.brand}</p>
                              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                {product.description || 'No description available'}
                              </p>
                              <div className="flex gap-2">
                                <Link
                                  to={`/product/${product._id}`}
                                  className="flex-1 py-2 px-3 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors text-center"
                                >
                                  View Details
                                </Link>
                                <button
                                  onClick={() => handleProductSelect(product._id)}
                                  className="py-2 px-3 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-1"
                                >
                                  <Edit className="h-4 w-4" />
                                  Edit
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.section>
            ));
          })()}
          
          {filteredProducts.length === 0 && (
            <motion.div
              className="text-center py-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <h3 className="text-2xl font-semibold text-gray-600 mb-4">No Products Found</h3>
              <p className="text-gray-500 mb-8">
                {searchTerm || selectedCategory !== 'all'
                  ? 'Try adjusting your search criteria or filters.'
                  : 'No products are currently available for updating.'}
              </p>
              {(searchTerm || selectedCategory !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                  }}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
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
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>Update Product | Admin Dashboard</title>
        <meta name="description" content="Update an existing product in your inventory" />
      </Helmet>

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={handleResetSelection}
            className="mr-4 p-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl md:text-3xl font-bold">Update Product</h1>
        </div>
      </div>

      {/* Success Message */}
      {showSuccessMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-primary-50 border border-primary-200 rounded-lg text-primary-700 flex items-center"
        >
          <Check className="w-5 h-5 mr-2 text-primary-500" />
          <span>
            Product successfully updated! The changes are now visible.
          </span>
        </motion.div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="bg-white shadow-md rounded-xl overflow-hidden"
          >
            {/* Basic Information Section */}
            <div className="bg-gradient-to-r from-teal-500 to-teal-600 p-4 text-white">
              <h2 className="text-xl font-bold">Basic Information</h2>
            </div>

            <div className="p-6 space-y-6">
              {/* Product Name */}
              <motion.div variants={fadeInUp}>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name*
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={productForm.name}
                  onChange={handleInputChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                    formErrors.name ? 'border-error-500 bg-error-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter product name"
                />
                {formErrors.name && <p className="mt-1 text-sm text-error-600">{formErrors.name}</p>}
              </motion.div>

              {/* Brand */}
              <motion.div variants={fadeInUp}>
                <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">
                  Brand*
                </label>
                <input
                  type="text"
                  id="brand"
                  name="brand"
                  value={productForm.brand}
                  onChange={handleInputChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                    formErrors.brand ? 'border-error-500 bg-error-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter brand name"
                />
                {formErrors.brand && (
                  <p className="mt-1 text-sm text-error-600">{formErrors.brand}</p>
                )}
              </motion.div>              {/* Category - Read Only */}
              <motion.div variants={fadeInUp}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <div className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 flex items-center gap-2">
                  <CategoryIcon category={productForm.category || ''} />
                  <span className="text-gray-700">
                    {categoryOptions.find(opt => opt.value === productForm.category)?.label || productForm.category}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-500">Category cannot be changed</p>
              </motion.div>

              {/* Price */}
              <motion.div variants={fadeInUp}>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                  Price*
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    $
                  </span>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={productForm.price || ''}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className={`w-full p-3 pl-8 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                      formErrors.price ? 'border-error-500 bg-error-50' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                  />
                </div>
                {formErrors.price && (
                  <p className="mt-1 text-sm text-error-600">{formErrors.price}</p>
                )}
              </motion.div>

              {/* Description */}
              <motion.div variants={fadeInUp}>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description*
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={productForm.description}
                  onChange={handleInputChange}
                  rows={4}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                    formErrors.description ? 'border-error-500 bg-error-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter detailed product description"
                ></textarea>
                {formErrors.description && (
                  <p className="mt-1 text-sm text-error-600">{formErrors.description}</p>
                )}
              </motion.div>
            </div>
          </motion.div>

          {/* Images Section */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="bg-white shadow-md rounded-xl overflow-hidden"
          >
            <div className="bg-gradient-to-r from-pink-500 to-pink-600 p-4 text-white">
              <h2 className="text-xl font-bold">Product Images</h2>
            </div>

            <div className="p-6 space-y-6">
              {/* Image Upload */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center ${
                  dragActive
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-300 hover:border-primary-400'
                } ${formErrors.images ? 'bg-error-50 border-error-300' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-2">Drag and drop new images here, or click to browse</p>
                <p className="text-xs text-gray-500 mb-4">
                  Supported formats: JPG, PNG, WebP. Max size: 5MB each. Maximum 5 images total.
                </p>
                <input
                  type="file"
                  id="image-upload"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageUploadClick}
                />
                <label
                  htmlFor="image-upload"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 cursor-pointer"
                >
                  Browse Files
                </label>
                {formErrors.images && (
                  <p className="mt-3 text-sm text-error-600">{formErrors.images}</p>
                )}
              </div>

              {/* Image Previews */}
              {previewImages.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {previewImages.map((src, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-w-1 aspect-h-1 overflow-hidden rounded-lg bg-gray-100">
                        <img
                          src={src}
                          alt={`Preview ${index + 1}`}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 p-1 bg-error-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Specifications Section */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="bg-white shadow-md rounded-xl overflow-hidden"
          >
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-4 text-white">
              <h2 className="text-xl font-bold">Specifications</h2>
            </div>

            <div className="p-6 space-y-6">
              {formErrors.specifications && (
                <div className="p-3 bg-error-50 border border-error-200 rounded-lg text-error-600 text-sm">
                  {formErrors.specifications}
                </div>
              )}

              {/* Specification Inputs */}
              <div className="space-y-4">
                {productForm.specifications?.map((spec, index) => (
                  <div key={index} className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={spec.name}
                        onChange={(e) => handleSpecChange(index, 'name', e.target.value)}
                        placeholder="Specification name"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-warning-500 focus:border-warning-500"
                      />
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={spec.value}
                        onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                        placeholder="Specification value"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-warning-500 focus:border-warning-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSpecification(index)}
                      className="p-3 text-error-500 hover:text-error-700 focus:outline-none"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Specification Button */}
              <button
                type="button"
                onClick={addSpecification}
                className="inline-flex items-center px-4 py-2 border border-warning-300 text-sm font-medium rounded-md text-warning-700 bg-warning-50 hover:bg-warning-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-warning-500"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Specification
              </button>
            </div>
          </motion.div>

          {/* Features Section */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="bg-white shadow-md rounded-xl overflow-hidden"
          >
            <div className="bg-gradient-to-r from-teal-500 to-teal-600 p-4 text-white">
              <h2 className="text-xl font-bold">Key Features</h2>
            </div>

            <div className="p-6 space-y-6">
              {formErrors.features && (
                <div className="p-3 bg-error-50 border border-error-200 rounded-lg text-error-600 text-sm">
                  {formErrors.features}
                </div>
              )}

              {/* Feature Inputs */}
              <div className="space-y-4">
                {productForm.features?.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => handleFeatureChange(index, e.target.value)}
                        placeholder="Enter a key feature"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="p-3 text-error-500 hover:text-error-700 focus:outline-none"
                      disabled={productForm.features?.length === 1}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Feature Button */}
              <button
                type="button"
                onClick={addFeature}
                className="inline-flex items-center px-4 py-2 border border-primary-300 text-sm font-medium rounded-md text-primary-700 bg-primary-50 hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Feature
              </button>
            </div>
          </motion.div>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <button
              type="button"
              onClick={handleResetSelection}
              className="px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Updating...
                </div>
              ) : (
                <div className="flex items-center">
                  <Save className="w-5 h-5 mr-2" />
                  Update Product
                </div>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default UpdateProductPage;