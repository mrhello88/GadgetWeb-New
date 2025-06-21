import { ProductModel } from '../../../models/Product.model';
import { CategoryModel } from '../../../models/Category.model';
import { ReviewModel } from '../../../models/Review.model';
import path from 'path';
import { Types } from 'mongoose';
import fs from 'fs';

interface Specification {
  name: string;
  value: string;
}
// Resolver
export const productResolver = {
  Query: {
    getProduct: async (_: any, { _id }: { _id: String }) => {
      try {
        const product = await ProductModel.findById(_id)
          .populate({
            path: 'reviews',
            model: 'Review',
            options: { sort: { createdAt: -1 } }
          })
          .populate('relatedProducts')
          .lean();
        if (!product) {
          return {
            success: false,
            message: 'Product not found',
            data: null,
            statusCode: 404,
          };
        }
   
        return {
          success: true,
          message: 'Product retrieved successfully',
          data: product,
          statusCode: 200,
        };
      } catch (error: any) {
        return {
          success: false,
          message: error.message,
          data: null,
          statusCode: 500,
        };
      }
    },

    getAllProducts: async (_: any, { 
      limit = 20, 
      offset = 0,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search
    }: { 
      limit?: number; 
      offset?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
      search?: string;
    }) => {
      try {
        const query: any = {};
        
        // Add search functionality
        if (search) {
          query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { brand: { $regex: search, $options: 'i' } },
            { category: { $regex: search, $options: 'i' } },
            { 'specifications.name': { $regex: search, $options: 'i' } },
            { 'specifications.value': { $regex: search, $options: 'i' } },
            { features: { $regex: search, $options: 'i' } }
          ];
        }

        const sortDirection = sortOrder === 'asc' ? 1 : -1;
        const sortObj: any = {};
        sortObj[sortBy] = sortDirection;

        const products = await ProductModel.find(query)
          .populate('relatedProducts')
          .sort(sortObj)
          .limit(limit)
          .skip(offset)
          .lean();

        const total = await ProductModel.countDocuments(query);

        if (!products.length) { 
          return {
            success: true,
            message: 'No products found',
            data: [],
            total: 0,
            hasMore: false,
            statusCode: 200,
          };
        }

        return {
          success: true,
          message: 'Products retrieved successfully',
          data: products,
          total,
          hasMore: offset + products.length < total,
          statusCode: 200,
        };
      } catch (error: any) {
        return {
          success: false,
          message: error.message,
          data: [],
          total: 0,
          hasMore: false,
          statusCode: 500,
        };
      }
    },

    getProductsByCategory: async (_: any, { 
      category,
      limit = 20, 
      offset = 0,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      filters
    }: { 
      category: string;
      limit?: number; 
      offset?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
      filters?: {
        brand?: string;
        minPrice?: number;
        maxPrice?: number;
        minRating?: number;
        search?: string;
        priceRange?: string;
        specifications?: Array<{name: string; value: string}>;
      };
    }) => {
      try {
        const query: any = { category: { $regex: category, $options: 'i' } };

        // Apply additional filters if provided
        if (filters) {
          if (filters.brand) {
            query.brand = { $regex: filters.brand, $options: 'i' };
          }
          
          if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
            query.price = {};
            if (filters.minPrice !== undefined) query.price.$gte = filters.minPrice;
            if (filters.maxPrice !== undefined) query.price.$lte = filters.maxPrice;
          }

          // Handle price range filter
          if (filters.priceRange) {
            switch (filters.priceRange) {
              case 'under-100':
                query.price = { $lt: 100 };
                break;
              case '100-300':
                query.price = { $gte: 100, $lte: 300 };
                break;
              case '300-500':
                query.price = { $gte: 300, $lte: 500 };
                break;
              case '500-1000':
                query.price = { $gte: 500, $lte: 1000 };
                break;
              case 'over-1000':
                query.price = { $gt: 1000 };
                break;
            }
          }
          
          if (filters.minRating !== undefined) {
            query.rating = { $gte: filters.minRating };
          }

          // Handle specifications filter
          if (filters.specifications && filters.specifications.length > 0) {
            query.$and = filters.specifications.map(spec => ({
              'specifications': {
                $elemMatch: {
                  name: { $regex: spec.name, $options: 'i' },
                  value: { $regex: spec.value, $options: 'i' }
                }
              }
            }));
          }
          
          if (filters.search) {
            const searchConditions = [
              { name: { $regex: filters.search, $options: 'i' } },
              { description: { $regex: filters.search, $options: 'i' } },
              { brand: { $regex: filters.search, $options: 'i' } },
              { 'specifications.name': { $regex: filters.search, $options: 'i' } },
              { 'specifications.value': { $regex: filters.search, $options: 'i' } },
              { features: { $regex: filters.search, $options: 'i' } }
            ];
            
            if (query.$and) {
              query.$and.push({ $or: searchConditions });
            } else {
              query.$or = searchConditions;
            }
          }
        }

        const sortDirection = sortOrder === 'asc' ? 1 : -1;
        const sortObj: any = {};
        sortObj[sortBy] = sortDirection;

        const products = await ProductModel.find(query)
          .sort(sortObj)
          .limit(limit)
          .skip(offset)
          .lean();

        const total = await ProductModel.countDocuments(query);

        if (!products.length) {
          return {
            success: true,
            message: 'No products found in this category',
            data: [],
            total: 0,
            hasMore: false,
            statusCode: 200,
          };
        }

        return {
          success: true,
          message: 'Category products retrieved successfully',
          data: products,
          total,
          hasMore: offset + products.length < total,
          statusCode: 200,
        };
      } catch (error: any) {
        return {
          success: false,
          message: error.message,
          data: [],
          total: 0,
          hasMore: false,
          statusCode: 500,
        };
      }
    },

    getProductsByFilters: async (_: any, { 
      filters,
      limit = 20, 
      offset = 0,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    }: { 
      filters: {
        category?: string;
        brand?: string;
        minPrice?: number;
        maxPrice?: number;
        minRating?: number;
        search?: string;
      };
      limit?: number; 
      offset?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }) => {
      try {
        const query: any = {};

        // Apply filters
        if (filters.category) {
          query.category = { $regex: filters.category, $options: 'i' };
        }
        
        if (filters.brand) {
          query.brand = { $regex: filters.brand, $options: 'i' };
        }
        
        if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
          query.price = {};
          if (filters.minPrice !== undefined) query.price.$gte = filters.minPrice;
          if (filters.maxPrice !== undefined) query.price.$lte = filters.maxPrice;
        }
        
        if (filters.minRating !== undefined) {
          query.rating = { $gte: filters.minRating };
        }
        
        if (filters.search) {
          query.$or = [
            { name: { $regex: filters.search, $options: 'i' } },
            { description: { $regex: filters.search, $options: 'i' } },
            { brand: { $regex: filters.search, $options: 'i' } },
            { 'specifications.name': { $regex: filters.search, $options: 'i' } },
            { 'specifications.value': { $regex: filters.search, $options: 'i' } },
            { features: { $regex: filters.search, $options: 'i' } }
          ];
        }

        const sortDirection = sortOrder === 'asc' ? 1 : -1;
        const sortObj: any = {};
        sortObj[sortBy] = sortDirection;

        const products = await ProductModel.find(query)
          .populate('relatedProducts')
          .sort(sortObj)
          .limit(limit)
          .skip(offset)
          .lean();

        const total = await ProductModel.countDocuments(query);

        if (!products.length) {
          return {
            success: true,
            message: 'No products found matching the specified filters',
            data: [],
            total: 0,
            hasMore: false,
            statusCode: 200,
          };
        }

        return {
          success: true,
          message: 'Filtered products retrieved successfully',
          data: products,
          total,
          hasMore: offset + products.length < total,
          statusCode: 200,
        };
      } catch (error: any) {
        return {
          success: false,
          message: error.message,
          data: [],
          total: 0,
          hasMore: false,
          statusCode: 500,
        };
      }
    },

    getCategories: async (_: any, { 
      limit = 10, 
      offset = 0 
    }: { 
      limit?: number; 
      offset?: number; 
    }) => {
      try {
        const categories = await CategoryModel.find()
          .populate({
            path: 'products',
            populate: [
              { path: 'relatedProducts' },
              { path: 'reviews' }
            ],
          })
          .limit(limit)
          .skip(offset)
          .lean();

        const total = await CategoryModel.countDocuments();

        if (!categories.length) {
          return {
            success: true,
            message: 'No categories found',
            data: [],
            total: 0,
            hasMore: false,
            statusCode: 200,
          };
        }

        return {
          success: true,
          message: 'Categories retrieved successfully',
          data: categories,
          total,
          hasMore: offset + categories.length < total,
          statusCode: 200,
        };
      } catch (error: any) {
        return {
          success: false,
          message: error.message,
          data: [],
          total: 0,
          hasMore: false,
          statusCode: 500,
        };
      }
    },

    // getProductsByCategory: async (
    //   _: any,
    //   { category, limit = 10, offset = 0 }: { category: String; limit: number; offset: number },
    // ) => {
    //   try {
    //     const products = await ProductModel.find({ category }).limit(limit).skip(offset);
    //     return {
    //       success: true,
    //       message: 'Products retrieved successfully',
    //       data: products,
    //       statusCode: 200,
    //     };
    //   } catch (error: any) {
    //     return {
    //       success: false,
    //       message: error.message,
    //       data: null,
    //       statusCode: 500,
    //     };
    //   }
    // },

    // getAllProducts: async (
    //   _: any,
    //   { limit = 10, offset = 0 }: { limit: number; offset: number },
    // ) => {
    //   try {
    //     const products = await ProductModel.find().limit(limit).skip(offset);
    //     return {
    //       success: true,
    //       message: 'Products retrieved successfully',
    //       data: products,
    //       statusCode: 200,
    //     };
    //   } catch (error: any) {
    //     return {
    //       success: false,
    //       message: error.message,
    //       data: null,
    //       statusCode: 500,
    //     };
    //   }
    // },
  },

  Mutation: {
    addProduct: async (
      _: any,
      {
        name,
        description,
        price,
        category,
        brand,
        specifications,
        features,
        images,
      }: {
        name: String;
        description: String;
        price: number;
        category: String;
        brand: String;
        specifications: Specification[];
        features: String[];
        review: Object[];
        images: String[];
      },
    ) => {
      try {
        const relatedProducts = await ProductModel.aggregate([
          { $match: { category } },
          { $sample: { size: 3 } },
        ]);
        const relatedProductIds = relatedProducts.map((product) => product._id);
        const product = await ProductModel.create({
          name, 
          description,
          price,
          brand,
          category,
          specifications,
          images,
          features,
          relatedProducts: relatedProductIds,
        });
        if (!product) {
          return {
            success: false,
            message: 'Product not created',
            data: null,
            statusCode: 400,
          };
        }
        // Check if category exists, if not create it with basic info
        let categoryDoc = await CategoryModel.findOne({ category });
        if (!categoryDoc) {
          // Create category if it doesn't exist
          categoryDoc = await CategoryModel.create({
            category,
            description: `All ${category} products`,
            image: 'default-category.png', // You can set a default image
            products: [product._id]
          });
        } else {
          // Add product to existing category
          await CategoryModel.findOneAndUpdate(
            { category },
            { $addToSet: { products: product._id } }
          );
        }
        
        if (!categoryDoc) {
          return {
            success: false,
            message: 'Product not added to category',
            data: null,
            statusCode: 400,
          };
        }
        const populatedProduct = await ProductModel.findById(product._id).populate(
          'relatedProducts',
        );
        return {
          success: true,
          message: 'Product added successfully',
          data: populatedProduct,
          statusCode: 201,
        };
      } catch (error: any) {
        return {
          success: false,
          message: error.message,
          data: null,
          statusCode: 500,
        };
      }
    },

    updateProduct: async (
      _: any,
      {
        _id,
        name,
        description,
        price,
        category,
        brand,
        specifications,
        features,
        images,
      }: {
        _id: string;
        name: String;
        description: String;
        price: number;
        category: String;
        brand: String;
        specifications: Specification[];
        features: String[];
        images: String[];
      },
    ) => {
      try {
        // Find the product first
        const existingProduct = await ProductModel.findById(_id);
        if (!existingProduct) {
          return {
            success: false,
            message: 'Product not found',
            data: null,
            statusCode: 404,
          };
        }

        // Get related products if category has changed
        let relatedProductIds = existingProduct.relatedProducts;
        if (category !== existingProduct.category) {
          const relatedProducts = await ProductModel.aggregate([
            { $match: { category } },
            { $sample: { size: 3 } },
          ]);
          relatedProductIds = relatedProducts.map((product) => product._id);

          // Update category reference if changed
          await CategoryModel.findOneAndUpdate(
            { category: existingProduct.category },
            { $pull: { products: _id } }
          );
          
          await CategoryModel.findOneAndUpdate(
            { category },
            { $addToSet: { products: _id } },
            { upsert: true }
          );
        }

        // Update the product
        const updatedProduct = await ProductModel.findByIdAndUpdate(
          _id,
          {
            name,
            description,
            price,
            brand,
            category,
            specifications,
            features,
            images,
            relatedProducts: relatedProductIds,
          },
          { new: true }
        ).populate('relatedProducts');

        return {
          success: true,
          message: 'Product updated successfully',
          data: updatedProduct,
          statusCode: 200,
        };
      } catch (error: any) {
        return {
          success: false,
          message: error.message,
          data: null,
          statusCode: 500,
        };
      }
    },

    deleteProduct: async (_: any, { _id }: { _id: String }) => {
      try {
        // First find the product to get its category
        const product = await ProductModel.findById(_id);
        if (!product) {
          return {
            success: false,
            message: 'Product not found',
            data: null,
            statusCode: 404,
          };
        }

        // Delete all reviews associated with the product
        await ReviewModel.deleteMany({ productId: _id });

        // Delete the product's images if they exist
        if (product.images && product.images.length > 0) {
          product.images.forEach(image => {
            // Only delete if it's a local image (not an external URL)
            if (!image.startsWith('http')) {
              const imagePath = path.join(__dirname, '../../../public/images', image);
              if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
              }
            }
          });
        }

        // Remove product reference from the category
        await CategoryModel.updateOne(
          { category: product.category },
          { $pull: { products: product._id } }
        );

        // Delete the product
        await ProductModel.findByIdAndDelete(_id);

        return {
          success: true,
          message: 'Product, related images, and associated reviews deleted successfully',
          data: product,
          statusCode: 200,
        };
      } catch (error: any) {
        console.error('Error deleting product:', error);
        return {
          success: false,
          message: error.message,
          data: null,
          statusCode: 500,
        };
      }
    },

    deleteCategory: async (_: any, { id }: { id: string }, context: any) => {
      try {
        // Check authorization
        if (!context.authorize.success) {
          return {
            success: false,
            message: 'Unauthorized access',
            data: null
          };
        }

        // Find the category first to get its image path
        const category = await CategoryModel.findById(id);
        if (!category) {
          return {
            success: false,
            message: 'Category not found',
            data: null
          };
        }

        // Delete all products associated with this category
        await ProductModel.deleteMany({ category: category.category });

        // Delete the category image if it exists
        if (category.image) {
          const imagePath = path.join(__dirname, '../../uploads/categories', category.image);
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
          }
        }

        // Delete the category
        await CategoryModel.findByIdAndDelete(id);

        return {
          success: true,
          message: 'Category and associated products deleted successfully',
          data: category
        };
      } catch (error) {
        console.error('Error deleting category:', error);
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Error deleting category',
          data: null
        };
      }
    }
  },
};
