import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { initFlowbite } from 'flowbite';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../hooks/store/store';
import { logOutUser, isLoggedInUser } from '../../hooks/store/slice/user.slices';
import { productByCategoryResponse, Product as ReduxProduct } from '../../hooks/store/slice/product.slices';
import { User, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useProfileLoader } from '../../hooks/useProfileLoader';
import axios from 'axios';
import { GetAllProducts } from '../../hooks/store/thunk/product.thunk';
import { jwtDecode } from 'jwt-decode';

interface CategoryData {
  _id: string;
  category: string;
}

interface CustomJwtPayload {
  isAdmin: boolean;
}

const Navbar = () => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<ReduxProduct[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const [navbarCategories, setNavbarCategories] = useState<CategoryData[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const dispatch = useDispatch<AppDispatch>();
  const { data: allProducts, loading: productsLoading, error: productsError } = useSelector((state: RootState) => state.product.allProducts);
  const { isLoggedIn, isAdmin, data: userData } = useSelector((state: RootState) => state.user);
  const navigate = useNavigate();
  const location = useLocation();

  useProfileLoader();

  const getImageUrl = (imagePath: string | undefined): string => {
    const baseUrl = "http://localhost:5000";
    if (!imagePath) return `${baseUrl}/profileImages/avatar.png`;
    if (imagePath.startsWith('http')) return imagePath;
    return `${baseUrl}/profileImages/${imagePath}`;
  };

  const profileImage = userData?.data?.profileImage ? getImageUrl(userData.data.profileImage) : getImageUrl(undefined);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode<CustomJwtPayload>(token);
        dispatch(isLoggedInUser({ isLoggedIn: true, isAdmin: decoded.isAdmin }));
      } catch (error) {
        dispatch(isLoggedInUser({ isLoggedIn: false, isAdmin: false }));
        localStorage.removeItem('token');
      }
    } else {
      dispatch(isLoggedInUser({ isLoggedIn: false, isAdmin: false }));
    }
  }, [dispatch]);

  useEffect(() => {
    initFlowbite();
  }, []);

  useEffect(() => {
    dispatch(GetAllProducts({ limit: 1000, offset: 0 }));
  }, [dispatch]);

  useEffect(() => {
    const loadNavbarCategories = async () => {
        try {
          setCategoriesLoading(true);
          const response = await axios.post(`http://localhost:5000/graphql`, {
            query: `query GetCategories { getCategories { success data { _id category } } }`
          });
          if (response.data?.data?.getCategories?.success) {
            setNavbarCategories(response.data.data.getCategories.data || []);
          } else {
            setNavbarCategories([]);
          }
        } catch (error) {
          console.error('Failed to load navbar categories:', error);
          setNavbarCategories([]);
        } finally {
          setCategoriesLoading(false);
        }
    };
    loadNavbarCategories();
  }, []);

  useEffect(() => {
    const products: ReduxProduct[] = allProducts || [];

    // Only show search results if user has typed something
    if (searchTerm.length > 1) {
      setShowSearchResults(true);
      
      // If products are still loading, don't filter yet
      if (productsLoading) {
        setSearchResults([]);
        return;
      }

      // If there are products available, filter them
      if (products.length > 0) {
        const filteredProducts = products.filter(
            (product) =>
              product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
              (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase()))
          ).slice(0, 5);
        setSearchResults(filteredProducts);
      } else {
        // No products available (empty database or error)
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  }, [allProducts, searchTerm, productsLoading]);

  useEffect(() => {
    setShowSearchResults(false);
    setSearchTerm('');
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (searchRef.current && !searchRef.current.contains(target) && mobileSearchRef.current && !mobileSearchRef.current.contains(target)) {
        setShowSearchResults(false);
        setSearchTerm('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    dispatch(logOutUser());
    navigate('/', { replace: true });
    toast.info('You have been logged out');
  };

  const categoryTitles = navbarCategories.reduce((acc: Record<string, string>, cat) => {
      if (cat?.category) acc[cat.category] = cat.category.charAt(0).toUpperCase() + cat.category.slice(1);
      return acc;
    }, {});

  // Enhanced search results component with better error handling
  const SearchResultsDropdown = () => {
    const getSearchMessage = () => {
      // If still loading products
      if (productsLoading) {
        return "Searching...";
      }
      
      // If there's an error loading products
      if (productsError) {
        return "Unable to search - Database connection error";
      }
      
      // If no products exist in database
      if (!allProducts || allProducts.length === 0) {
        return "No products available";
      }
      
      // If search term exists but no results found
      if (searchTerm.length > 1 && searchResults.length === 0) {
        return "Product not found";
      }
      
      return "No products found";
    };

    return (
      <AnimatePresence>
        {showSearchResults && (
          <motion.div
            className="absolute z-20 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-80 overflow-y-auto"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {searchResults.length > 0 ? (
              searchResults.map((product) => (
                <Link
                  key={product._id}
                  to={`/product/${product._id}`}
                  className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 flex items-center gap-3"
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <div className="w-10 h-10 rounded-md overflow-hidden flex-shrink-0">
                    <img
                      src={product.images[0]?.startsWith('http') ? product.images[0] : `http://localhost:5000/images/${product.images[0]}`}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-500">{product.brand}</p>
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500 flex items-center justify-center gap-2">
                {productsLoading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
                )}
                <span>{getSearchMessage()}</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrollPosition > 50 ? 'bg-white shadow-md' : 'bg-transparent'
      }`}
    >
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <Link to="/" className="flex items-center space-x-3">
          <img src="/logo.png" className="h-12" alt="Gadget Logo" />
          <span className="self-center text-base font-semibold whitespace-nowrap text-black">Gadgetier</span>
        </Link>

        <div className="flex md:order-2">
          <div className="relative hidden md:block" ref={searchRef}>
            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
              <Search className="w-4 h-4 text-gray-500" />
            </div>
            <input
              type="text"
              className="block w-full p-2 ps-10 text-base text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <SearchResultsDropdown />
          </div>

          {isLoggedIn && (
            <div className="relative ml-3">
              <button onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)} className="cursor-pointer w-10 h-10 rounded-full overflow-hidden border-2 border-primary-600">
                <img src={profileImage} alt="User Profile" className="w-full h-full object-cover" />
              </button>
              <AnimatePresence>
                {isUserDropdownOpen && (
                  <motion.div
                    className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <div className="px-4 py-2 border-b">
                      <p className="text-sm font-medium truncate">{userData?.data?.name || "User"}</p>
                      <p className="text-xs text-gray-500 truncate">{userData?.data?.email || ""}</p>
                    </div>
                    <Link to="/profile" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100" onClick={() => setIsUserDropdownOpen(false)}>
                      <User className="w-4 h-4 mr-2" /> Profile
                    </Link>
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-error-500 hover:bg-gray-100 border-t">Logout</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          <button
            type="button"
            className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm rounded-lg md:hidden hover:bg-gray-100"
            data-collapse-toggle="navbar-search"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>

        <div className="items-center justify-between hidden w-full md:flex md:w-auto md:order-1" id="navbar-search">
          <div className="relative mt-3 md:hidden" ref={mobileSearchRef}>
            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
              <Search className="w-4 h-4 text-gray-500" />
            </div>
            <input
              type="text"
              className="block w-full p-2 ps-10 text-base text-gray-900 border border-gray-300 rounded-lg bg-gray-50"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
             <SearchResultsDropdown />
          </div>
          <ul className="flex flex-col p-4 md:p-0 mt-4 font-medium border rounded-lg md:space-x-8 md:flex-row md:mt-0 md:border-0">
            <li>
              <Link to="/" className="block py-2 px-3 text-black rounded md:bg-transparent md:p-0">Home</Link>
            </li>
            {isLoggedIn && isAdmin && (
              <li>
                <Link to="/dashboard" className="block py-2 px-3 text-black rounded md:p-0">Dashboard</Link>
              </li>
            )}
            <li>
                <button
                  id="dropdownNavbarLink"
                  data-dropdown-toggle="dropdownNavbar"
                  className="flex items-center justify-between w-full py-2 px-3 text-black rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-primary-700 md:p-0 md:w-auto"
                >
                  Category
                  <svg className="w-2.5 h-2.5 ms-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4"/>
                  </svg>
                </button>
                <div id="dropdownNavbar" className="z-10 hidden font-normal bg-white divide-y divide-gray-100 rounded-lg shadow w-44">
                    <ul className="py-2 text-sm text-gray-700" aria-labelledby="dropdownLargeButton">
                      {categoriesLoading ? (
                        <li>
                          <div className="block px-4 py-2 text-gray-500 text-center">
                            Loading...
                          </div>
                        </li>
                      ) : navbarCategories.length > 0 ? (
                        navbarCategories.map((cat) => (
                          <li key={cat._id}>
                            <Link to={`/category/${cat.category}`} className="block px-4 py-2 hover:bg-gray-100">{categoryTitles[cat.category]}</Link>
                          </li>
                        ))
                      ) : (
                        <li>
                          <div className="block px-4 py-2 text-gray-500 text-center">
                            Not Found
                          </div>
                        </li>
                      )}
                    </ul>
                </div>
            </li>
            <li>
              <Link to="/about" className="block py-2 px-3 text-black rounded md:p-0">About</Link>
            </li>
            {!isLoggedIn && (
              <li>
                <Link to="/user/login" className="block py-2 px-3 text-black rounded md:p-0">Login</Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;