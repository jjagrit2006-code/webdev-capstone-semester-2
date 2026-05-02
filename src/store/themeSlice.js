import { createSlice } from '@reduxjs/toolkit'

const themeSlice = createSlice({
  name: 'theme',
  initialState: {
    mode: localStorage.getItem('theme') || 'dark',
  },
  reducers: {
    toggleTheme(state) {
      state.mode = state.mode === 'dark' ? 'light' : 'dark'
      localStorage.setItem('theme', state.mode)
      document.documentElement.setAttribute('data-theme', state.mode)
    },
    initTheme(state) {
      document.documentElement.setAttribute('data-theme', state.mode)
    },
  },
})

export const { toggleTheme, initTheme } = themeSlice.actions
export const selectTheme = (state) => state.theme.mode
export default themeSlice.reducer
