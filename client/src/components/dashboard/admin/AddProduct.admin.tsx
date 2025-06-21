// AddProductPage.tsx
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
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

import { AddProduct, GetCategories } from '../../../hooks/store/thunk/product.thunk';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../hooks/store/store';

// Import animated decorations
const CircleDecoration = ({ className }: { className: string }) => (
  <svg className={className} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="50" fill="currentColor" />
  </svg>
);

const TriangleDecoration = ({ className }: { className: string }) => (
  <svg className={className} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <polygon points="50,0 100,100 0,100" fill="currentColor" />
  </svg>
);

const SquareDecoration = ({ className }: { className: string }) => (
  <svg className={className} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" fill="currentColor" />
  </svg>
);

const HexagonDecoration = ({ className }: { className: string }) => (
  <svg className={className} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <polygon points="50,0 100,25 100,75 50,100 0,75 0,25" fill="currentColor" />
  </svg>
);

// Animation variants
// const fadeIn = {
//   hidden: { opacity: 0 },
//   visible: {
//     opacity: 1,
//     transition: { duration: 0.6, ease: 'easeOut' },
//   },
// };

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

// const floatingAnimation = {
//   initial: { y: 0 },
//   animate: {
//     y: [0, -15, 0],
//     transition: {
//       duration: 6,
//       repeat: Infinity,
//       repeatType: 'reverse',
//       ease: 'easeInOut',
//     },
//   },
// };

