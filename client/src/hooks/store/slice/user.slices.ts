import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RegisterUser } from '../thunk/user.thunk';
import { verifyUser } from '../thunk/user.thunk';
import { LoginUser } from '../thunk/user.thunk';
import { getUserProfile, updateUserProfile, uploadProfileImage, getCurrentUserProfile } from '../thunk/user.thunk';
import { jwtDecode } from 'jwt-decode';

interface User {
  _id: number;
  name: string;
  email: string;
  isAdmin: boolean;
  profileImage?: string;
}
interface UserResponse {
  success: boolean;
  data: User | null;
  message: string;
  token?: string;
  statusCode?: number;
}

interface InitialState {
  data: UserResponse | null;
  loading: boolean;
  error: string | null;
  token?: string | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  profileImageLoading: boolean;
  profileImageError: string | null;
  profileImage: string | null;
}

const initialState: InitialState = {
  data: null,
  loading: false,
  error: null,
  token: localStorage.getItem('token') || null,
  isLoggedIn: false,
  isAdmin: false,
  profileImageLoading: false,
  profileImageError: null,
  profileImage: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    storeTokenInLocalStorage: (
      state,
      action: PayloadAction<{ token: string; isAdmin: boolean }>
    ) => {
      localStorage.removeItem('token');
      localStorage.setItem('token', action.payload.token);
      state.token = action.payload.token;
      state.isLoggedIn = true;
      state.isAdmin = action.payload.isAdmin;
    },
    logOutUser: (state) => {
      localStorage.removeItem('token');
      state.isLoggedIn = false;
      state.isAdmin = false;
      state.data = null;
      state.token = null;
    },
    isLoggedInUser: (state, action: PayloadAction<{ isLoggedIn: boolean; isAdmin: boolean }>) => {
      state.isLoggedIn = action.payload.isLoggedIn;
      state.isAdmin = action.payload.isAdmin;
    },
  },
  extraReducers: (builder) => {
    builder
      //registerUser when user register
      .addCase(RegisterUser.pending, (state) => {
        state.data = null;
        state.loading = true;
        state.error = null;
      })
      .addCase(RegisterUser.fulfilled, (state, action) => {
        state.error = null;
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(RegisterUser.rejected, (state, action) => {
        state.data = null;
        state.loading = false;
        state.error = action.payload as string;
      })
      //verifyUser when user click on the link in the email
      .addCase(verifyUser.pending, (state) => {
        state.data = null;
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyUser.fulfilled, (state, action) => {
        state.error = null;
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(verifyUser.rejected, (state, action) => {
        state.data = null;
        state.loading = false;
        state.error = action.payload as string;
      })

      //loginUser when user login
      .addCase(LoginUser.pending, (state) => {
        state.data = null;
        state.loading = true;
        state.error = null;
      })
      .addCase(LoginUser.fulfilled, (state, action) => {
        state.error = null;
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(LoginUser.rejected, (state, action) => {
        state.data = null;
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // getUserProfile
      .addCase(getUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserProfile.fulfilled, (state, action) => {
        state.error = null;
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(getUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // updateUserProfile
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.error = null;
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // uploadProfileImage
      .addCase(uploadProfileImage.pending, (state) => {
        state.profileImageLoading = true;
        state.profileImageError = null;
      })
      .addCase(uploadProfileImage.fulfilled, (state, action) => {
        state.profileImageLoading = false;
        state.profileImageError = null;
        state.profileImage = action.payload;
      })
      .addCase(uploadProfileImage.rejected, (state, action) => {
        state.profileImageLoading = false;
        state.profileImageError = action.payload as string;
      })
      
      // getCurrentUserProfile
      .addCase(getCurrentUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCurrentUserProfile.fulfilled, (state, action) => {
        state.error = null;
        state.loading = false;
        state.data = action.payload;
        // If we have a token, make sure isLoggedIn is true
        if (state.token) {
          state.isLoggedIn = true;
          // Set isAdmin based on user data
          if (action.payload?.data?.isAdmin) {
            state.isAdmin = action.payload.data.isAdmin;
          }
        }
      })
      .addCase(getCurrentUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        // If authentication fails, clear the token and logged in state
        if ((action.payload as string)?.includes('Unauthorized') || 
            (action.payload as string)?.includes('token')) {
          state.token = null;
          state.isLoggedIn = false;
          state.isAdmin = false;
          localStorage.removeItem('token');
        }
      });
  },
});

export const { storeTokenInLocalStorage, isLoggedInUser, logOutUser } = userSlice.actions;
export default userSlice.reducer;
