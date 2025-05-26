import { UserModel } from '../../../models/User.model';

interface ExistUserData {
  name: string;
  email: string;
  isAdmin: boolean;
  jwtToken: string;
}
interface ResultGraphql {
  message: string;
  success: boolean;
  data: ExistUserData;
}
export const adminResolvers = {
  Query: {
    getAdmin: async (
      _: any,
      { email }: { email: string },
      { result }: { result: ResultGraphql },
    ) => {
      try {
        const admin = await UserModel.findOne({ email, isAdmin: true });

        if (!admin) {
          return { success: false, data: null, message: 'Admin not found', statusCode: 404 };
        }

        return {
          success: true,
          data: admin,
          message: 'Admin fetched successfully',
          statusCode: 200,
        }; 
      } catch (error) {
        return {
          success: false,
          data: null,
          message: `Error fetching admin: ${error}`,
          statusCode: 500,
        };
      }
    },
  },

  Mutation: {

  },
};
 