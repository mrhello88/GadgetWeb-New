import { ReactNode } from 'react';
import LoadingSpinner from '../common/LoadingSpinner';
import DataNotFound from '../common/DataNotFound';
import ErrorBoundary from '../error/ErrorBoundary';
import { useSelector } from 'react-redux';
import { RootState } from '../../hooks/store/store';

interface ImprovedDataLoaderProps {
  children: ReactNode;
  type?: 'products' | 'categories' | 'users' | 'reviews';
  showRetryButton?: boolean;
  customLoadingMessage?: string;
  customErrorMessage?: string;
  customNoDataMessage?: string;
  onRetry?: () => void;
}

export const ImprovedDataLoader = ({ 
  children, 
  type = 'products',
  showRetryButton = true,
  customLoadingMessage,
  customErrorMessage,
  customNoDataMessage,
  onRetry
}: ImprovedDataLoaderProps) => {
  const { data, loading, error } = useSelector((state: RootState) => state.product);

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  // Show loading spinner during data load
  if (loading && !data) {
    return (
      <ErrorBoundary>
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-teal-50 to-pink-100">
          <LoadingSpinner 
            size="lg" 
            type="default"
            message={customLoadingMessage || "Loading data..."}
          />
        </div>
      </ErrorBoundary>
    );
  }

  // Show error message if loading failed
  if (error && !data) {
    return (
      <ErrorBoundary>
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-pink-50">
          <div className="bg-white border border-error-200 rounded-lg shadow-lg p-8 max-w-md mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-error-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-error-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Failed to Load Data
              </h3>
              
              <p className="text-gray-600 mb-6">
                {customErrorMessage || error}
              </p>
              
              {showRetryButton && (
                <button 
                  className="w-full bg-gradient-to-r from-teal-500 to-pink-500 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-200 font-medium"
                  onClick={handleRetry}
                >
                  Try Again
                </button>
              )}
            </div>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  // Show "no data found" if data is empty
  if (data && Array.isArray((data as any).data) && (data as any).data.length === 0) {
    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
          <DataNotFound
            type={type}
            message={customNoDataMessage}
            onRetry={showRetryButton ? handleRetry : undefined}
            showRetryButton={showRetryButton}
            className="min-h-screen"
          />
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  );
};

// Specialized data loaders for different types
export const ProductsDataLoader = ({ 
  children, 
  onRetry 
}: { 
  children: ReactNode; 
  onRetry?: () => void; 
}) => (
  <ImprovedDataLoader 
    type="products" 
    onRetry={onRetry}
    customLoadingMessage="Loading products and categories..."
    customNoDataMessage="No products are available at the moment. Please check back later or contact support."
  >
    {children}
  </ImprovedDataLoader>
);

export const CategoriesDataLoader = ({ 
  children, 
  onRetry 
}: { 
  children: ReactNode; 
  onRetry?: () => void; 
}) => (
  <ImprovedDataLoader 
    type="categories" 
    onRetry={onRetry}
    customLoadingMessage="Loading categories..."
    customNoDataMessage="No categories are available at the moment."
  >
    {children}
  </ImprovedDataLoader>
);

export default ImprovedDataLoader; 