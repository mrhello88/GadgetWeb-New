import { CryptoTokenModel } from '../../../models/CryptoToken.model';
import { UserModel } from '../../../models/User.model';
import crypto from 'crypto';
import { sendEmail } from '../../../utils/nodeMailer';



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


export const authResolvers = {
  Query: {
    getUser: async (_: any, { _id }: { _id: string }, { authorize }: { authorize: ResultGraphql }) => {
      try {
        // Check if user is authorized
        if (!authorize.success) {
          return { success: false, data: null, message: 'Unauthorized', statusCode: 401 };
        }
        
        // If _id is empty, get the current user from the token
        if (!_id && authorize.data) {
          const user = await UserModel.findOne({ email: authorize.data.email });
          if (!user) {
            return { success: false, data: null, message: 'User not found', statusCode: 404 };
          }
          return { 
            success: true, 
            data: user, 
            message: 'User fetched successfully',
            statusCode: 200
          };
        }
        
        const user = await UserModel.findById(_id);
        if (!user) {
          return { success: false, data: null, message: 'User not found', statusCode: 404 };
        }
        
        return { 
          success: true, 
          data: user, 
          message: 'User fetched successfully',
          statusCode: 200
        };
      } catch (error: unknown) {
        return { success: false, data: null, message: `Error fetching user: ${error}`, statusCode: 500 };
      }
    },
    getUsers: async () => {
      try {
        const users = await UserModel.find();
        return users;
      } catch (error: unknown) {
        throw new Error(`Error fetching users: ${error}`);
      } 
    },
  },

  Mutation: {
    registerUser: async (
      _: any,
      {
        name,
        email,
        password,
        isAdmin,
        confirmPassword,
      }: {
        name: string;
        email: string;
        password: string;
        isAdmin: boolean;
        confirmPassword: string;
      },
    ) => {
      try {
        const user = await UserModel.findOne({ email });

        if (user) {
          return { success: false, data: null, message: 'User exist already!', statusCode: 409 };
        }

        if (!(password === confirmPassword)) {
          return {
            success: false,
            data: null,
            message: 'Passwords do not match!',
            statusCode: 400,
          };
        }
        const hashedPassword = await UserModel.hashPassword(password);
        const token = crypto.randomBytes(32).toString('hex');
        const cryptoTokenUser = await CryptoTokenModel.create({
          name,
          email,
          password: hashedPassword,
          isAdmin,
          token,
        });

        if (!cryptoTokenUser) {
          return {
            success: false,
            data: null,
            message: 'Email not Send to you for Verification, please try again!',
            statusCode: 500,
          };
        }

        await sendEmail(cryptoTokenUser.email, cryptoTokenUser.token);
        return { message: 'Email sent successfully', success: true, data: null, statusCode: 200 };
      } catch (error: unknown) {
        return { success: false, data: null, message: `Error creating users: ${error}` };
      }
    },

    //token from email, for verify
    verifyUser: async (_: any, { token }: { token: string }) => {
      try {
        const cryptoTokenUser = await CryptoTokenModel.findOne({ token });
        if (!cryptoTokenUser) {
          return { success: false, data: null, message: 'Invalid token', statusCode: 400 };
        }
        const { name, email, password, isAdmin } = cryptoTokenUser;
        const user = await UserModel.create({
          name,
          email,
          password,
          isAdmin,
        });
        if (!user) {
          return { success: false, data: null, message: 'User not created', statusCode: 500 };
        }
        const jwtToken = user.jwtAuthentication(name, email, isAdmin);
       
        await CryptoTokenModel.findByIdAndDelete(cryptoTokenUser._id);
        return {
          success: true,
          data: user,
          message: 'User created successfully',
          token: jwtToken,
          statusCode: 200,
        };
      } catch (error: unknown) {
        return { success: false, data: null, message: `Error verifying user: ${error}` };
      }
    },

    loginUser: async (
      _: any,
      { email, password, isAdmin }: { email: string; password: string; isAdmin: boolean },
      { result }: { result: ResultGraphql },
    ) => {
      try {
        const user = await UserModel.findOne({ email, isAdmin });
        if (!user) {
          return { success: false, data: null, message: 'User not found', statusCode: 404 };
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
          return { success: false, data: null, message: 'Invalid credentials', statusCode: 401 };
        }

        const jwtToken = user.jwtAuthentication(user.name, user.email, user.isAdmin);
       
        return {
          success: true,
          data: user,
          message: 'User logged in successfully',
          token: jwtToken,
          statusCode: 200,
        };
      } catch (error: unknown) {
        return { success: false, data: null, message: `Error logging in user: ${error}` };
      }
    },

    updateUser: async (_: any, { _id }: { _id: string }) => {
      try {
        const updatedUser = await UserModel.findByIdAndUpdate(
          _id,
          { isAdmin: true },
          { new: true },
        );
        return { success: true, data: updatedUser, message: 'User updated successfully' };
      } catch (error: unknown) {
        return { success: false, data: null, message: `Error updating user: ${error}` };
      }
    },

    updateUserProfile: async (
      _: any,
      { 
        _id, 
        name, 
        email,
        profileImage
      }: { 
        _id: string; 
        name: string; 
        email: string;
        profileImage?: string;
      },
      { authorize }: { authorize: ResultGraphql }
    ) => {
      try {
        // Check if user is authorized
        if (!authorize.success) {
          return { success: false, data: null, message: 'Unauthorized', statusCode: 401 };
        }
        
        const user = await UserModel.findById(_id);
        if (!user) {
          return { success: false, data: null, message: 'User not found', statusCode: 404 };
        }
        
        // If updating email, check if it's available
        if (email !== user.email) {
          const existingUser = await UserModel.findOne({ email });
          if (existingUser) {
            return { success: false, data: null, message: 'Email already in use', statusCode: 409 };
          }
        }
        
        // Update user profile
        user.name = name;
        user.email = email;
        if (profileImage) {
          user.profileImage = profileImage;
        }
        
        await user.save();
        
        return {
          success: true,
          data: user,
          message: 'Profile updated successfully',
          statusCode: 200
        };
      } catch (error: unknown) {
        return { 
          success: false, 
          data: null, 
          message: `Error updating profile: ${error instanceof Error ? error.message : String(error)}`,
          statusCode: 500 
        };
      }
    },
    
    toggleUserStatus: async (_: any, { userId }: { userId: string }, { authorize }: { authorize: ResultGraphql }) => {
      try {
        // Check if user is authorized and is admin
        if (!authorize.success || !authorize.data) {
          return { success: false, data: null, message: 'Unauthorized', statusCode: 401 };
        }
        
        if (!authorize.data.isAdmin) {
          return { success: false, data: null, message: 'Admin privileges required', statusCode: 403 };
        }
        
        const user = await UserModel.findById(userId);
        if (!user) {
          return { success: false, data: null, message: 'User not found', statusCode: 404 };
        }
        
        // Toggle user status
        user.status = user.status === 'active' ? 'inactive' : 'active';
        await user.save();
        
        return {
          success: true,
          data: user,
          message: `User ${user.status === 'active' ? 'activated' : 'deactivated'} successfully`,
          statusCode: 200
        };
      } catch (error: unknown) {
        return { 
          success: false, 
          data: null, 
          message: `Error toggling user status: ${error instanceof Error ? error.message : String(error)}`,
          statusCode: 500 
        };
      }
    },
  },
};
