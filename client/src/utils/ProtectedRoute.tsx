import { Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { ReactNode } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '..//hooks/store/store';
import { isLoggedInUser } from '../hooks/store/slice/user.slices';

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoggedIn } = useSelector((state: RootState) => state.user);

  // useEffect(() => {
  //   dispatch(isLoggedInUser());
  // }, [dispatch]); // <- safe and predictable

  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  try {
    return children;
  } catch (error) {
    return <Navigate to="/" replace />;
  }
};

export default ProtectedRoute;

export const AdminProtectedRoute = ({ children }: { children: ReactNode }) => {
  try {
    const dispatch = useDispatch<AppDispatch>();

    const { isLoggedIn, isAdmin } = useSelector((state: RootState) => state.user);

    // useEffect(() => {
    //   dispatch(isLoggedInUser());
    // }, [dispatch]); // <- safe and predictable

    if (!isLoggedIn && !isAdmin) {
      return <Navigate to="/" replace />;
    }
    return children;
  } catch (error) {
    console.error('Token decode failed:', error);
    return <Navigate to="/" replace />;
  }
};
