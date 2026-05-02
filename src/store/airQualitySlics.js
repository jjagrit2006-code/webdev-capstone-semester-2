import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { fetchAirQuality } from '../utils/api'

// Async thunk: fetch AQ for a city
export const fetchCityAirQuality = createAsyncThunk(
  'airQuality/fetchCity',
  async (city, { rejectWithValue }) => {
    try {
      const data = await fetchAirQuality(city)
      return { city, data }
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

// Async thunk: fetch multiple cities for compare/dashboard
export const fetchMultipleCities = createAsyncThunk(
  'airQuality/fetchMultiple',
  async (cities, { rejectWithValue }) => {
    try {
      const results = await Promise.all(
        cities.map(city => fetchAirQuality(city).then(data => ({ city, data })))
      )
      return results
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

const airQualitySlice = createSlice({
  name: 'airQuality',
  initialState: {
    currentCity: null,
    currentData: null,
    citiesData: [],       // array of { city, data }
    status: 'idle',       // idle | loading | succeeded | failed
    error: null,
    lastUpdated: null,
    searchQuery: '',
    sortBy: 'aqi',        // aqi | name
    sortOrder: 'desc',    // asc | desc
    filterLevel: 'all',   // all | good | moderate | unhealthy | very | hazardous
  },
  reducers: {
    setSearchQuery(state, action) {
      state.searchQuery = action.payload
    },
    setSortBy(state, action) {
      state.sortBy = action.payload
    },
    setSortOrder(state, action) {
      state.sortOrder = action.payload
    },
    setFilterLevel(state, action) {
      state.filterLevel = action.payload
    },
    clearError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Single city
      .addCase(fetchCityAirQuality.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchCityAirQuality.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.currentCity = action.payload.city
        state.currentData = action.payload.data
        state.lastUpdated = new Date().toISOString()
        // Also upsert into citiesData
        const idx = state.citiesData.findIndex(c => c.city.toLowerCase() === action.payload.city.toLowerCase())
        if (idx >= 0) {
          state.citiesData[idx] = action.payload
        } else {
          state.citiesData.push(action.payload)
        }
      })
      .addCase(fetchCityAirQuality.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || 'Failed to fetch data'
      })
      // Multiple cities
      .addCase(fetchMultipleCities.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchMultipleCities.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.citiesData = action.payload
        state.lastUpdated = new Date().toISOString()
      })
      .addCase(fetchMultipleCities.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || 'Failed to fetch data'
      })
  },
})

export const { setSearchQuery, setSortBy, setSortOrder, setFilterLevel, clearError } = airQualitySlice.actions

// Selectors
export const selectCurrentData = (state) => state.airQuality.currentData
export const selectCurrentCity = (state) => state.airQuality.currentCity
export const selectStatus = (state) => state.airQuality.status
export const selectError = (state) => state.airQuality.error
export const selectLastUpdated = (state) => state.airQuality.lastUpdated
export const selectCitiesData = (state) => state.airQuality.citiesData
export const selectSearchQuery = (state) => state.airQuality.searchQuery
export const selectSortBy = (state) => state.airQuality.sortBy
export const selectSortOrder = (state) => state.airQuality.sortOrder
export const selectFilterLevel = (state) => state.airQuality.filterLevel

// Derived selector: filtered + sorted cities
export const selectFilteredCities = (state) => {
  const { citiesData, searchQuery, sortBy, sortOrder, filterLevel } = state.airQuality

  let result = [...citiesData]

  // Search filter
  if (searchQuery.trim()) {
    result = result.filter(c =>
      c.city.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  // AQI level filter
  if (filterLevel !== 'all') {
    result = result.filter(c => {
      const aqi = c.data?.aqi
      if (!aqi) return false
      if (filterLevel === 'good')      return aqi <= 50
      if (filterLevel === 'moderate')  return aqi > 50 && aqi <= 100
      if (filterLevel === 'unhealthy') return aqi > 100 && aqi <= 200
      if (filterLevel === 'very')      return aqi > 200 && aqi <= 300
      if (filterLevel === 'hazardous') return aqi > 300
      return true
    })
  }

  // Sort
  result.sort((a, b) => {
    let valA, valB
    if (sortBy === 'aqi') {
      valA = a.data?.aqi ?? 0
      valB = b.data?.aqi ?? 0
    } else {
      valA = a.city.toLowerCase()
      valB = b.city.toLowerCase()
    }
    if (valA < valB) return sortOrder === 'asc' ? -1 : 1
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1
    return 0
  })

  return result
}

export default airQualitySlice.reducer
