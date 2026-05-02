import { configureStore } from '@reduxjs/toolkit'
import airQualityReducer from './airQualitySlice'
import themeReducer from './themeSlice'
import favoritesReducer from './favoritesSlice'

export const store = configureStore({
  reducer: {
    airQuality: airQualityReducer,
    theme: themeReducer,
    favorites: favoritesReducer,
  },
})
