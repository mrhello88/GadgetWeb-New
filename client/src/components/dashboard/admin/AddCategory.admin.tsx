import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Tag, Upload, Image, Check } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../hooks/store/store';
import { AddCategory, GetCategories } from '../../../hooks/store/thunk/product.thunk';
import { refreshCategories } from '../../../hooks/store/slice/product.slices';
import axios from 'axios';
import { toast } from 'react-toastify';
import useErrorHandler from '../../../hooks/useErrorHandler';
import LoadingSpinner from '../../common/LoadingSpinner';
import ErrorBoundary from '../../error/ErrorBoundary';

type FormState = {
  category: string;
  description: string;
  image: File | null;
};

const AddCategoryAdminPage = () => {
  const formState = useRef<FormState>({
    category: '',
    description: '',
    image: null,
  });

  // Dummy state to force re-render after reset
  const [, setRerender] = useState(0);

  // Image preview state
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Loading and error states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Error handling
  const { handleError, handleValidationError } = useErrorHandler();

  // Form input handlers with proper typing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // Type-safe property access
    if (name === 'category' || name === 'description') {
      formState.current[name] = value;
    }
  };

  // Image handling functions (unchanged)
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files?.[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    formState.current.image = file;
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const dispatch = useDispatch<AppDispatch>();

  const validateForm = () => {
    const { category, description, image } = formState.current;
    const errors: Record<string, string> = {};

    // Category validation
    if (!category?.trim()) {
      errors.category = 'Category name is required';
    } else if (/^\d+$/.test(category.trim())) {
      errors.category = 'Category name cannot contain only numbers';
    } else if (category.trim().length < 2) {
      errors.category = 'Category name must be at least 2 characters long';
    }

    // Description validation
    if (!description?.trim()) {
      errors.description = 'Category description is required';
    } else if (description.trim().length < 10) {
      errors.description = 'Description should be at least 10 characters long';
    } else if (description.trim().length > 500) {
      errors.description = 'Description should be less than 500 characters';
    }

    // Image validation
    if (!image) {
      errors.image = 'Category image is required';
    } else {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(image.type)) {
        errors.image = 'Please select a valid image file (JPEG, PNG, GIF, WebP)';
      } else if (image.size > 5 * 1024 * 1024) { // 5MB
        errors.image = 'Image size should be less than 5MB';
      }
    }

    setValidationErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      handleValidationError(errors, true);
      return false;
    }
    
    return true;
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    setIsUploading(true);
    try {
      const formImageData = new FormData();
      formImageData.append('image', file);
      
      const response = await axios.post(`http://localhost:5000/api/category`, formImageData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 seconds timeout
      });
      
      if (response?.data?.filename) {
        return response.data.filename;
      } else {
        throw new Error('No filename received from server');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          handleError('Upload timeout. Please try again with a smaller image.', { showToast: true });
        } else if (error.response?.status === 413) {
          handleError('Image size is too large. Please select an image smaller than 5MB.', { showToast: true });
        } else if (error.response?.data?.error === 'FILE_TOO_LARGE') {
          handleError('Image size is too large. Please select an image smaller than 5MB.', { showToast: true });
        } else if (error.response?.data?.message) {
          handleError(error.response.data.message, { showToast: true });
        } else {
          handleError(error.response?.data?.message || 'Failed to upload image', { showToast: true });
        }
      } else {
        handleError('Failed to upload image. Please check your connection and try again.', { showToast: true });
      }
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    formState.current = { category: '', description: '', image: null };
    setPreview(null);
    setValidationErrors({});
    if (fileInputRef.current) fileInputRef.current.value = '';
    setRerender(r => r + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting || isUploading) return;

    setIsSubmitting(true);
    
    try {
      // Validate form
      if (!validateForm()) {
        return;
      }

      const { category, description, image } = formState.current;

      // Upload image
      const uploadedImageName = await uploadImage(image!);
      
      if (!uploadedImageName) {
        return; // Error already handled in uploadImage
      }

      // Prepare category data
      const categoryData = {
        category: category.trim(),
        description: description.trim(),
        image: uploadedImageName,
      };

      // Submit category
      const result = await dispatch(AddCategory(categoryData));
      const payload = result.payload as any;
      
      if (payload?.success) {
        toast.success(payload.message || 'Category added successfully!');
        resetForm();
        
        // Refresh categories in Redux store to update navbar
        dispatch(refreshCategories());
        // Also fetch updated categories
        dispatch(GetCategories({ limit: 50, offset: 0 }));
      } else {
        handleError(payload?.message || 'Failed to add category', { showToast: true });
      }
    } catch (error) {
      handleError(error, { 
        showToast: true,
        customMessage: 'An unexpected error occurred while adding the category'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // FloatingElement component (unchanged)
  const FloatingElement = ({
    children,
    delay = 0,
  }: {
    children: React.ReactNode;
    delay?: number;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay, type: 'spring', stiffness: 100 }}
      className="relative w-full"
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
        className="rounded-xl bg-gradient-to-br from-white to-pink-50/70 backdrop-blur-md shadow-lg p-6 border border-primary-100"
      >
        {children}
      </motion.div>
    </motion.div>
  );

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-pink-100 p-4 md:p-8 flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-4xl"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-center text-primary-700 mb-6 md:mb-8">
          Create Your Content
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8 relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              <FloatingElement delay={0.3}>
                <div className="space-y-2">
                  <label
                    htmlFor="category"
                    className="text-lg font-medium flex items-center gap-2 text-pink-600"
                  >
                    <Tag className="h-5 w-5" />
                    Category
                  </label>
                  <input
                    type="text"
                    id="category"
                    name="category"
                    defaultValue={formState.current.category}
                    onChange={handleInputChange}
                    placeholder="Enter category name"
                    className={`w-full px-4 py-2 rounded-md bg-white/80 backdrop-blur-sm border ${
                      validationErrors.category 
                        ? 'border-error-300 focus:border-error-400 focus:ring-error-400' 
                        : 'border-primary-200 focus:border-primary-400 focus:ring-primary-400'
                    } focus:ring-1 outline-none transition-all`}
                    disabled={isSubmitting}
                  />
                  {validationErrors.category && (
                    <p className="text-sm text-error-500 mt-1">{validationErrors.category}</p>
                  )}
                </div>
              </FloatingElement>

              <FloatingElement delay={0.5}>
                <div className="space-y-2">
                  <label
                    htmlFor="description"
                    className="text-lg font-medium flex items-center gap-2 text-pink-600"
                  >
                    <FileText className="h-5 w-5" />
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    defaultValue={formState.current.description}
                    onChange={handleInputChange}
                    placeholder="Describe your content..."
                    className={`w-full px-4 py-2 rounded-md bg-white/80 backdrop-blur-sm border ${
                      validationErrors.description 
                        ? 'border-error-300 focus:border-error-400 focus:ring-error-400' 
                        : 'border-primary-200 focus:border-primary-400 focus:ring-primary-400'
                    } focus:ring-1 outline-none transition-all min-h-[150px] resize-y`}
                    disabled={isSubmitting}
                  />
                  {validationErrors.description && (
                    <p className="text-sm text-error-500 mt-1">{validationErrors.description}</p>
                  )}
                </div>
              </FloatingElement>
            </div>

            {/* Right Column */}
            <FloatingElement delay={0.2}>
              <div className="space-y-2">
                <label className="text-lg font-medium flex items-center gap-2 text-pink-600">
                  <Upload className="h-5 w-5" />
                  Upload Image
                </label>
                <div
                  onClick={triggerFileInput}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className={`
                    relative h-[300px] rounded-xl cursor-pointer border-2 border-dashed transition-all flex flex-col justify-center items-center
                    ${
                      validationErrors.image
                        ? 'border-error-400 bg-error-50'
                        : isDragging
                        ? 'border-primary-500 bg-primary-50'
                        : preview
                        ? 'border-warning-400 bg-white'
                        : 'border-pink-300 bg-white/30 hover:border-primary-300 hover:bg-primary-50/30'
                    } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/*"
                    className="hidden"
                  />
                  {preview ? (
                    <div className="relative w-full h-full p-3">
                      <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-full object-contain rounded"
                      />
                      <div className="absolute top-2 right-2 bg-warning-400 text-primary-800 p-1 rounded-full">
                        <Check className="h-4 w-4" />
                      </div>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 bg-black/10 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                      >
                        <p className="text-white font-medium">Click to change image</p>
                      </motion.div>
                    </div>
                  ) : (
                    <motion.div className="text-center p-6 space-y-4" whileHover={{ scale: 1.05 }}>
                      {isDragging ? (
                        <Upload className="mx-auto h-12 w-12 text-primary-500" />
                      ) : (
                        <Image className="mx-auto h-12 w-12 text-pink-400" />
                      )}
                      <div>
                        <p className="text-lg font-medium text-primary-700">
                          {isDragging ? 'Drop your image here' : 'Click to upload or drag and drop'}
                        </p>
                        <p className="text-sm text-pink-500">PNG, JPG, GIF up to 5MB</p>
                      </div>
                    </motion.div>
                  )}
                </div>
                {validationErrors.image && (
                  <p className="text-sm text-error-500 mt-2">{validationErrors.image}</p>
                )}
                {isUploading && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-primary-600">
                    <LoadingSpinner size="sm" type="default" />
                    <span>Uploading image...</span>
                  </div>
                )}
              </div>
            </FloatingElement>
          </div>
          <FloatingElement delay={0.7}>
            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className={`w-full py-3 px-4 rounded-lg shadow-lg transition-all font-medium text-lg flex items-center justify-center gap-2 ${
                isSubmitting || isUploading
                  ? 'bg-gray-400 cursor-not-allowed text-gray-600'
                  : 'bg-warning-400 hover:bg-warning-500 text-primary-800 hover:shadow-xl'
              }`}
            >
              {isSubmitting && <LoadingSpinner size="sm" />}
              {isSubmitting ? 'Adding Category...' : 'Submit'}
            </button>
          </FloatingElement>
        </form>
      </motion.div>
    </div>
    </ErrorBoundary>
  );
};

export default AddCategoryAdminPage;

