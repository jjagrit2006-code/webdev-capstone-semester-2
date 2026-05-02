import { createSlice } from '@reduxjs/toolkit'

const stored = localStorage.getItem('favorites')
const initialFavorites = stored ? JSON.parse(stored) : ['Delhi', 'Mumbai', 'London', 'New York', 'Beijing']

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState: {
    cities: initialFavorites,
  },
  reducers: {
    addFavorite(state, action) {
      const city = action.payload
      if (!state.cities.includes(city)) {
        state.cities.push(city)
        localStorage.setItem('favorites', JSON.stringify(state.cities))
      }
    },
    removeFavorite(state, action) {
      state.cities = state.cities.filter(c => c !== action.payload)
      localStorage.setItem('favorites', JSON.stringify(state.cities))
    },
  },
})

export const { addFavorite, removeFavorite } = favoritesSlice.actions
export const selectFavorites = (state) => state.favorites.cities
export default favoritesSlice.reducer
