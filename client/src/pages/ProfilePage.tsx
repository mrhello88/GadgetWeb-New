import { useState, useRef, ChangeEvent, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../hooks/store/store';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { User, Upload, X, Check, Camera } from 'lucide-react';
import { updateUserProfile, uploadProfileImage } from '../hooks/store/thunk/user.thunk';
import { AppDispatch } from '../hooks/store/store';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useProfileLoader } from '../hooks/useProfileLoader';

const ProfilePage = () => {
  const { data, loading, error, profileImage, profileImageLoading } = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Use profile loader hook to ensure data is loaded
  const { isLoaded } = useProfileLoader();

  // State for form data
  const [formData, setFormData] = useState({
    name: data?.data?.name || '',
    email: data?.data?.email || '',
  });

  // State for edit mode
  const [isEditing, setIsEditing] = useState(false);
  
  // State for validation errors
  const [validationErrors, setValidationErrors] = useState<{
    name?: string;
  }>({});
  
  // State for profile image
  const [displayImage, setDisplayImage] = useState<string>(data?.data?.profileImage || '');
  const [newImage, setNewImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  // Update form data when profile data changes
  useEffect(() => {
    if (data?.data) {
      setFormData({
        name: data.data.name || '',
        email: data.data.email || '',
      });
      
      if (data.data.profileImage) {
        setDisplayImage(data.data.profileImage);
      }
    }
  }, [data?.data]);

  // Get image URL with proper path
  const getImageUrl = (imageName: string) => {
    if (!imageName) return `${import.meta.env.VITE_API_URL}/profileImages/avatar.png`; // Default avatar
    if (imageName.startsWith('http')) return imageName;
    return `${import.meta.env.VITE_API_URL}/profileImages/${imageName}`;
  };

  // Handle input changes
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle file selection
  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Handle edit mode toggle
  const toggleEditMode = () => {
    setIsEditing(!isEditing);
    if (isEditing) {
      // Reset form data and preview when canceling
      setFormData({
        name: data?.data?.name || '',
        email: data?.data?.email || '',
      });
      setPreviewImage(null);
      setNewImage(null);
      setSubmitError(null);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setValidationErrors({});
    
    // Validate name
    if (!formData.name.trim()) {
      setValidationErrors({ name: 'Name is required' });
      toast.error('Name is required');
      return;
    }
    
    // Validate name contains some letters (not just numbers or special chars)
    if (!/[a-zA-Z]/.test(formData.name)) {
      setValidationErrors({ name: 'Name must contain at least some letters' });
      toast.error('Name must contain at least some letters');
      return;
    }
    
    try {
      if (!data?.data?._id) {
        setSubmitError('User ID not found');
        toast.error('User ID not found');
        return;
      }

      // If there's a new image, upload it first
      let uploadedImageName: string | undefined;
      
      if (newImage) {
        const uploadResult = await dispatch(uploadProfileImage(newImage)).unwrap();
        uploadedImageName = uploadResult;
      }

      // Update user profile - keep the original email, only update name and profile image
      const result = await dispatch(updateUserProfile({
        _id: data.data._id.toString(),
        name: formData.name,
        email: data.data.email, // Use the original email, not the one from the form
        profileImage: uploadedImageName
      })).unwrap();
      
      if (result.success) {
        toast.success('Profile updated successfully!');
        setIsEditing(false);
        
        // If there's a new image, update the display image
        if (uploadedImageName) {
          setDisplayImage(uploadedImageName);
        }
      } else {
        setSubmitError(result.message || 'An error occurred while updating profile');
        toast.error(result.message || 'An error occurred while updating profile');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while updating profile';
      setSubmitError(errorMessage);
      toast.error(errorMessage);
    }
  };

  if (loading && !isLoaded) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (error && !isLoaded) {
    return <div className="flex justify-center items-center min-h-screen text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-24 min-h-screen">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-teal-500 to-teal-700 p-6 text-white">
          <h1 className="text-2xl font-bold">My Profile</h1>
          <p className="text-teal-100">Manage your account information</p>
        </div>

        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Profile Image Section */}
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-teal-500">
                  <img 
                    src={previewImage || getImageUrl(displayImage)} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `${import.meta.env.VITE_API_URL}/profileImages/avatar.png`;
                    }}
                  />
                </div>
                
                {isEditing && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="absolute bottom-0 right-0 bg-teal-600 text-white p-2 rounded-full shadow-lg"
                    onClick={triggerFileInput}
                    disabled={profileImageLoading}
                  >
                    {profileImageLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Camera size={20} />
                    )}
                  </motion.button>
                )}
                
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden" 
                  accept="image/*"
                  onChange={handleFileSelect}
                />
              </div>
              
              {previewImage && isEditing && (
                <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
                  <Upload size={16} />
                  <span>New image selected</span>
                  <button 
                    onClick={() => {
                      setPreviewImage(null);
                      setNewImage(null);
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* Profile Information Section */}
            <div className="flex-1">
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                      Name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      disabled={!isEditing}
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none 
                        ${isEditing ? 'border-teal-500 focus:ring-2 focus:ring-teal-200' : 'bg-gray-50 border-gray-200'}
                        ${validationErrors.name ? 'border-red-500' : ''}
                      `}
                    />
                    {validationErrors.name && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.name}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      disabled={true}
                      value={formData.email}
                      className="w-full px-3 py-2 border rounded-lg bg-gray-50 border-gray-200 focus:outline-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Account Type
                    </label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                      {data?.data?.isAdmin ? 'Administrator' : 'Standard User'}
                    </div>
                  </div>

                  {submitError && (
                    <div className="text-red-500 text-sm mt-2">{submitError}</div>
                  )}
                  
                  <div className="pt-4 flex justify-end space-x-3">
                    {isEditing ? (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          type="button"
                          onClick={toggleEditMode}
                          className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                          disabled={loading}
                        >
                          <X size={16} className="mr-2" />
                          Cancel
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          type="submit"
                          className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                          disabled={loading}
                        >
                          {loading ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          ) : (
                            <Check size={16} className="mr-2" />
                          )}
                          Save Changes
                        </motion.button>
                      </>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={toggleEditMode}
                        className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                      >
                        <User size={16} className="mr-2" />
                        Edit Profile
                      </motion.button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 