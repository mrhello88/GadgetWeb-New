'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import {
  Search,
  X,
  PlusCircle,
  Smartphone,
  Laptop,
  Headphones,
  Tablet,
  BarChart3,
  PieChart,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../hooks/store/store';

// Animated decorations
const CircleDecoration = ({ className }: { className: string }) => (
  <svg className={className} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="50" fill="currentColor" />
  </svg>
);

const TriangleDecoration = ({ className }: { className: string }) => (
  <svg className={className} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <polygon points="50,0 100,100 0,100" fill="currentColor" />
  </svg>
);

const SquareDecoration = ({ className }: { className: string }) => (
  <svg className={className} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" fill="currentColor" />
  </svg>
);

const HexagonDecoration = ({ className }: { className: string }) => (
  <svg className={className} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <polygon points="50,0 100,25 100,75 50,100 0,75 0,25" fill="currentColor" />
  </svg>
);

const DonutDecoration = ({ className }: { className: string }) => (
  <svg className={className} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="50" fill="currentColor" />
    <circle cx="50" cy="50" r="25" fill="white" />
  </svg>
);

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

const rotateAnimation = {
  initial: { rotate: 0 },
  animate: {
    rotate: 360,
    transition: {
      duration: 20,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

interface Specification {
  name: string;
  value: string;
}

interface Products {
  _id: string;
  name: string;
  description: string;
  price: number;
  rating: number;
  reviewCount: number;
  images: string[];
  category: string;
  inStock: boolean;
  brand: string;
  specifications: Specification[];
  features: string[];
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  rating: number;
  reviewCount: number;
  images: string[];
  inStock: boolean;
  category: string;
  brand: string;
  relatedProducts: Products[];
  specifications: Specification[];
  features: string[];
}

interface Category {
  _id: string;
  description: string;
  category: string;
  image: string;
  products: Product[];
}

// Category icons mapping
const CategoryIcon = ({ category }: { category: string }) => {
  switch (category) {
    case 'smartphones':
      return <Smartphone className="w-5 h-5" />;
    case 'laptops':
      return <Laptop className="w-5 h-5" />;
    case 'tablets':
      return <Tablet className="w-5 h-5" />;
    case 'headphones':
      return <Headphones className="w-5 h-5" />;
    default:
      return <BarChart3 className="w-5 h-5" />;
  }
};

// Function to calculate similarity percentage between two products
const calculateSimilarity = (product1: Product, product2: Product): number => {
  const allSpecNames = new Set([
    ...product1.specifications.map((spec) => spec.name),
    ...product2.specifications.map((spec) => spec.name),
  ]);

  let matchCount = 0;
  const totalSpecs = allSpecNames.size;

  allSpecNames.forEach((specName) => {
    const spec1 = product1.specifications.find((s) => s.name === specName);
    const spec2 = product2.specifications.find((s) => s.name === specName);

    if (spec1 && spec2 && spec1.value === spec2.value) {
      matchCount++;
    }
  });

  return Math.round((matchCount / totalSpecs) * 100);
};

// Main Compare page component
const ProductCompare = () => {
  const { id } = useParams<{ id?: string }>();
  const { data } = useSelector((state: RootState) => state.product);
  const [searchTerm, setSearchTerm] = useState<string>('');
  // const [productsByCategory, setProductsByCategory] = useState<Category[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [showSearchResults, setShowSearchResults] = useState<boolean>(false);
  const [similarityScore, setSimilarityScore] = useState<number | null>(null);

  // Load and process Redux data
  useEffect(() => {
    if (data && data.success && Array.isArray(data.data)) {
      const categoriesData = data.data as Category[];
      // setProductsByCategory(categoriesData);

      // Flatten all products for easier lookup
      const allProds = categoriesData.flatMap((cat) =>
        cat.products.map((prod) => ({
          ...prod,
          rating: prod.rating ?? 0,
          reviewCount: prod.reviewCount ?? 0,
          inStock: prod.inStock ?? true,
          relatedProducts: prod.relatedProducts ?? [],
        }))
      );
      setAllProducts(allProds);

      // Extract unique categories
      const uniqueCategories = Array.from(new Set(categoriesData.map((cat) => cat.category)));
      setCategories(uniqueCategories);
    }
  }, [data]);

  // Handle URL parameter and initialize selected product
  useEffect(() => {
    if (id && allProducts.length > 0) {
      const foundProduct = allProducts.find((p) => p._id === id);
      if (foundProduct) {
        if (!selectedProducts.some((p) => p._id === id)) {
          setSelectedProducts([foundProduct]);
          setSelectedCategory(foundProduct.category);
        }
      } else {
        setSelectedProducts([]);
        setSelectedCategory('');
      }
    } else if (!id) {
      setSelectedProducts([]);
      setSelectedCategory('');
    }
  }, [id, allProducts]);

  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.length > 1 && selectedCategory) {
      const filteredProducts = allProducts.filter(
        (product) =>
          product.category === selectedCategory &&
          (product.name.toLowerCase().includes(value.toLowerCase()) ||
            product.brand.toLowerCase().includes(value.toLowerCase()))
      );
      setSearchResults(filteredProducts);
      setShowSearchResults(true);
    } else {
      setShowSearchResults(false);
    }
  };

  // Handle product selection
  const selectProduct = (product: Product) => {
    if (selectedProducts.some((p) => p._id === product._id)) {
      return;
    }

    if (selectedProducts.length < 3) {
      setSelectedProducts([...selectedProducts, product]);
    }

    setSearchTerm('');
    setShowSearchResults(false);
  };

  // Remove a product from comparison
  const removeProduct = (productId: string) => {
    setSelectedProducts(selectedProducts.filter((p) => p._id !== productId));
  };

  // Handle category change
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    // Keep URL-selected product if it matches the new category
    setSelectedProducts(
      id ? selectedProducts.filter((p) => p._id === id && p.category === category) : []
    );
    setSearchTerm('');
    setShowSearchResults(false);
  };

  // Calculate similarity when selected products change
  useEffect(() => {
    if (selectedProducts.length === 2) {
      const score = calculateSimilarity(selectedProducts[0], selectedProducts[1]);
      setSimilarityScore(score);
    } else if (selectedProducts.length === 3) {
      const score1 = calculateSimilarity(selectedProducts[0], selectedProducts[1]);
      const score2 = calculateSimilarity(selectedProducts[0], selectedProducts[2]);
      const score3 = calculateSimilarity(selectedProducts[1], selectedProducts[2]);
      const avgScore = Math.round((score1 + score2 + score3) / 3);
      setSimilarityScore(avgScore);
    } else {
      setSimilarityScore(null);
    }
  }, [selectedProducts]);

  // Get all specs from selected products for comparison
  const getAllSpecifications = () => {
    if (selectedProducts.length === 0) return [];

    const allSpecs = new Set<string>();
    selectedProducts.forEach((product) => {
      product.specifications.forEach((spec) => {
        allSpecs.add(spec.name);
      });
    });

    return Array.from(allSpecs);
  };

  // Capitalize category names for display
  const categoryTitles = categories.reduce(
    (acc, cat) => ({
      ...acc,
      [cat]: cat.charAt(0).toUpperCase() + cat.slice(1),
    }),
    {} as Record<string, string>
  );

  return (
    <>
      <Helmet>
        <title>Compare Products | Your Store</title>
        <meta
          name="description"
          content="Compare products side by side to find the perfect match for your needs."
        />
      </Helmet>

      {/* Background Shapes */}
      <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none">
        <TriangleDecoration className="absolute top-0 right-0 w-64 h-64 text-teal-100 opacity-40 transform -translate-y-32 translate-x-16" />
        <CircleDecoration className="absolute bottom-0 left-0 w-96 h-96 text-pink-100 opacity-30 transform translate-y-24 -translate-x-24" />
        <SquareDecoration className="absolute top-1/3 left-1/4 w-32 h-32 text-amber-100 opacity-30 transform -rotate-15" />
        <HexagonDecoration className="absolute top-3/4 right-1/4 w-48 h-48 text-teal-100 opacity-20" />
        <DonutDecoration className="absolute bottom-1/3 right-1/5 w-40 h-40 text-pink-100 opacity-40" />

        <motion.div
          initial="initial"
          animate="animate"
          variants={rotateAnimation}
          className="absolute top-1/4 left-1/2 w-72 h-72 text-amber-100 opacity-30"
        >
          <HexagonDecoration className="w-full h-full" />
        </motion.div>

        <motion.div
          initial="initial"
          animate="animate"
          variants={rotateAnimation}
          className="absolute top-2/3 left-1/3 w-48 h-48 text-teal-100 opacity-20"
        >
          <CircleDecoration className="w-full h-full" />
        </motion.div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="mb-10 text-center"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Compare {categoryTitles[selectedCategory] || 'Products'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Compare specifications side by side to find the perfect product for your needs. Search
            and add up to three products to compare.
          </p>
        </motion.div>

        {/* Category selector */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-5 py-2 rounded-full flex items-center gap-2 transition-colors ${
                  selectedCategory === cat
                    ? 'bg-teal-500 text-white shadow-md'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <CategoryIcon category={cat} />
                <span>{categoryTitles[cat]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Search and Selected Products Section */}
        <div className="max-w-6xl mx-auto mb-12">
          {/* Product search */}
          <div className="relative mb-8">
            <div className="flex items-center p-2 border border-gray-300 rounded-lg bg-white shadow-sm focus-within:ring-2 focus-within:ring-teal-500 focus-within:border-teal-500">
              <Search className="w-5 h-5 text-gray-400 ml-2" />
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder={`Search ${
                  categoryTitles[selectedCategory] || 'products'
                } to compare...`}
                className="flex-1 pl-3 py-2 border-none focus:outline-none focus:ring-0"
                disabled={!selectedCategory}
              />
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setShowSearchResults(false);
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Search results dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute z-20 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-80 overflow-y-auto">
                {searchResults.map((product) => (
                  <div
                    key={product._id}
                    className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 flex items-center gap-3"
                    onClick={() => selectProduct(product)}
                  >
                    <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
                      <img
                        // src={product.images[0]}
                        src={
                          product.images[0]?.startsWith('http')
                            ? product.images[0]
                            : `${import.meta.env.VITE_API_URL}/images/${product.images[0]}`
                        }
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{product.name}</h3>
                      <p className="text-sm text-gray-500">{product.brand}</p>
                    </div>
                    <div className="text-teal-600">
                      <PlusCircle className="w-5 h-5" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {showSearchResults && searchResults.length === 0 && (
              <div className="absolute z-20 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 p-4 text-center">
                <p className="text-gray-500">No products found</p>
              </div>
            )}
          </div>

          {/* Selected products for comparison */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className={`border rounded-xl p-4 min-h-[120px] flex ${
                  selectedProducts[index]
                    ? 'border-gray-200'
                    : 'border-dashed border-gray-300 bg-gray-50'
                }`}
              >
                {selectedProducts[index] ? (
                  <div className="flex flex-col w-full">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-md overflow-hidden">
                          <img
                            // src={selectedProducts[index].images[0]}
                            src={
                              selectedProducts[index].images[0]?.startsWith('http')
                                ? selectedProducts[index].images[0]
                                : `${import.meta.env.VITE_API_URL}/images/${
                                    selectedProducts[index].images[0]
                                  }`
                            }
                            alt={selectedProducts[index].name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="ml-3">
                          <h3 className="font-medium">{selectedProducts[index].name}</h3>
                          <p className="text-sm text-gray-500">{selectedProducts[index].brand}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeProduct(selectedProducts[index]._id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="mt-auto text-lg font-bold">
                      ${selectedProducts[index].price.toLocaleString()}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center w-full text-gray-400">
                    <PlusCircle className="w-10 h-10 mb-2" />
                    <p className="text-sm">Add a product to compare</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Similarity score visualization */}
          {similarityScore !== null && selectedProducts.length >= 2 && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className="bg-white rounded-xl shadow-lg p-6 mb-10 text-center"
            >
              <h2 className="text-2xl font-bold mb-4">Similarity Score</h2>
              <div className="flex justify-center items-center mb-4">
                <div className="relative w-40 h-40">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="10" />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke={
                        similarityScore > 70
                          ? '#10b981'
                          : similarityScore > 40
                          ? '#f59e0b'
                          : '#ef4444'
                      }
                      strokeWidth="10"
                      strokeDasharray={`${(similarityScore / 100) * 283} 283`}
                      strokeDashoffset="0"
                      transform="rotate(-90 50 50)"
                    />
                    <text
                      x="50"
                      y="55"
                      fontSize="22"
                      fontWeight="bold"
                      textAnchor="middle"
                      fill="#1f2937"
                    >
                      {similarityScore}%
                    </text>
                  </svg>
                </div>
              </div>
              <p className="text-gray-600">
                {similarityScore > 70
                  ? 'These products are very similar with many matching specifications!'
                  : similarityScore > 40
                  ? 'These products have moderate similarity with some matching specifications.'
                  : 'These products have substantial differences in specifications.'}
              </p>
            </motion.div>
          )}

          {/* Specs comparison table */}
          {selectedProducts.length > 0 && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className="bg-white rounded-xl shadow-lg overflow-hidden"
            >
              <div className="border-b border-gray-200 bg-gradient-to-r from-teal-50 to-teal-100">
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Specifications Comparison
                  </h2>
                  <p className="text-gray-600">Compare technical specifications side by side</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="py-4 px-6 text-left text-gray-500 font-medium">
                        Specification
                      </th>
                      {selectedProducts.map((product) => (
                        <th
                          key={product._id}
                          className="py-4 px-6 text-left text-gray-500 font-medium"
                        >
                          {product.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {getAllSpecifications().map((specName) => (
                      <tr key={specName} className="hover:bg-gray-50">
                        <td className="py-4 px-6 font-medium">{specName}</td>
                        {selectedProducts.map((product) => {
                          const spec = product.specifications.find((s) => s.name === specName);
                          const otherValues = selectedProducts
                            .filter((p) => p._id !== product._id)
                            .map((p) => p.specifications.find((s) => s.name === specName)?.value);

                          const isMatch = spec && otherValues.every((val) => val === spec.value);
                          const isPartialMatch =
                            spec && otherValues.some((val) => val === spec.value);
                          const isDifferent = spec && otherValues.length > 0 && !isPartialMatch;

                          return (
                            <td
                              key={`${product._id}-${specName}`}
                              className={`py-4 px-6 ${
                                !spec
                                  ? 'text-gray-400 italic'
                                  : isDifferent
                                  ? 'text-pink-600 font-medium'
                                  : isMatch
                                  ? 'text-teal-600 font-medium'
                                  : isPartialMatch
                                  ? 'text-amber-600 font-medium'
                                  : ''
                              }`}
                            >
                              {spec ? (
                                <div className="flex items-center">
                                  {isDifferent && (
                                    <XCircle className="w-4 h-4 mr-1 text-pink-500" />
                                  )}
                                  {isMatch && (
                                    <CheckCircle2 className="w-4 h-4 mr-1 text-teal-500" />
                                  )}
                                  {isPartialMatch && !isMatch && (
                                    <PieChart className="w-4 h-4 mr-1 text-amber-500" />
                                  )}
                                  {spec.value}
                                </div>
                              ) : (
                                'Not specified'
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                    <tr className="bg-gray-50 font-bold">
                      <td className="py-4 px-6">Price</td>
                      {selectedProducts.map((product) => (
                        <td key={`${product._id}-price`} className="py-4 px-6">
                          ${product.price.toLocaleString()}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="p-4 bg-gray-50 border-t border-gray-200">
                <div className="flex flex-wrap gap-4 justify-center text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-teal-500 mr-2"></div>
                    <span>Matching specs</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
                    <span>Partially matching</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-pink-500 mr-2"></div>
                    <span>Different specs</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Empty state */}
          {selectedProducts.length === 0 && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className="bg-white rounded-xl shadow-md p-10 text-center"
            >
              <div className="flex justify-center mb-4 text-teal-500">
                <Search className="w-16 h-16" />
              </div>
              <h3 className="text-xl font-bold mb-2">Start comparing products</h3>
              <p className="text-gray-600 mb-6">
                Select a category and search for {categoryTitles[selectedCategory] || 'products'} to
                add them to the comparison. You can compare up to 3 products side by side.
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProductCompare;
