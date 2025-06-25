import { axiosInstance } from '../../services/api';
import { createAsyncThunk } from '@reduxjs/toolkit';

type registerUserData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  isAdmin: boolean;
};

type loginUserData = {
  email: string;
  password: string;
  isAdmin: boolean;
};

type updateUserData = {
  _id: string;
  name: string;
  email: string;
  profileImage?: string;
};

export const RegisterUser = createAsyncThunk(
  'user/RegisterUser',
  async (userData: registerUserData, thunkApi) => {
    try {
      const response = await axiosInstance.post('/graphql', {
        query: `
        mutation RegisterUser($name: String!, $email: String!, $password: String!, $confirmPassword: String!, $isAdmin: Boolean!) {
  registerUser(name: $name, email: $email, password: $password, confirmPassword: $confirmPassword, isAdmin: $isAdmin) {
    success
    message
    data {
      _id
      name
      email
      isAdmin
    }
    token
    statusCode
  }
}
      `,
        variables: userData,
      });
      if (response?.data.data.registerUser.statusCode === 200) {
        return response?.data.data.registerUser || 'User created successfully';
      }
      return thunkApi.rejectWithValue(
        response?.data.data.registerUser.message || 'Something went wrong'
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        return thunkApi.rejectWithValue(error.message);
      }
    }
  }
);

export const verifyUser = createAsyncThunk('user/verifyUser', async (token: string, thunkApi) => {
  try {
    const response = await axiosInstance.post('/graphql', {
      query: `
        mutation VerifyUser($token: String!) {
          verifyUser(token: $token) {
            success
            message
            data {
              _id
              name
              email
              isAdmin
            }
            statusCode
            token
          }
        } 
      `,
      variables: { token },
    });
    if (response?.data.data.verifyUser.statusCode === 200) {
      return response?.data.data.verifyUser;
    }
    return thunkApi.rejectWithValue(
      response?.data.data.verifyUser.message || 'Something went wrong'
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      return thunkApi.rejectWithValue(error.message);
    }
  }
});

export const LoginUser = createAsyncThunk(
  'user/LoginUser',
  async (userData: loginUserData, thunkApi) => {
    try {
      const response = await axiosInstance.post('/graphql', {
        query: `
        mutation LoginUser($email: String!, $password: String!, $isAdmin: Boolean!) {
          loginUser(email: $email, password: $password, isAdmin: $isAdmin) {
            success
            message
            data {
              _id
              name
              email
              isAdmin
              }
              token
              statusCode
            }
          }`,
        variables: userData,
      });

      if (response?.data.data.loginUser.statusCode === 200) {
        return response?.data.data.loginUser || 'User logged in successfully';
      }

      return thunkApi.rejectWithValue(
        response?.data.data.loginUser.message || 'Something went wrong'
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        return thunkApi.rejectWithValue(error.message);
      }
    }
  }
);

export const getUserProfile = createAsyncThunk(
  'user/getUserProfile',
  async (userId: string, thunkApi) => {
    try {
      const response = await axiosInstance.post('/graphql', {
        query: `
        query GetUser($id: ID!) {
          getUser(_id: $id) {
            success
            message
            data {
              _id
              name
              email
              isAdmin
              profileImage
            }
            statusCode
          }
        }`,
        variables: { id: userId },
      });

      if (response?.data.data.getUser.statusCode === 200) {
        return response?.data.data.getUser || 'User profile fetched successfully';
      }

      return thunkApi.rejectWithValue(
        response?.data.data.getUser.message || 'Something went wrong'
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        return thunkApi.rejectWithValue(error.message);
      }
    }
  }
);

