import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../hooks/store/store';
import { getAllReviews, deleteReview, updateReview, getReviewsByUser } from '../../../hooks/store/thunk/review.thunk';
import { toggleUserStatus } from '../../../hooks/store/thunk/user.thunk';
import { Review } from '../../../hooks/store/slice/review.slices';
import { Star, Trash2, Search, X, Eye, EyeOff, Filter, User, RefreshCcw, UserCheck, UserX, ShieldCheck } from 'lucide-react';

// Helper function to get the profile image URL with proper fallback
const getProfileImageUrl = (avatarPath: string | undefined): string => {
  if (!avatarPath) return `${import.meta.env.VITE_API_URL}/profileImages/avatar.png`;
  if (avatarPath.startsWith('http')) return avatarPath;
  return `${import.meta.env.VITE_API_URL}/profileImages/${avatarPath}`;
};

// Format date
const formatDate = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

// Get product name by ID
const getProductName = (productId: string): string => {
  // This would need product data - simplified for now
  return productId.slice(0, 6) + '...';
};

const UserReviewsComponent = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading: reviewLoading } = useSelector((state: RootState) => state.review);
  const { data: userData } = useSelector((state: RootState) => state.user);
  
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'disabled'>('all');
  const [toggleStatusId, setToggleStatusId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userSearchTerm, setUserSearchTerm] = useState<string>('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 20;
  const [toggleUserStatusId, setToggleUserStatusId] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);

  // Get current logged-in user ID
  const currentUserId = userData?.data?._id?.toString();

  // Load all reviews initially (admin view)
  useEffect(() => {
    const fetchAllReviews = async () => {
      setLoading(true);
      try {
        if (!selectedUserId) {
          const result = await dispatch(getAllReviews({ 
            limit,
            offset: page * limit
          })).unwrap();
          
          if (result.success && result.data) {
            setReviews(prev => page === 0 ? result.data : [...prev, ...result.data]);
            setHasMore(result.data.length === limit);
            
            // Extract unique users with status
            const uniqueUsersMap = new Map();
            
            result.data.forEach((review: Review & { userStatus?: string }) => {
              if (!uniqueUsersMap.has(review.userId)) {
                uniqueUsersMap.set(review.userId, {
                  id: review.userId,
                  name: review.userName,
                  avatar: review.userAvatar,
                  status: review.userStatus || 'active' // Default to active if not specified
                });
              }
            });
            
            setUsers(Array.from(uniqueUsersMap.values()));
          } else {
            if (page === 0) setReviews([]);
            setHasMore(false);
            toast.info('No more reviews found');
          }
        }
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
        toast.error('Failed to load reviews');
        if (page === 0) setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    if (!selectedUserId) {
      fetchAllReviews();
    }
  }, [dispatch, page, selectedUserId]);

  // Load reviews for specific user
  useEffect(() => {
    const fetchUserReviews = async () => {
      if (selectedUserId) {
        setLoading(true);
        try {
          const result = await dispatch(getReviewsByUser({ 
            userId: selectedUserId,
            limit: 100,  // Get more for a specific user
            offset: 0
          })).unwrap();
          
          if (result.success && result.data) {
            setReviews(result.data);
          } else {
            setReviews([]);
            toast.info('No reviews found for this user');
          }
        } catch (error) {
          console.error('Failed to fetch user reviews:', error);
          toast.error('Failed to load user reviews');
          setReviews([]);
        } finally {
          setLoading(false);
        }
      }
    };

    if (selectedUserId) {
      fetchUserReviews();
    }
  }, [dispatch, selectedUserId]);

  const handleDeleteReview = async (reviewId: string) => {
    try {
      const result = await dispatch(deleteReview(reviewId)).unwrap();
      if (result.success) {
        // Update reviews list by removing the deleted review
        setReviews(prevReviews => prevReviews.filter(review => review._id !== reviewId));
        setShowDeleteConfirm(null);
        toast.success('Review deleted successfully');
      } else {
        toast.error(result.message || 'Failed to delete review');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
    }
  };

  // Toggle review status (active/disabled)
  const handleToggleStatus = async (reviewId: string, currentStatus: boolean) => {
    try {
      setToggleStatusId(reviewId);
      const newStatus = !currentStatus;
      
      const result = await dispatch(updateReview({
        reviewId,
        status: newStatus ? 'active' : 'disabled'
      })).unwrap();
      
      if (result.success && result.data) {
        // Update the review in the local state
        setReviews(prevReviews => 
          prevReviews.map(review => 
            review._id === reviewId 
              ? { ...review, status: newStatus ? 'active' : 'disabled' } 
              : review
          )
        );
        toast.success(`Review ${newStatus ? 'activated' : 'disabled'} successfully`);
      } else {
        toast.error(result.message || 'Failed to update review status');
      }
    } catch (error) {
      console.error('Error updating review status:', error);
      toast.error('Failed to update review status');
    } finally {
      setToggleStatusId(null);
    }
  };

  // Toggle user status (active/inactive)
  const handleToggleUserStatus = async (userId: string, currentUser: any) => {
    // Check if attempting to toggle own account
    if (userId === currentUserId) {
      toast.warning("You cannot change your own account status");
      return;
    }
    
    try {
      setToggleUserStatusId(userId);
      
      const result = await dispatch(toggleUserStatus(userId)).unwrap();
      
      if (result.success && result.data) {
        // Update user in the local state
        const newStatus = result.data.status;
        
        // Update users list
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === userId 
              ? { ...user, status: newStatus } 
              : user
          )
        );
        
        toast.success(`User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
      } else {
        toast.error(result.message || 'Failed to update user status');
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
    } finally {
      setToggleUserStatusId(null);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const clearUserSearch = () => {
    setUserSearchTerm('');
    setSelectedUserId(null);
    setPage(0);
  };

  const loadMoreReviews = () => {
    if (!loading && hasMore && !selectedUserId) {
      setPage(prev => prev + 1);
    }
  };

  const handleUserSelect = (userId: string) => {
    setSelectedUserId(userId);
  };

  // Filter reviews based on search term and status filter
  const filteredReviews = reviews.filter(review => {
    const searchMatch = searchTerm === '' || 
      review.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (review.title && review.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      review.text.toLowerCase().includes(searchTerm.toLowerCase());
    
    const statusMatch = 
      statusFilter === 'all' || 
      (statusFilter === 'active' && (review.status === 'active' || review.status === undefined)) ||
      (statusFilter === 'disabled' && review.status === 'disabled');
    
    return searchMatch && statusMatch;
  });

  // Get unique users for the filter
  const uniqueUsers = [...new Map(reviews.map(review => [review.userId, { id: review.userId, name: review.userName, avatar: review.userAvatar }])).values()];
  
  // Find filtered users based on search
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  if (loading && reviews.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 max-w-7xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="mb-4 sm:mb-6 md:mb-8"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 sm:mb-4">Manage User Reviews</h1>
        <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
          {selectedUserId 
            ? `Viewing reviews by ${reviews[0]?.userName || 'selected user'}`
            : "View and manage all user reviews across the platform."
          }
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 md:gap-6">
        {/* User Filter Sidebar */}
        <div className="md:col-span-4 lg:col-span-3 bg-white rounded-lg shadow-md p-3 sm:p-4">
          <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center">
            <User className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-teal-500" />
            Filter by User
          </h2>
          
          {/* User Search */}
          <div className="relative mb-3 sm:mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={userSearchTerm}
              onChange={(e) => setUserSearchTerm(e.target.value)}
              placeholder="Search users..."
              className="pl-8 sm:pl-10 pr-8 sm:pr-10 py-1.5 sm:py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-xs sm:text-sm"
            />
            {userSearchTerm && (
              <button
                onClick={clearUserSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <X className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
          
          {/* Clear Selection Button */}
          {selectedUserId && (
            <button
              onClick={clearUserSearch}
              className="mb-3 sm:mb-4 w-full py-1.5 sm:py-2 px-3 flex items-center justify-center text-xs sm:text-sm bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 transition-colors"
            >
              <RefreshCcw className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
              Show All Reviews
            </button>
          )}
          
          {/* User List - with proper scrollbar */}
          <div className="space-y-1 max-h-[200px] sm:max-h-[400px] md:max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between">
                  <button
                    onClick={() => handleUserSelect(user.id)}
                    className={`flex-grow text-left p-1.5 sm:p-2 rounded-md transition-colors flex items-center ${
                      selectedUserId === user.id
                        ? 'bg-teal-500 text-white'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gray-200 mr-1.5 sm:mr-2 overflow-hidden flex-shrink-0">
                      {user.avatar ? (
                        <img 
                          src={getProfileImageUrl(user.avatar)} 
                          alt={user.name} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `${import.meta.env.VITE_API_URL}/profileImages/avatar.png`;
                          }}
                        />
                      ) : (
                          <User className="h-3 w-3 sm:h-4 sm:w-4 m-1 text-gray-600" />
                        )}
                    </div>
                    <div className="flex flex-col">
                      <span className="truncate text-xs sm:text-sm">{user.name} {user.id === currentUserId && "(You)"}</span>
                      <div className="flex items-center gap-1">
                        <span className={`text-[10px] sm:text-xs ${user.status === 'inactive' ? 'text-red-500' : 'text-green-500'}`}>
                          {user.status || 'active'}
                        </span>
                        {user.id === currentUserId && (
                          <span className="px-1 sm:px-1.5 py-0.5 bg-teal-100 text-teal-700 text-[10px] sm:text-xs rounded-full">
                            Admin
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                  
                  {/* Toggle user status button */}
                  {user.id === currentUserId ? (
                    <button
                      className="ml-1 sm:ml-2 p-1 sm:p-1.5 rounded-full bg-teal-100 text-teal-600 cursor-not-allowed"
                      title="You cannot change your own account status"
                      disabled
                    >
                      <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleToggleUserStatus(user.id, user)}
                      className={`ml-1 sm:ml-2 p-1 sm:p-1.5 rounded-full ${
                        user.status === 'inactive'
                          ? 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                          : 'bg-green-100 text-green-600 hover:bg-green-200'
                      }`}
                      disabled={toggleUserStatusId === user.id}
                      title={user.status === 'inactive' ? 'Activate User' : 'Deactivate User'}
                    >
                      {toggleUserStatusId === user.id ? (
                        <div className="h-3.5 w-3.5 sm:h-4 sm:w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : user.status === 'inactive' ? (
                        <UserCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      ) : (
                        <UserX className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      )}
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-2 text-xs sm:text-sm">
                {userSearchTerm ? 'No matching users found' : 'No users found'}
              </p>
            )}
          </div>
        </div>

        {/* Reviews Display Area */}
        <div className="md:col-span-8 lg:col-span-9">
          <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 md:p-6">
            {/* Search and Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
              {/* Search Box */}
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search reviews..."
                  className="pl-8 sm:pl-10 pr-8 sm:pr-10 py-1.5 sm:py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-xs sm:text-sm"
                />
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <X className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
              
              {/* Status Filter */}
              <div className="flex items-center space-x-2 flex-shrink-0">
                <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                <div className="flex space-x-1 sm:space-x-2">
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                      statusFilter === 'all'
                        ? 'bg-teal-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setStatusFilter('active')}
                    className={`px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                      statusFilter === 'active'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Active
                  </button>
                  <button
                    onClick={() => setStatusFilter('disabled')}
                    className={`px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                      statusFilter === 'disabled'
                        ? 'bg-gray-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Hidden
                  </button>
                </div>
              </div>
            </div>
            
            {/* Results Count */}
            {!reviewLoading && (
              <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                Showing {filteredReviews.length} reviews
                {statusFilter !== 'all' && ` with status: ${statusFilter}`}
                {searchTerm && ` matching "${searchTerm}"`}
              </p>
            )}
            
            {/* Reviews List with improved scrollable area */}
            {loading || reviewLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
              </div>
            ) : filteredReviews.length > 0 ? (
              <div className="space-y-4 sm:space-y-6 max-h-[400px] sm:max-h-[500px] md:max-h-[600px] overflow-y-auto pr-1 custom-scrollbar">
                {filteredReviews.map((review) => (
                  <motion.div
                    key={review._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`border border-gray-200 rounded-lg p-2 sm:p-4 relative ${
                      review.status === 'disabled' ? 'bg-gray-50 border-gray-300' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start">
                        <img
                          src={getProfileImageUrl(review.userAvatar)}
                          alt={review.userName}
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full mr-2 sm:mr-3 object-cover border border-gray-200"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `${import.meta.env.VITE_API_URL}/profileImages/avatar.png`;
                          }}
                        />
                        <div>
                          <div className="flex items-center flex-wrap gap-1">
                            <span className="font-medium text-gray-800 text-xs sm:text-base">{review.userName}</span>
                            <span className="text-gray-500 text-[10px] sm:text-xs">({formatDate(review.createdAt)})</span>
                            
                            {/* Find the user in users array to show status */}
                            {users.find(u => u.id === review.userId)?.status === 'inactive' && (
                              <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-[10px] sm:text-xs rounded-full">
                                Inactive User
                              </span>
                            )}
                            
                            {/* Product info */}
                            <span className="ml-1 sm:ml-2 px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] sm:text-xs rounded-full">
                              Product: {getProductName(review.productId)}
                            </span>
                            
                            {/* Status indicator */}
                            {review.status === 'disabled' && (
                              <span className="px-1.5 py-0.5 bg-gray-200 text-gray-700 text-[10px] sm:text-xs rounded-full">
                                Hidden
                              </span>
                            )}
                          </div>
                          <div className="flex items-center mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 sm:h-4 sm:w-4 ${
                                  i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                            <span className="ml-1 text-[10px] sm:text-sm text-gray-600">{review.rating.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-1 sm:space-x-2">
                        {/* Toggle status button */}
                        <button
                          className={`p-1 sm:p-2 rounded-full ${
                            review.status === 'disabled'
                              ? 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                              : 'bg-green-100 text-green-600 hover:bg-green-200'
                          }`}
                          onClick={() => handleToggleStatus(
                            review._id, 
                            !(review.status === 'disabled')
                          )}
                          disabled={toggleStatusId === review._id}
                        >
                          {toggleStatusId === review._id ? (
                            <div className="h-4 w-4 sm:h-5 sm:w-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          ) : review.status === 'disabled' ? (
                            <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                          ) : (
                            <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
                          )}
                        </button>
                        
                        {/* Delete button */}
                        <button
                          className="p-1 sm:p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                          onClick={() => setShowDeleteConfirm(review._id)}
                        >
                          <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                      </div>
                    </div>
                    
                    {review.title && (
                      <h4 className="font-medium text-gray-800 mt-2 sm:mt-3 text-sm sm:text-base">{review.title}</h4>
                    )}
                    <p className={`mt-1 sm:mt-2 text-xs sm:text-sm ${review.status === 'disabled' ? 'text-gray-500' : 'text-gray-700'}`}>
                      {review.text}
                    </p>
                    
                    <div className="flex items-center justify-between mt-2 sm:mt-3 pt-2 border-t border-gray-100 text-[10px] sm:text-sm text-gray-500">
                      <div className="flex items-center space-x-2 sm:space-x-4">
                        <span>Likes: {review.likesCount || review.likes?.length || 0}</span>
                        <span>Dislikes: {review.dislikesCount || review.dislikes?.length || 0}</span>
                        {review.repliesCount > 0 && (
                          <span>Replies: {review.repliesCount}</span>
                        )}
                      </div>
                      {review.isEdited && <span>Edited</span>}
                    </div>
                    
                    {/* Delete confirmation dialog */}
                    {showDeleteConfirm === review._id && (
                      <div className="absolute inset-0 bg-white bg-opacity-95 rounded-lg flex flex-col items-center justify-center p-3 sm:p-4 z-10">
                        <p className="text-xs sm:text-sm text-gray-700 mb-3 sm:mb-4 text-center">Are you sure you want to delete this review?</p>
                        <div className="flex space-x-2 sm:space-x-3">
                          <button
                            className="px-2 sm:px-4 py-1 sm:py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-xs sm:text-sm"
                            onClick={() => setShowDeleteConfirm(null)}
                          >
                            Cancel
                          </button>
                          <button
                            className="px-2 sm:px-4 py-1 sm:py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-xs sm:text-sm"
                            onClick={() => handleDeleteReview(review._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
                
                {/* Load More Button */}
                {!selectedUserId && hasMore && (
                  <div className="flex justify-center mt-4">
                    <button
                      onClick={loadMoreReviews}
                      disabled={loading}
                      className="px-3 sm:px-4 py-1.5 sm:py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors text-xs sm:text-sm"
                    >
                      {loading ? 'Loading...' : 'Load More Reviews'}
                    </button>
                  </div>
                )}
              </div>
            ) : searchTerm || statusFilter !== 'all' ? (
              <div className="text-center py-6 sm:py-10 text-gray-500">
                <p className="text-sm sm:text-base">No reviews found matching your filters</p>
                <button 
                  className="mt-2 text-teal-500 hover:underline text-xs sm:text-sm"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                  }}
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="text-center py-6 sm:py-10 text-gray-500">
                <p className="text-sm sm:text-base">No reviews found for this user</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserReviewsComponent; 