import { configureStore } from '@reduxjs/toolkit'
import userReducer from './features/userSlice' // ✅ import the reducer, not actions

export const store = configureStore({
    reducer: {
        user: userReducer, // ✅ register it here
    },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch