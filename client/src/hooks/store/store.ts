import { configureStore } from '@reduxjs/toolkit';
import userSlice from './slice/user.slices';
import productSlice from './slice/product.slices';
import reviewSlice from './slice/review.slices';

export const store = configureStore({
  reducer: {
    user: userSlice,
    product: productSlice,
    review: reviewSlice,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }),
  // devTools: process.env.NODE_ENV !== "production",
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
