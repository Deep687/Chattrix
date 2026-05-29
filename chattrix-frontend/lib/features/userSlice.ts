import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// The shape coming from your API
interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  avatar: string;
  bio: string;
  role: string;
}

// The slice state — user can be null when not logged in
interface UserState {
  data: User | null;
}

const initialState: UserState = {
  data: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.data = action.payload;
    },
    clearUser: (state) => {
      state.data = null;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;

export default userSlice.reducer;