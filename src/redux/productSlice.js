import { createSlice } from "@reduxjs/toolkit";

const productSlice = createSlice({
  name: "product",
  initialState: { 
    selectedProduct: null,
    favorites: [] // Just store an array of favorite product ids
  },
  reducers: {
    selectProduct: (state, action) => {
      state.selectedProduct = action.payload;
    },
    toggleFavorite: (state, action) => {
      const productId = action.payload;
      
      // If product id is in favorites, remove it, otherwise, add it
      if (state.favorites.includes(productId)) {
        state.favorites = state.favorites.filter(id => id !== productId);
      } else {
        state.favorites.push(productId);
      }
    }
  },
});

export const { selectProduct, toggleFavorite } = productSlice.actions;
export default productSlice.reducer;