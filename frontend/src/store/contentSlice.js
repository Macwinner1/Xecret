import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  contents: [],
  currentContent: null,
  loading: false,
};

const contentSlice = createSlice({
  name: 'content',
  initialState,
  reducers: {
    setContents: (state, action) => {
      state.contents = action.payload;
    },
    setCurrentContent: (state, action) => {
      state.currentContent = action.payload;
    },
  },
});

export const { setContents, setCurrentContent } = contentSlice.actions;
export default contentSlice.reducer;
