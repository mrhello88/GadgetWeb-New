import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { initFlowbite } from 'flowbite';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../hooks/store/store';
import { logOutUser } from '../../hooks/store/slice/user.slices';
import { productByCategoryResponse, Product as ReduxProduct } from '../../hooks/store/slice/product.slices';
import { User, ShoppingCart, Search, LayoutGrid, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useProfileLoader } from '../../hooks/useProfileLoader';

interface Specification {
  name: string;
  value: string;
}

interface Category {
  _id: string;
  category: string;
  description: string;
  image: string;
  products: ReduxProduct[];
}

interface CategoryData {
  _id: string;
  category: string;
}

const isProduct = (item: any): item is ReduxProduct => {
  return 'brand' in item && 'name' in item && 'price' in item;
};

const isProductByCategoryResponse = (data: any): data is productByCategoryResponse => {
  return data && 'data' in data && data.data !== null;
};

const Navbar = () => {
  // State for scroll position and navbar visibility
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // State for dropdowns and hover effects
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isHovering, setIsHovering] = useState({
    home: false,
    user: false,
    category: false,
    about: false,
    services: false,
    login: false,
    logOut: false,
    dashboard: false,
  });

  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<ReduxProduct[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Redux data
  const dispatch = useDispatch<AppDispatch>();
  const { data } = useSelector((state: RootState) => state.product);
  const { isLoggedIn, isAdmin, data: userData } = useSelector((state: RootState) => state.user);
  const navigate = useNavigate();
  
  // Ensure user profile data is loaded
  useProfileLoader();

  // Add profile dropdown state
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // Get user profile image from state
  const getImageUrl = (imagePath: string | undefined): string => {
    if (!imagePath) return `${import.meta.env.VITE_API_URL}/profileImages/avatar.png`;
    if (imagePath.startsWith('http')) return imagePath;
    return `${import.meta.env.VITE_API_URL}/profileImages/${imagePath}`;
  };

  const profileImage = userData?.data?.profileImage 
    ? getImageUrl(userData.data.profileImage)
    : `${import.meta.env.VITE_API_URL}/profileImages/avatar.png`;

  // Initialize Flowbite
  useEffect(() => {
    initFlowbite();
  }, []);

  // Process Redux data for categories and products
  useEffect(() => {
    if (data && isProductByCategoryResponse(data) && data.success && data.data) {
      const allProducts = Array.isArray(data.data)
        ? data.data.flatMap(category => category.products || [])
        : [];

      // Update search results when search term changes
      if (searchTerm.length > 1) {
        const filteredProducts = allProducts
          .filter(
            (product) =>
              product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              product.brand.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .slice(0, 5);
        setSearchResults(filteredProducts);
        setShowSearchResults(true);
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    }
  }, [data, searchTerm]);

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrollPosition(currentScrollY);
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(true);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Hide search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Hamburger toggle
  const handleHamburgerToggle = () => {
    const navbarSearch = document.getElementById('navbar-search');
    if (navbarSearch) {
      navbarSearch.classList.toggle('hidden');
      setTimeout(() => {
        initFlowbite();
      }, 50);
    }
  };

  // Toggle dropdowns
  const toggleUserDropdown = () => {
    setIsUserDropdownOpen((prev) => !prev);
    setIsCategoryDropdownOpen(false);
  };

  const toggleCategoryDropdown = () => {
    setIsCategoryDropdownOpen((prev) => !prev);
    setIsUserDropdownOpen(false);
  };

  // Navigate to /categories
  const handleCategoryTextClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate('/categories');
  };

  // Handle hover states
  const handleHover = (key: string, isHovering: boolean) => {
    setIsHovering((prev) => ({
      ...prev,
      [key]: isHovering,
    }));
  };

  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Handle product selection
  const handleProductSelect = (productId: string) => {
    setSearchTerm('');
    setShowSearchResults(false);
    navigate(`/product/${productId}`);
  };

  // Get categories from Redux data
  const categories: CategoryData[] =
    data && isProductByCategoryResponse(data) && data.success && data.data
      ? Array.isArray(data.data)
        ? data.data.map(cat => ({
            _id: cat._id,
            category: cat.category,
          }))
        : []
      : [];

  // Capitalize category names
  const categoryTitles: Record<string, string> = categories.reduce(
    (acc: Record<string, string>, cat: CategoryData) => {
      if (cat && cat.category) {
        acc[cat.category] = cat.category.charAt(0).toUpperCase() + cat.category.slice(1);
      }
      return acc;
    },
    {}
  );

  // Profile navigation functions
  const handleProfileClick = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  const goToProfile = () => {
    navigate('/profile');
    setShowProfileDropdown(false);
  };

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrollPosition > 50 ? 'bg-white shadow-md' : 'bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{
        y: isVisible ? 0 : -100,
        opacity: isVisible ? 1 : 0,
      }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ type: 'spring', stiffness: 400, damping: 10 }}
        >
          <Link to="/" className="flex items-center space-x-3 rtl:space-x-reverse">
            <img src="/logo.png" className="h-12" alt="Gadget Logo" />
            <motion.span
              className={`self-center text-base font-semibold whitespace-nowrap ${
                scrollPosition > 50 ? 'text-black' : 'text-black'
              }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Gadgetier
            </motion.span>
          </Link>
        </motion.div>

        <div className="flex md:order-2">
          <motion.div
            className="relative hidden md:block"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            ref={searchRef}
          >
            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
              <svg
                className="w-4 h-4 text-gray-500"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 20"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                />
              </svg>
              <span className="sr-only">Search icon</span>
            </div>
            <motion.input
              type="text"
              id="search-navbar"
              className="block w-full p-2 ps-10 text-base text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300"
              placeholder="Search products..."
              value={searchTerm}
              onChange={handleSearchChange}
              whileFocus={{ scale: 1.05, boxShadow: '0 0 8px rgba(20, 184, 166, 0.5)' }}
            />
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
                      <div
                        key={product._id}
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 flex items-center gap-3"
                        onClick={() => handleProductSelect(product._id)}
                      >
                        <div className="w-10 h-10 rounded-md overflow-hidden flex-shrink-0">
                          <img
                            src={
                              product.images[0]?.startsWith('http')
                                ? product.images[0]
                                : `${import.meta.env.VITE_API_URL}/images/${product.images[0]}`
                            }
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder.svg';
                            }}
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{product.name}</h3>
                          <p className="text-sm text-gray-500">{product.brand}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500">No products found</div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          
          {/* Profile Icon - Desktop */}
          {isLoggedIn && (
            <div className="relative ml-3 hidden md:block">
              <div
                onClick={handleProfileClick}
                className="cursor-pointer w-10 h-10 rounded-full overflow-hidden border-2 border-teal-600 hover:scale-105 transition-transform"
              >
                <img
                  src={profileImage}
                  alt={userData?.data?.name || "User Profile"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `${import.meta.env.VITE_API_URL}/profileImages/avatar.png`;
                  }}
                />
              </div>
              
              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
                        <img 
                          src={profileImage}
                          alt={userData?.data?.name || "User Profile"}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `${import.meta.env.VITE_API_URL}/profileImages/avatar.png`;
                          }}
                        />
                      </div>
                      <div className="truncate">
                        <p className="text-sm font-medium text-gray-700">{userData?.data?.name || "User"}</p>
                        <p className="text-xs text-gray-500 truncate">{userData?.data?.email || ""}</p>
                      </div>
                    </div>
                  </div>
                  <div
                    onClick={goToProfile}
                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer"
                  >
                    <User className="w-4 h-4 mr-2 text-teal-600" />
                    <span>Profile</span>
                  </div>
                  <div 
                    onClick={() => {
                      dispatch(logOutUser());
                      toast.info('You have been logged out');
                      setShowProfileDropdown(false);
                    }}
                    className="px-4 py-2 text-red-500 hover:bg-gray-100 cursor-pointer border-t border-gray-100"
                  >
                    <span>Logout</span>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Profile Icon - Mobile (positioned right of hamburger) */}
          {isLoggedIn && (
            <div className="md:hidden flex items-center mr-2">
              <div
                onClick={handleProfileClick}
                className="cursor-pointer w-8 h-8 rounded-full overflow-hidden border-2 border-teal-600 hover:scale-105 transition-transform"
              >
                <img
                  src={profileImage}
                  alt={userData?.data?.name || "User Profile"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `${import.meta.env.VITE_API_URL}/profileImages/avatar.png`;
                  }}
                />
              </div>
              {showProfileDropdown && (
                <div className="absolute right-4 top-14 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
                        <img 
                          src={profileImage}
                          alt={userData?.data?.name || "User Profile"}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `${import.meta.env.VITE_API_URL}/profileImages/avatar.png`;
                          }}
                        />
                      </div>
                      <div className="truncate">
                        <p className="text-sm font-medium text-gray-700">{userData?.data?.name || "User"}</p>
                        <p className="text-xs text-gray-500 truncate">{userData?.data?.email || ""}</p>
                      </div>
                    </div>
                  </div>
                  <div
                    onClick={goToProfile}
                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer"
                  >
                    <User className="w-4 h-4 mr-2 text-teal-600" />
                    <span>Profile</span>
                  </div>
                  <div 
                    onClick={() => {
                      dispatch(logOutUser());
                      toast.info('You have been logged out');
                      setShowProfileDropdown(false);
                    }}
                    className="px-4 py-2 text-red-500 hover:bg-gray-100 cursor-pointer border-t border-gray-100"
                  >
                    <span>Logout</span>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <motion.button
            onClick={handleHamburgerToggle}
            type="button"
            className={`inline-flex items-center p-2 w-10 h-10 justify-center text-sm rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-200 ${
              scrollPosition > 50 ? 'text-gray-500' : 'text-black'
            }`}
            aria-controls="navbar-search"
            aria-expanded="false"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <span className="sr-only">Open main menu</span>
            <svg
              className="w-5 h-5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 17 14"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M1 1h15M1 7h15M1 13h15"
              />
            </svg>
          </motion.button>
        </div>

        <div
          className="items-center justify-between hidden w-full md:flex md:w-auto md:order-1"
          id="navbar-search"
        >
          <div className="relative mt-3 md:hidden" ref={searchRef}>
            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
              <svg
                className="w-4 h-4 text-gray-500"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 20"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                />
              </svg>
            </div>
            <motion.input
              type="text"
              id="search-navbar-mobile"
              className="block w-full p-2 ps-10 text-base text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-teal-500 focus:border-teal-500"
              placeholder="Search products..."
              value={searchTerm}
              onChange={handleSearchChange}
              whileFocus={{ scale: 1.05, boxShadow: '0 0 8px rgba(20, 184, 166, 0.5)' }}
            />
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
                      <div
                        key={product._id}
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 flex items-center gap-3"
                        onClick={() => handleProductSelect(product._id)}
                      >
                        <div className="w-10 h-10 rounded-md overflow-hidden flex-shrink-0">
                          <img
                            src={
                              product.images[0]?.startsWith('http')
                                ? product.images[0]
                                : `${import.meta.env.VITE_API_URL}/images/${product.images[0]}`
                            }
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder.svg';
                            }}
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{product.name}</h3>
                          <p className="text-sm text-gray-500">{product.brand}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500">No products found</div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <ul
            className={`flex flex-col p-4 space-y-1 md:space-y-0 md:p-0 mt-4 font-medium border border-gray-100 rounded-lg md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 ${
              scrollPosition > 50 ? 'bg-gray-50 md:bg-white' : 'bg-gray-50 md:bg-transparent'
            }`}
          >
            <motion.li
              key="home"
              onMouseEnter={() => handleHover('home', true)}
              onMouseLeave={() => handleHover('home', false)}
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            >
              <button
                onClick={() => navigate('/', { replace: true })}
                className={`block py-3 px-4 rounded-sm md:bg-transparent md:p-0 text-base relative ${
                  scrollPosition > 50
                    ? 'text-teal-700 md:text-teal-700'
                    : 'text-black md:text-black'
                }`}
                aria-current="page"
              >
                Home
                <motion.span
                  className="absolute bottom-0 left-0 w-full h-0.5 bg-teal-500 md:bg-teal-500"
                  initial={{ width: 0 }}
                  animate={{ width: isHovering.home ? '100%' : 0 }}
                  transition={{ duration: 0.2 }}
                />
              </button>
            </motion.li>
            {isLoggedIn && isAdmin && (
              <motion.li
                key="dashboard"
                onMouseEnter={() => handleHover('dashboard', true)}
                onMouseLeave={() => handleHover('dashboard', false)}
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              >
                <Link
                  to="/dashboard"
                  className={`block py-3 px-4 rounded-sm md:bg-transparent md:p-0 text-base relative ${
                    scrollPosition > 50
                      ? 'text-teal-700 md:text-teal-700'
                      : 'text-black md:text-black'
                  }`}
                >
                  Dashboard
                  <motion.span
                    className="absolute bottom-0 left-0 w-full h-0.5 bg-teal-500 md:bg-teal-500"
                    initial={{ width: 0 }}
                    animate={{ width: isHovering.dashboard ? '100%' : 0 }}
                    transition={{ duration: 0.2 }}
                  />
                </Link>
              </motion.li>
            )}
            <li key="category" className="relative">
              {/* Mobile View: Toggle dropdown items inline */}
              <div className="md:hidden">
                <motion.button
                  onClick={toggleCategoryDropdown}
                  className={`py-3 px-4 bg-transparent rounded-sm text-base font-medium inline-flex items-center w-full text-left ${
                    scrollPosition > 50 ? 'text-black' : 'text-black'
                  }`}
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span onClick={handleCategoryTextClick}>Category</span>{' '}
                  <motion.svg
                    className="w-2.5 h-2.5 ms-4"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 10 6"
                    animate={{ rotate: isCategoryDropdownOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m1 1 4 4 4-4"
                    />
                  </motion.svg>
                </motion.button>
                <AnimatePresence>
                  {isCategoryDropdownOpen && (
                    <motion.ul
                      className="pl-4 space-y-1 overflow-y-auto max-h-24"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {categories.map((cat) => (
                        <li key={cat._id}>
                          <Link
                            to={`/category/${cat._id}`}
                            className="block px-4 py-3 hover:bg-gray-100 text-base rounded-sm"
                          >
                            {categoryTitles[cat.category]}
                          </Link>
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
              {/* Desktop View: Use Flowbite dropdown */}
              <motion.div
                className="hidden md:block"
                onMouseEnter={() => handleHover('category', true)}
                onMouseLeave={() => handleHover('category', false)}
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              >
                <button
                  id="dropdownDefaultButton"
                  data-dropdown-toggle="dropdown"
                  className={`py-3 px-4 bg-transparent rounded-sm md:bg-transparent md:hover:text-teal-700 md:p-0 text-base font-medium inline-flex items-center w-full text-left relative ${
                    scrollPosition > 50 ? 'text-black' : 'text-black'
                  }`}
                  type="button"
                >
                  <span onClick={handleCategoryTextClick}>Category</span>{' '}
                  <svg
                    className="w-2.5 h-2.5 ms-4"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 10 6"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m1 1 4 4 4-4"
                    />
                  </svg>
                  <motion.span
                    className="absolute bottom-0 left-0 w-full h-0.5 bg-teal-500"
                    initial={{ width: 0 }}
                    animate={{ width: isHovering.category ? '100%' : 0 }}
                    transition={{ duration: 0.2 }}
                  />
                </button>
                <div
                  id="dropdown"
                  className="z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow-md w-44"
                >
                  <ul
                    className="py-2 text-base text-gray-700 space-y-1 overflow-y-auto max-h-60" // Fixed height and scroll
                    aria-labelledby="dropdownDefaultButton"
                  >
                    {categories.map((cat) => (
                      <li key={cat._id}>
                        <Link
                          to={`/category/${cat._id}`}
                          className="block px-4 py-3 hover:bg-gray-100 text-base rounded-sm"
                        >
                          {categoryTitles[cat.category]}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            </li>

            <motion.li
              key="about"
              onMouseEnter={() => handleHover('about', true)}
              onMouseLeave={() => handleHover('about', false)}
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            >
              <Link
                to="/about"
                className={`block py-3 px-4 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:hover:text-teal-700 md:p-0 text-base relative ${
                  scrollPosition > 50 ? 'text-black' : 'text-black'
                }`}
              >
                About
                <motion.span
                  className="absolute bottom-0 left-0 w-full h-0.5 bg-teal-500"
                  initial={{ width: 0 }}
                  animate={{ width: isHovering.about ? '100%' : 0 }}
                  transition={{ duration: 0.2 }}
                />
              </Link>
            </motion.li>
            {!isLoggedIn ? (
              <>
                <motion.li
                  key="login"
                  onMouseEnter={() => handleHover('login', true)}
                  onMouseLeave={() => handleHover('login', false)}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                >
                  <Link
                    to="/user/login"
                    className={`block py-3 px-4 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:hover:text-teal-700 md:p-0 text-base relative ${
                      scrollPosition > 50 ? 'text-black' : 'text-black'
                    }`}
                  >
                    Login
                    <motion.span
                      className="absolute bottom-0 left-0 w-full h-0.5 bg-teal-500"
                      initial={{ width: 0 }}
                      animate={{ width: isHovering.login ? '100%' : 0 }}
                      transition={{ duration: 0.2 }}
                    />
                  </Link>
                </motion.li>
              </>
            ) : (
              <>
                 
              </>
            )}
            
          </ul>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
