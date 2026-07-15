import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Hub {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  avatar: string | null;
  privacy_type: "public" | "private";
}

interface HubsState {
  owned: Hub[];
  joined: Hub[];
}

const initialState: HubsState = {
  owned: [],
  joined: [],
};

const hubsSlice = createSlice({
  name: "hubs",
  initialState,
  reducers: {
    setHubs: (state, action: PayloadAction<HubsState>) => {
      state.owned = action.payload.owned;
      state.joined = action.payload.joined;
    },
    clearHubs: (state) => {
      state.owned = [];
      state.joined = [];
    },
    addJoinedHub: (state, action: PayloadAction<Hub>) => {
      if (!state.joined.some((hub) => hub.id === action.payload.id)) {
        state.joined.push(action.payload);
      }
    },
  },
});

export const { setHubs, clearHubs, addJoinedHub } = hubsSlice.actions;

export default hubsSlice.reducer;
