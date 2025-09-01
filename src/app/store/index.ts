import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import messengerReducer from './messengerSlice'

export const store = configureStore({
  reducer: {
    user: userReducer,
    messenger: messengerReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
