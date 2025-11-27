import { createSlice } from '@reduxjs/toolkit';

// Check for existing auth
const token = localStorage.getItem('token');
const username = localStorage.getItem('username');
const user_id = localStorage.getItem('user_id');

const initialState = {
  user: token ? { user_id, username } : null,
  isAuthenticated: !!token,
  loading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      localStorage.removeItem('user_id');
    },
  },
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;
