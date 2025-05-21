import { ReactNode, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../hooks/store/store';
import { GetProductsByCategory } from '../../hooks/store/thunk/product.thunk';
import { toast } from 'react-toastify';
import { Loader2 } from 'lucide-react';

export const ProductsByCategoryLoader = ({ children }: { children: ReactNode }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { data, loading, error } = useSelector((state: RootState) => state.product);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [hasLoadedBefore, setHasLoadedBefore] = useState(false);
  
  useEffect(() => {
    const loadProducts = async () => {
      try {
        if (!data) {
          const result = await dispatch(GetProductsByCategory());
          const payload = result.payload as any;
          
          if (payload.success) {
            console.log('✅ Products loaded successfully:', payload.data);
            setHasLoadedBefore(true);
          } else {
            console.error('❌ Failed to load products:', payload);
            toast.error(payload.message || '❌ Failed to load products');
          }
        } else if (data && !hasLoadedBefore) {
          setHasLoadedBefore(true);
        }
      } catch (error) {
        console.error('Error loading products:', error);
        if (error instanceof Error) {
          toast.error(error.message || 'Error loading page');
        }
      } finally {
        // Set initial load to false after first load attempt
        setIsInitialLoad(false);
      }
    };

    loadProducts();
  }, [dispatch, data, hasLoadedBefore]);

  // Skip the loading screen if we've loaded data before
  if (hasLoadedBefore) {
    return <>{children}</>;
  }

  // Show loading spinner during initial data load
  if ((loading || isInitialLoad) && !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="w-12 h-12 text-teal-600 animate-spin" />
        <p className="mt-4 text-gray-700">Loading products...</p>
      </div>
    );
  }

  // Show error message if loading failed
  if (error && !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md max-w-md">
          <p className="font-medium">Failed to load products</p>
          <p className="text-sm">{error}</p>
          <button 
            className="mt-4 bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700"
            onClick={() => dispatch(GetProductsByCategory())}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
