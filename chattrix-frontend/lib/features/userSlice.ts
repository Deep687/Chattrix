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
  remember_token: string;
}

// The slice state — user can be null when not logged in
interface UserState {
  user: User | null;
}

const initialState: UserState = {
  user: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    clearUser: (state) => {
      state.user = null;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;

export default userSlice.reducer;