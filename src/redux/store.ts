import { configureStore } from "@reduxjs/toolkit";
import productReducer from "./productSlice";
import { RootState } from "./types";

export const store = configureStore({
  reducer: {
    product: productReducer,
  },
});

// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;
export type { RootState };
