import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Contact {
  _id: string;
  name: string;
  profileImage?: string;
  employeeCode?: string;
}

interface MessengerState {
  isOpen: boolean;
  activeChatUser: Contact | null;
}

const initialState: MessengerState = {
  isOpen: false,
  activeChatUser: null,
};

const messengerSlice = createSlice({
  name: 'messenger',
  initialState,
  reducers: {
    openMessenger: (state, action: PayloadAction<Contact>) => {
      state.isOpen = true;
      state.activeChatUser = action.payload;
    },
    closeMessenger: (state) => {
      state.isOpen = false;
      state.activeChatUser = null;
    },
  },
});

export const { openMessenger, closeMessenger } = messengerSlice.actions;
export default messengerSlice.reducer;
