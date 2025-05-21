import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Register } from '../auth/Register.auth';
import { PageLoading } from '../verfiyEmailLoader/Loading';
import { Login } from '../auth/Login.auth';
import { FrontPage } from '../dashboard/admin/frontPage';
import Navbar from '../navbar/Navbar';
import Footer from '../footer/Footer';
import { HomePage } from '../../pages/HomePage';
import About from '../../pages/About.page';
import CategoryPage from '../../pages/Category.page';
import ProductDetailPage from '../../pages/ProductDetail.page';
import SpecificCategoryPage from '../../pages/SpecificCategory.page';
import ProductCompare from '../../pages/Compare.page';
import DashboardLayout from '../dashboard/layout/Layout.dashboard';
import AddProductPage from '../dashboard/admin/AddProduct.admin';
import { ProductsByCategoryLoader } from '../DataLoader/DataLoader';
import ProtectedRoute from '../../utils/ProtectedRoute';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../hooks/store/store';
import { isLoggedInUser } from '../../hooks/store/slice/user.slices';
import AddCategoryAdminPage from '../dashboard/admin/AddCategory.admin';
import DeleteProduct from '../dashboard/admin/DeleteProduct.admin';
import { jwtDecode } from 'jwt-decode';
import Error404 from '../error/Error404';
import ProfilePage from '../../pages/ProfilePage';
import DeleteReviewsComponent from '../dashboard/admin/DeleteReviews.admin';
import DeleteCategoryComponent from '../dashboard/admin/DeleteCategory.admin';
import UserReviewsComponent from '../dashboard/admin/UserReviews.admin';
import ScrollToTop from '../../utils/ScrollToTop';
import { useProfileLoader } from '../../hooks/useProfileLoader';

import UpdateProduct from '../dashboard/admin/UpdateProduct.admin'


interface CustomJwtPayload {
  isAdmin: boolean;
}

export const AppRoutes: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoggedIn, isAdmin } = useSelector((state: RootState) => state.user);
  
  // Use the new profile loader hook to load user data early
  useProfileLoader();
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode<CustomJwtPayload>(token);
        dispatch(isLoggedInUser({ isLoggedIn: true, isAdmin: decoded.isAdmin }));
      } catch (error) {
        console.error('Token decode failed:', error);
        dispatch(isLoggedInUser({ isLoggedIn: false, isAdmin: false }));
        localStorage.removeItem('token');
      }
    } else {
      dispatch(isLoggedInUser({ isLoggedIn: false, isAdmin: false }));
    }
  }, [dispatch]);
  
  return (
    <>
      <Router>
        <ScrollToTop />
        <ProductsByCategoryLoader children={<Navbar />} />
        <div className="pt-20">
          <Routes>
            <Route path="/" element={<ProductsByCategoryLoader children={<HomePage />} />} />
            <Route path="/about" element={<About />} />
            <Route
              path="/categories"
              element={<ProductsByCategoryLoader children={<CategoryPage />} />}
            />
            <Route
              path="/category/:category"
              element={<ProductsByCategoryLoader children={<SpecificCategoryPage />} />}
            />
            <Route
              path="/product/:productId"
              element={<ProductsByCategoryLoader children={<ProductDetailPage />} />}
            />
            {isLoggedIn ? (
              <>
                  <Route
                    path="/compare"
                    element={<ProductsByCategoryLoader children={<ProductCompare />} />}
                  />


                <Route
                  path="/compare/:id"
                  element={<ProductsByCategoryLoader children={<ProductCompare />} />}
                />
                
                <Route
                  path="/profile"
                  element={<ProtectedRoute><ProfilePage /></ProtectedRoute>}
                />
              </>
            ) : (
              <>
                
                <Route path="/register" element={<Register />} />
                <Route path="/user/login" element={<Login role={'user'} />} />
                <Route path="/admin/login" element={<Login role={'admin'} />} />
                <Route path="/verify/:token" element={<PageLoading />} />
              </>
            )}
            {isAdmin && isLoggedIn && (
              <>
                <Route path="/dashboard" element={<DashboardLayout />}>
                  <Route index element={<FrontPage />} />
                  <Route path="/dashboard/add-product" element={<AddProductPage />} />
                  <Route path="/dashboard/add-category" element={<AddCategoryAdminPage />} />
                  <Route path="/dashboard/delete-product" element={<DeleteProduct />} />
                  <Route path="/dashboard/delete-reviews" element={<DeleteReviewsComponent />} />
                  <Route path="/dashboard/delete-category" element={<DeleteCategoryComponent />} />
                  <Route path="/dashboard/user-reviews" element={<UserReviewsComponent />} />
                  <Route path="/dashboard/update-product" element={<UpdateProduct />} />
                </Route>
              </>
            )}
            <Route path="*" element={<Error404 />} />
          </Routes>
        </div>
        <Footer />
      </Router>
    </>
  );
};
