import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from './store/store';
import { getCurrentUserProfile } from './store/thunk/user.thunk';

// Hook to ensure user profile data is loaded early in the app lifecycle
export const useProfileLoader = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data } = useSelector((state: RootState) => state.user);
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      // If no token, ensure user state is cleared
      dispatch({ type: 'user/isLoggedInUser', payload: { isLoggedIn: false, isAdmin: false } });
    } else if (!data || !data.data) {
      // Only fetch if we have a token and don't already have the data
      dispatch(getCurrentUserProfile());
    }
  }, [dispatch, data]);
  
  return { isLoaded: !!data?.data };
};