const rotateAnimation = {
  initial: { rotate: 0 },
  animate: {
    rotate: 360,
    transition: {
      duration: 20,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

interface Specification {
  name: string;
  value: string;
}
// Type definitions
// Assuming Product type for state
interface Product {
  name: string;
  description: string;
  price: number;
  category: string;
  brand: string;
  specifications: Specification[];
  features: string[];
  images: File[]; // Store File objects, not strings
}

interface FormErrors {
  images?: string;
  [key: string]: string | undefined;
}

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
    { name: 'Brand', value: '' },
  ],
  laptops: [
    { name: 'Display', value: '' },
    { name: 'Processor', value: '' },
    { name: 'RAM', value: '' },
    { name: 'Storage', value: '' },
    { name: 'Graphics', value: '' },
    { name: 'Operating System', value: '' },
    { name: 'Battery Life', value: '' },
    { name: 'Brand', value: '' },
  ],
  headphones: [
    { name: 'Type', value: '' },
    { name: 'Driver', value: '' },
    { name: 'Battery Life', value: '' },
    { name: 'Connectivity', value: '' },
    { name: 'Weight', value: '' },
    { name: 'Features', value: '' },
    { name: 'Brand', value: '' },
  ],
};

// Main AddProductPage component
const AddProductPage = () => {
  const navigate = useNavigate();

  // Redux hooks for categories
  const dispatch = useDispatch<AppDispatch>();
  const productState = useSelector((state: RootState) => state.product);
  const categories = (() => {
    if (productState.categories && productState.categories.data) {
      // Use the categories from GetCategories
      const categoryMap = new Map();
      productState.categories.data.forEach((cat, index) => {
        if (!categoryMap.has(cat.category)) {
          categoryMap.set(cat.category, {
            value: cat.category,
            label: cat.category,
            id: `${cat.category}-${index}` // Unique ID to prevent key conflicts
          });
        }
      });
      return Array.from(categoryMap.values());
    }
    return [];
  })();

  // Form state
  const [product, setProduct] = useState<Product>({
    name: '',
    description: '',
    price: 0,
    category: '',
    brand: '',
    specifications: [],
    features: [''],
    images: [],
  });

  // UI state
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [showSuccessMessage, setShowSuccessMessage] = useState<boolean>(false);

  // Fetch categories on mount
  useEffect(() => {
    dispatch(GetCategories({ 
      limit: 50, 
      offset: 0 
    }));
  }, [dispatch]);

  // Initialize specifications when category changes
  useEffect(() => {
    if (product.category && defaultSpecifications[product.category]) {
      setProduct((prev) => ({
        ...prev,
        specifications: [...defaultSpecifications[product.category ?? '']],
      }));
    }
  }, [product.category]);

  // Handle input change
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Handle numeric values
    if (name === 'price') {
      setProduct((prev) => ({
        ...prev,
        [name]: parseFloat(value) || 0,
      }));
    } else {
      setProduct((prev) => ({
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
    const updatedSpecs = [...(product.specifications || [])];
    updatedSpecs[index] = {
      ...updatedSpecs[index],
      [field]: value,
    };

    setProduct((prev) => ({
      ...prev,
      specifications: updatedSpecs,
    }));
  };

  // Add a new specification
  const addSpecification = () => {
    setProduct((prev) => ({
      ...prev,
      specifications: [...(prev.specifications || []), { name: '', value: '' }],
    }));
  };

  // Remove a specification
  const removeSpecification = (index: number) => {
    const updatedSpecs = [...(product.specifications || [])];
    updatedSpecs.splice(index, 1);

    setProduct((prev) => ({
      ...prev,
      specifications: updatedSpecs,
    }));
  };

  // Handle feature change
  const handleFeatureChange = (index: number, value: string) => {
    const updatedFeatures = [...(product.features || [])];
    updatedFeatures[index] = value;

    setProduct((prev) => ({
      ...prev,
      features: updatedFeatures,
    }));
  };

  // Add a new feature
  const addFeature = () => {
    setProduct((prev) => ({
      ...prev,
      features: [...(prev.features || []), ''],
    }));
  };

  // Remove a feature
  const removeFeature = (index: number) => {
    const updatedFeatures = [...(product.features || [])];
    updatedFeatures.splice(index, 1);

    setProduct((prev) => ({
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
    const newPreviewImages: string[] = [];
    const newImageFiles: File[] = [];

    Array.from(files)
      .slice(0, 5 - product.images.length) // Limit to 5 total images
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
      setPreviewImages([...previewImages, ...newPreviewImages]);
      setProduct((prev) => ({
        ...prev,
        images: [...prev.images, ...newImageFiles], // Store File objects
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
      previewImages.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewImages]);

  // Remove an image
  const removeImage = (index: number) => {
    const updatedPreviewImages = [...previewImages];
    const updatedImages = [...(product.images || [])];

    updatedPreviewImages.splice(index, 1);
    updatedImages.splice(index, 1);

    setPreviewImages(updatedPreviewImages);
    setProduct((prev) => ({
      ...prev,
      images: updatedImages,
    }));
  };

  // Validate the form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Required text/number fields validation
    if (!product.name) {
      errors.name = 'Product name is required';
    } else if (/^\d+$/.test(product.name)) {
      errors.name = 'Product name cannot contain only numbers';
    }

    if (!product.description) {
      errors.description = 'Product description is required';
    }

    if (!product.price || product.price <= 0) {
      errors.price = 'Valid price is required (must be greater than zero)';
    }

    if (!product.category) {
      errors.category = 'Category is required';
    }

    if (!product.brand) {
      errors.brand = 'Brand is required';
    }

    // Image validation
    if (!product.images || product.images.length === 0) {
      errors.images = 'At least one product image is required';
    }

    // Specifications validation
    if (!product.specifications || product.specifications.length === 0) {
      errors.specifications = 'At least one specification is required';
    } else {
      const hasEmptySpec = product.specifications.some((spec) => !spec.name || !spec.value);
      if (hasEmptySpec) {
        errors.specifications = 'All specifications must have both name and value';
      }
    }

    // Features validation
    if (!product.features || product.features.length === 0) {
      errors.features = 'At least one feature is required';
    } else {
      const hasEmptyFeature = product.features.some(feature => !feature.trim());
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
        // In a real app, you'd send this to your API
        const uploadImage = async (file: File) => {
          const formData = new FormData();
          formData.append('images', file);

          const response = await axios.post(`http://localhost:5000/api/upload`, formData);

          const fileNames = response.data.fileNames;
          return fileNames && fileNames.length > 0 ? fileNames[0] : null;
        };

        const uploadedImageNames = (await Promise.all(product.images.map(uploadImage))).filter(
          Boolean
        );

        const productWithImages = {
          ...product,
          images: uploadedImageNames, // Just the file names
        };
        
        await dispatch(AddProduct(productWithImages)).then((res) => {
          if (res?.payload?.success) {
            setShowSuccessMessage(true);
            setProduct({
              name: '',
              description: '',
              price: 0,
              category: '',
              brand: '',
              specifications: [],
              features: [''],
              images: [],
            });
            toast.success(res?.payload?.message || 'this is add product response');
          } else {
            // Handle error case
            setFormErrors((prev) => ({
              ...prev,
              submit: res?.payload?.message || 'Failed to add product',
            }));

            toast.error(res?.payload?.message || 'Failed to add product');
          }
        });
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || 'Error during form submission of Add Product');
        // console.error('Error during form submission:', error);
      }
    }
  };

  // Generate a random product ID (for demo purposes)
  const generateProductId = () => {
    return `${product.category?.slice(0, 2) || 'prod'}-${Math.floor(Math.random() * 10000)}`;
  };

  return (
    <>
      <Helmet>
        <title>Add New Product | Admin Dashboard</title>
        <meta name="description" content="Add a new product to your inventory" />
      </Helmet>

      {/* Background Shapes */}
      <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none">
        <TriangleDecoration className="absolute top-0 right-0 w-64 h-64 text-primary-100 opacity-40 transform -translate-y-32 translate-x-16" />
        <CircleDecoration className="absolute bottom-0 left-0 w-96 h-96 text-pink-100 opacity-30 transform translate-y-24 -translate-x-24" />
        <SquareDecoration className="absolute top-1/3 left-1/4 w-32 h-32 text-warning-100 opacity-30 transform -rotate-15" />
        <HexagonDecoration className="absolute top-3/4 right-1/4 w-48 h-48 text-primary-100 opacity-20" />

        <motion.div
          initial="initial"
          animate="animate"
          variants={rotateAnimation}
          className="absolute top-1/4 left-1/2 w-72 h-72 text-warning-100 opacity-30"
        >
          <HexagonDecoration className="w-full h-full" />
        </motion.div>

        <motion.div
          initial="initial"
          animate="animate"
          variants={rotateAnimation}
          className="absolute top-2/3 left-1/3 w-48 h-48 text-primary-100 opacity-20"
        >
          <CircleDecoration className="w-full h-full" />
        </motion.div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <Link
              to="/admin/products"
              className="mr-4 p-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold">Add New Product</h1>
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
              Product successfully added with ID: <strong>{generateProductId()}</strong>
            </span>
          </motion.div>
        )}

        {/* Form */}
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
                  value={product.name}
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
                  value={product.brand}
                  onChange={handleInputChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                    formErrors.brand ? 'border-error-500 bg-error-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter brand name"
                />
                {formErrors.brand && (
                  <p className="mt-1 text-sm text-error-600">{formErrors.brand}</p>
                )}
              </motion.div>

              {/* Category */}
              <motion.div variants={fadeInUp}>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category*
                </label>
                <div className="relative">
                  <select
                    id="category"
                    name="category"
                    value={product.category}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none bg-white ${
                      formErrors.category ? 'border-error-500 bg-error-50' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select a category</option>
                    {categories.map((option) => (
                      <option key={option.id || option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                {formErrors.category && (
                  <p className="mt-1 text-sm text-error-600">{formErrors.category}</p>
                )}
              </motion.div>

              {/* Price and Stock Status */}
              <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
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
                      value={product.price || ''}
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
                </div>
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
                  value={product.description}
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
                <p className="text-gray-600 mb-2">Drag and drop images here, or click to browse</p>
                <p className="text-xs text-gray-500 mb-4">
                  Supported formats: JPG, PNG, WebP. Max size: 5MB each.
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
                {product.specifications?.map((spec, index) => (
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
                {product.features?.map((feature, index) => (
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
                      disabled={product.features?.length === 1}
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
              onClick={() => navigate('/admin/products')}
              className="px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <Save className="w-5 h-5 mr-2 inline-block" />
              Save Product
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default AddProductPage;

