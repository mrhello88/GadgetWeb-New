import { CategoryModel } from '../../../models/Category.model';

export const categoryResolver = {
  Query: {
    // getCategories is already defined in productResolver, removing from here
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
