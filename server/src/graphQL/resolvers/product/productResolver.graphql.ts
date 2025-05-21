import { ProductModel } from '../../../models/Product.model';
import { CategoryModel } from '../../../models/Category.model';
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
      try {;
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

    getAllProducts: async () => {
      try {
        const products = await ProductModel.find().populate('relatedProducts');
        return {
          success: true,
          message: 'Products retrieved successfully',
          data: products,
          statusCode: 200,
        };
      } catch (error: any) {
        return {
          success: false,
          message: error.message,
          data: [],
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
        const addInCategory = await CategoryModel.findOneAndUpdate(
          { category },
          {
            $push: { products: product._id },
          },
          { new: true, upsert: true },
        );
        if (!addInCategory) {
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
        const product = await ProductModel.findByIdAndDelete(_id);
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
          message: 'Product deleted successfully',
          data: null,
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