export const getCurrentUserProfile = createAsyncThunk(
  'user/getCurrentUserProfile',
  async (_, thunkApi) => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        return thunkApi.rejectWithValue('No authentication token found');
      }

      const response = await axiosInstance.post('/graphql', 
        {
          query: `
          query GetCurrentUser {
            getUser(_id: "") {
              success
              message
              data {
                _id
                name
                email
                isAdmin
                profileImage
              }
              statusCode
            }
          }`,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response?.data.data.getUser.statusCode === 200) {
        return response?.data.data.getUser || 'User profile fetched successfully';
      }

      return thunkApi.rejectWithValue(
        response?.data.data.getUser.message || 'Something went wrong'
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        return thunkApi.rejectWithValue(error.message);
      }
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'user/updateUserProfile',
  async (userData: updateUserData, thunkApi) => {
    try {
      const response = await axiosInstance.post('/graphql', {
        query: `
        mutation UpdateUserProfile($id: ID!, $name: String!, $email: String!, $profileImage: String) {
          updateUserProfile(_id: $id, name: $name, email: $email, profileImage: $profileImage) {
            success
            message
            data {
              _id
              name
              email
              isAdmin
              profileImage
            }
            statusCode
          }
        }`,
        variables: { 
          id: userData._id,
          name: userData.name,
          email: userData.email,
          profileImage: userData.profileImage
        },
      });

      if (response?.data.data.updateUserProfile.statusCode === 200) {
        return response?.data.data.updateUserProfile || 'User profile updated successfully';
      }

      return thunkApi.rejectWithValue(
        response?.data.data.updateUserProfile.message || 'Something went wrong'
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        return thunkApi.rejectWithValue(error.message);
      }
    }
  }
);

export const uploadProfileImage = createAsyncThunk(
  'user/uploadProfileImage',
  async (imageFile: File, thunkApi) => {
    try {
      // Client-side validation before upload
      if (imageFile.size > 2 * 1024 * 1024) { // 2MB limit
        return thunkApi.rejectWithValue('Image size is too large. Please select an image smaller than 2MB.');
      }

      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(imageFile.type)) {
        return thunkApi.rejectWithValue('Invalid file type. Please select a JPEG, PNG, GIF, or WebP image.');
      }

      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await axiosInstance.post('/api/profile/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 seconds timeout
      });

      if (response.status === 200) {
        return response.data.filename;
      }

      return thunkApi.rejectWithValue('Failed to upload profile image');
    } catch (error: any) {
      if (error.code === 'ECONNABORTED') {
        return thunkApi.rejectWithValue('Upload timeout. Please try again with a smaller image.');
      }
      
      if (error.response?.status === 413) {
        return thunkApi.rejectWithValue('Image size is too large. Please select an image smaller than 2MB.');
      }
      
      if (error.response?.data?.error === 'FILE_TOO_LARGE') {
        return thunkApi.rejectWithValue('Image size is too large. Please select an image smaller than 2MB.');
      }
      
      if (error.response?.data?.message) {
        return thunkApi.rejectWithValue(error.response.data.message);
      }
      
      if (error instanceof Error) {
        return thunkApi.rejectWithValue(error.message);
      }
      
      return thunkApi.rejectWithValue('Failed to upload profile image. Please try again.');
    }
  }
);

//get all users
export const getAllUsers = createAsyncThunk(
  'user/getAllUsers',
  async (_, thunkApi) => {
    try {
      const response = await axiosInstance.post('/graphql', {
        query: `
          query GetAllUsers {
            getUsers {
              _id
              name
              email
              isAdmin
              profileImage
              status
            }
          }
        `
      });

      const responseData = response.data;
      
      if (responseData.errors) {
        return thunkApi.rejectWithValue({
          message: responseData.errors[0].message,
        });
      }

      return {
        success: true,
        data: responseData.data.getUsers,
        message: 'Users fetched successfully'
      };
    } catch (error: any) {
      return thunkApi.rejectWithValue({
        message: error.message || 'Something went wrong',
      });
    }
  }
);

//toggle user status
export const toggleUserStatus = createAsyncThunk(
  'user/toggleStatus',
  async (userId: string, thunkApi) => {
    try {
      const response = await axiosInstance.post('/graphql', {
        query: `
          mutation ToggleUserStatus($userId: ID!) {
            toggleUserStatus(userId: $userId) {
              success
              message
              data {
                _id
                name
                email
                isAdmin
                profileImage
                status
              }
              statusCode
            }
          }
        `,
        variables: {
          userId
        }
      });

      const responseData = response.data;
      
      if (responseData.errors) {
        return thunkApi.rejectWithValue({
          message: responseData.errors[0].message,
        });
      }

      return responseData.data.toggleUserStatus;
    } catch (error: any) {
      return thunkApi.rejectWithValue({
        message: error.message || 'Something went wrong',
      });
    }
  }
);
