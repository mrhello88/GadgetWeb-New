import { CategoryModel } from '../../../models/Category.model';
export const categoryResolver = {
  Query: {
    getProductsByCategory: async (
      _: any,
      { category, limit = 10, offset = 0 }: { category: String; limit: number; offset: number },
    ) => {
      try {
        const productsByCategory = await CategoryModel.find().populate({
          path: 'products',
          populate: [
            { path: 'relatedProducts' },
            { path: 'reviews' }
          ],
        });
        if (!productsByCategory) {
          return {
            success: false,
            message: 'No products found for this category',
            data: null,
            statusCode: 404,
          };
        }
        return {
          success: true,
          message: 'Products retrieved successfully',
          data: productsByCategory,
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
  },

  Mutation: {
    AddCategory: async (
      _: any,
      { category, description, image }: { category: string; description: string; image: string },
    ) => {
      const existingCategory = await CategoryModel.findOne({ category });
      if (existingCategory) {
        return {
          success: false,
          data: [],
          message: 'Category already exists',
          statusCode: 409,
        };
      }

      const addCategory = await CategoryModel.create({
        category,
        description,
        image,
        products: [],
      });

      if (!addCategory) {
        return {
          success: false,
          data: [],
          message: 'Category not Added',
          statusCode: 401,
        };
      }

      return {
        success: true,
        data: [addCategory],
        message: 'Category Added SuccessFully',
        statusCode: 200,
      };
    },
  },
};
