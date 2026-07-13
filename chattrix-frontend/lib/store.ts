import { configureStore } from '@reduxjs/toolkit'
import userReducer from './features/userSlice'
import hubsReducer from './features/hubsSlice'

export const store = configureStore({
    reducer: {
        user: userReducer,
        hubs: hubsReducer,
    },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
