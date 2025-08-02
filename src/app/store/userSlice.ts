// store/userSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: string;
  name: string;
  email: string;
  employeeCode: string,
  token?: string;
}

interface UserState {
  user: User | null;
}

const initialState: UserState = {
  user: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(action.payload));
      }
    },
    clearUser(state) {
      state.user = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
      }
    },
    loadUserFromStorage(state) {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('user');
        if (stored) {
          state.user = JSON.parse(stored);
        }
      }
    },
  },
});

export const { setUser, clearUser, loadUserFromStorage } = userSlice.actions;
export default userSlice.reducer;
