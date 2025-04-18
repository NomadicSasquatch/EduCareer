import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CarouselState {
  visibleCards: number;
}

const initialState: CarouselState = {
  visibleCards: 3,
};

const carouselSlice = createSlice({
  name: 'carousel',
  initialState,
  reducers: {
    setVisibleCards: (state, action: PayloadAction<number>) => {
      state.visibleCards = action.payload;
    },
  },
});

export const { setVisibleCards } = carouselSlice.actions;
export default carouselSlice.reducer;
