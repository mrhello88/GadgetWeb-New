import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../hooks/store/store';
import { useAppDispatch } from '../../../hooks/store/hooks';
import { GetCategories } from '../../../hooks/store/thunk/product.thunk';
import { getAllUsers } from '../../../hooks/store/thunk/user.thunk';
import { useLoadMore } from '../../../hooks/usePagination';
import { ChevronDown, Users, Tag } from 'lucide-react';

const SidebarWithLoadMore = () => {
  const dispatch = useAppDispatch();
  const { categories } = useSelector((state: RootState) => state.product);
  const { allUsers } = useSelector((state: RootState) => state.user);
  const { loadMoreCategories } = useLoadMore();
  
  const [activeSection, setActiveSection] = useState<'categories' | 'users' | null>('categories');

  // Initial load for categories
  useEffect(() => {
    dispatch(GetCategories({
      limit: 5, // Start with 5 categories
      offset: 0
    }));
  }, [dispatch]);

  // Initial load for users
  useEffect(() => {
    dispatch(getAllUsers({
      limit: 5, // Start with 5 users
      offset: 0
    }));
  }, [dispatch]);

  // Handle load more categories
  const handleLoadMoreCategories = () => {
    if (categories.hasMore && !categories.loading) {
      loadMoreCategories({
        currentData: categories.data,
        limit: 5
      });
    }
  };

  // Handle load more users (you'll need to implement this in useLoadMore hook)
  const handleLoadMoreUsers = () => {
    if (allUsers && allUsers.length > 0) {
      // For now, just dispatch more users
      dispatch(getAllUsers({
        limit: 5,
        offset: allUsers.length
      }));
    }
  };

  return (
    <div className="w-64 bg-white shadow-lg h-full overflow-y-auto">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Navigation</h2>
        
        {/* Categories Section */}
        <div className="mb-6">
          <button
            onClick={() => setActiveSection(activeSection === 'categories' ? null : 'categories')}
            className="flex items-center justify-between w-full p-2 text-left text-gray-700 hover:bg-gray-50 rounded-md"
          >
            <div className="flex items-center">
              <Tag className="w-4 h-4 mr-2" />
              <span className="font-medium">Categories</span>
              <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded-full">
                {categories.data.length}
              </span>
            </div>
            <ChevronDown 
              className={`w-4 h-4 transition-transform ${
                activeSection === 'categories' ? 'rotate-180' : ''
              }`} 
            />
          </button>
          
          {activeSection === 'categories' && (
            <div className="mt-2 pl-6 max-h-64 overflow-y-auto">
              {categories.data.map((category) => (
                <div key={category._id} className="py-1">
                  <div className="flex items-center text-sm text-gray-600 hover:text-gray-800 cursor-pointer">
                    <img
                      src={
                        category.image?.startsWith('http')
                          ? category.image
                          : `http://localhost:5000/categoryImage/${category.image}`
                      }
                      alt={category.category}
                      className="w-6 h-6 rounded mr-2 object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                    <span className="truncate">{category.category}</span>
                    <span className="ml-auto text-xs text-gray-400">
                      {category.products?.length || 0}
                    </span>
                  </div>
                </div>
              ))}
              
              {/* Load More Categories Button */}
              {categories.hasMore && (
                <div className="mt-2">
                  <button
                    onClick={handleLoadMoreCategories}
                    disabled={categories.loading}
                    className="w-full text-xs text-primary-600 hover:text-primary-700 disabled:opacity-50 disabled:cursor-not-allowed p-2 border border-primary-200 rounded-md hover:bg-primary-50"
                  >
                    {categories.loading ? 'Loading...' : 'Load More Categories'}
                  </button>
                </div>
              )}
              
              {/* Categories Summary */}
              <div className="mt-2 text-xs text-gray-500 border-t pt-2">
                Showing {categories.data.length} of {categories.total} categories
              </div>
            </div>
          )}
        </div>

        {/* Users Section */}
        <div className="mb-6">
          <button
            onClick={() => setActiveSection(activeSection === 'users' ? null : 'users')}
            className="flex items-center justify-between w-full p-2 text-left text-gray-700 hover:bg-gray-50 rounded-md"
          >
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-2" />
              <span className="font-medium">Users</span>
              <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded-full">
                {allUsers?.length || 0}
              </span>
            </div>
            <ChevronDown 
              className={`w-4 h-4 transition-transform ${
                activeSection === 'users' ? 'rotate-180' : ''
              }`} 
            />
          </button>
          
          {activeSection === 'users' && (
            <div className="mt-2 pl-6 max-h-64 overflow-y-auto">
              {allUsers?.slice(0, 5).map((user) => (
                <div key={user._id} className="py-1">
                  <div className="flex items-center text-sm text-gray-600 hover:text-gray-800 cursor-pointer">
                    <img
                      src={
                        user.profileImage?.startsWith('http')
                          ? user.profileImage
                          : `http://localhost:5000/profileImages/${user.profileImage}`
                      }
                      alt={user.name}
                      className="w-6 h-6 rounded-full mr-2 object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                    <span className="truncate">{user.name}</span>
                    <span className={`ml-auto text-xs px-2 py-1 rounded-full ${
                      user.isActive 
                        ? 'bg-success-100 text-success-800' 
                        : 'bg-error-100 text-error-800'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              ))}
              
              {/* Load More Users Button */}
              {allUsers && allUsers.length >= 5 && (
                <div className="mt-2">
                  <button
                    onClick={handleLoadMoreUsers}
                    className="w-full text-xs text-primary-600 hover:text-primary-700 p-2 border border-primary-200 rounded-md hover:bg-primary-50"
                  >
                    Load More Users
                  </button>
                </div>
              )}
              
              {/* Users Summary */}
              <div className="mt-2 text-xs text-gray-500 border-t pt-2">
                Showing first 5 users
              </div>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="bg-gray-50 rounded-lg p-3">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Quick Stats</h3>
          <div className="space-y-1 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Total Categories:</span>
              <span className="font-medium">{categories.total}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Users:</span>
              <span className="font-medium">{allUsers?.length || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidebarWithLoadMore; 
 
