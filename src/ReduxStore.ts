import { configureStore } from '@reduxjs/toolkit'
import mapReducer from './MapSlice'

export const store = configureStore({
  reducer: {
    map: mapReducer
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    immutableCheck: false,
    serializableCheck: false,
  })
})

export type AppStore = typeof store
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
