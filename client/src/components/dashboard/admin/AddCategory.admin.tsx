import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Tag, Upload, Image, Check } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../hooks/store/store';
import { AddCategory } from '../../../hooks/store/thunk/product.thunk';
import axios from 'axios';
import { toast } from 'react-toastify';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { category, description, image } = formState.current;

      // Validation
      const errors: string[] = [];

      if (!category) {
        errors.push('Category name is required');
      } else if (/^\d+$/.test(category)) {
        errors.push('Category name cannot contain only numbers');
      }

      if (!description) {
        errors.push('Category description is required');
      } else if (description.length < 10) {
        errors.push('Description should be at least 10 characters long');
      }

      if (!image) {
        errors.push('Category image is required');
      }

      if (errors.length > 0) {
        toast.error(errors[0]); // Show the first error
        return;
      }

      const uploadImage = async (file: File) => {
        try {
          const formImageData = new FormData();
          formImageData.append('image', file);
          const response = await axios.post('http://localhost:5000/api/category', formImageData);
          return response?.data.filename || null;
        } catch (error) {
          toast.error('Failed to upload image');
          return null;
        }
      };

      const uploadedImageName = image ? await uploadImage(image) : null;

      // Make sure image was uploaded successfully
      if (!uploadedImageName) {
        toast.error('Failed to upload image. Please try again.');
        return;
      }

      const categoryData = {
        category,
        description,
        image: uploadedImageName,
      };

      dispatch(AddCategory(categoryData)).then(({ payload }) => {
        if (payload?.success) {
          toast.success(payload.message || 'Category Added Successfully');
          // Reset formState and preview, then force re-render
          formState.current = { category: '', description: '', image: null };
          setPreview(null);
          if (fileInputRef.current) fileInputRef.current.value = '';
          setRerender(r => r + 1);
        } else {
          toast.error(payload.message || 'Failed to add category');
        }
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || 'Error during category addition');
      }
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
        className="rounded-xl bg-gradient-to-br from-white to-pink-50/70 backdrop-blur-md shadow-lg p-6 border border-teal-100"
      >
        {children}
      </motion.div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-pink-100 p-4 md:p-8 flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-4xl"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-center text-teal-700 mb-6 md:mb-8">
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
                    className="w-full px-4 py-2 rounded-md bg-white/80 backdrop-blur-sm border border-teal-200 focus:border-teal-400 focus:ring-1 focus:ring-teal-400 outline-none transition-all"
                  />
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
                    className="w-full px-4 py-2 rounded-md bg-white/80 backdrop-blur-sm border border-teal-200 focus:border-teal-400 focus:ring-1 focus:ring-teal-400 outline-none transition-all min-h-[150px] resize-y"
                  />
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
                      isDragging
                        ? 'border-teal-500 bg-teal-50'
                        : preview
                        ? 'border-yellow-400 bg-white'
                        : 'border-pink-300 bg-white/30 hover:border-teal-300 hover:bg-teal-50/30'
                    }
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
                      <div className="absolute top-2 right-2 bg-yellow-400 text-teal-800 p-1 rounded-full">
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
                        <Upload className="mx-auto h-12 w-12 text-teal-500" />
                      ) : (
                        <Image className="mx-auto h-12 w-12 text-pink-400" />
                      )}
                      <div>
                        <p className="text-lg font-medium text-teal-700">
                          {isDragging ? 'Drop your image here' : 'Click to upload or drag and drop'}
                        </p>
                        <p className="text-sm text-pink-500">PNG, JPG, GIF up to 5MB</p>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </FloatingElement>
          </div>
          <FloatingElement delay={0.7}>
            <button
              type="submit"
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-teal-800 py-3 px-4 rounded-lg shadow-lg transition-all font-medium text-lg"
            >
              Submit
            </button>
          </FloatingElement>
        </form>
      </motion.div>
    </div>
  );
};

export default AddCategoryAdminPage;
