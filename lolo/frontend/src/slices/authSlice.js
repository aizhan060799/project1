import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  userInfo: localStorage.getItem('userInfo')
    ? JSON.parse(localStorage.getItem('userInfo'))
    : null,
};

export const login = (email, password) => async (dispatch) => {
  try {
    const response = await axios.post(
      'https://shop-redhat-api-dev.312redhat.com/api/users/auth',
      { email, password },
      { withCredentials: true }  // This ensures cookies (JWT) are included
    );
    dispatch(setCredentials(response.data));
  } catch (error) {
    console.error('Login failed:', error);
  }
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.userInfo = action.payload;
      localStorage.setItem('userInfo', JSON.stringify(action.payload));
    },
    logout: (state, action) => {
      state.userInfo = null;
      // NOTE: here we need to also remove the cart from storage so the next
      // logged in user doesn't inherit the previous users cart and shipping
      localStorage.clear();
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;

export default authSlice.reducer;
