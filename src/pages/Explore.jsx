import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchCityAirQuality,
  fetchMultipleCities,
  selectFilteredCities,
  selectSearchQuery,
  selectSortBy,
  selectSortOrder,
  selectFilterLevel,
  selectStatus,
  setSearchQuery,
  setSortBy,
  setSortOrder,
  setFilterLevel,
  selectError,
  clearError,
} from '../store/airQualitySlice'
import { selectFavorites } from '../store/favoritesSlice'
import { useDebounce } from '../hooks/useDebounce'
import CityCard from '../components/CityCard'
import SearchBar from '../components/SearchBar'
import styles from './Explore.module.css'

// A large list of world cities to populate on load
const WORLD_CITIES = [
  'Delhi', 'Mumbai', 'Kolkata', 'Chennai', 'Bangalore',
  'London', 'Paris', 'Berlin', 'Madrid', 'Rome',
  'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix',
  'Beijing', 'Shanghai', 'Tokyo', 'Seoul', 'Bangkok',
  'Dubai', 'Cairo', 'Lagos', 'Nairobi', 'Karachi',
]

const AQI_LEVELS = [
  { value: 'all',       label: 'All Levels' },
  { value: 'good',      label: '🟢 Good (0-50)' },
  { value: 'moderate',  label: '🟡 Moderate (51-100)' },
  { value: 'unhealthy', label: '🔴 Unhealthy (101-200)' },
  { value: 'very',      label: '🟣 Very Unhealthy (201-300)' },
  { value: 'hazardous', label: '⚫ Hazardous (300+)' },
]

export default function Explore() {
  const dispatch = useDispatch()
  const filteredCities = useSelector(selectFilteredCities)
  const searchQuery = useSelector(selectSearchQuery)
  const sortBy = useSelector(selectSortBy)
  const sortOrder = useSelector(selectSortOrder)
  const filterLevel = useSelector(selectFilterLevel)
  const favorites = useSelector(selectFavorites)
  const status = useSelector(selectStatus)
  const error = useSelector(selectError)

  const [localSearch, setLocalSearch] = useState(searchQuery)
  const debounced = useDebounce(localSearch, 400)

  // Push debounced search to Redux
  useEffect(() => {
    dispatch(setSearchQuery(debounced))
  }, [debounced, dispatch])

  // Load world cities on mount
  useEffect(() => {
    dispatch(fetchMultipleCities(WORLD_CITIES))
  }, [dispatch])

  const handleAddCity = (cityName) => {
    if (!cityName.trim()) return
    dispatch(fetchCityAirQuality(cityName.trim()))
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Explore Cities</h1>
        <p className={styles.subtitle}>Search, filter, and sort air quality data for cities worldwide</p>
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        {/* Search within loaded cities */}
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            className={`input ${styles.searchInput}`}
            value={localSearch}
            onChange={e => setLocalSearch(e.target.value)}
            placeholder="Filter loaded cities..."
          />
          {localSearch && (
            <button className={styles.clearBtn} onClick={() => { setLocalSearch(''); dispatch(setSearchQuery('')) }}>✕</button>
          )}
        </div>

        {/* Filter by AQI level */}
        <select
          className="input"
          style={{ width: 'auto', minWidth: 180 }}
          value={filterLevel}
          onChange={e => dispatch(setFilterLevel(e.target.value))}
        >
          {AQI_LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
        </select>

        {/* Sort */}
        <select
          className="input"
          style={{ width: 'auto', minWidth: 140 }}
          value={sortBy}
          onChange={e => dispatch(setSortBy(e.target.value))}
        >
          <option value="aqi">Sort by AQI</option>
          <option value="name">Sort by Name</option>
        </select>

        <button
          className="btn btn-ghost"
          onClick={() => dispatch(setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'))}
          title="Toggle sort order"
        >
          {sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
        </button>
      </div>

      {/* Add a new city */}
      <div className={styles.addCity}>
        <SearchBar placeholder="Add a new city to the list..." />
      </div>

      {/* Status */}
      {status === 'loading' && (
        <div className={styles.statusRow}>
          <div className="spinner" style={{ width: 24, height: 24 }} />
          <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading city data...</span>
        </div>
      )}

      {error && (
        <div className={styles.error}>
          ⚠️ {error}
          <button className="btn btn-ghost" style={{ marginLeft: '1rem', padding: '0.25rem 0.75rem', fontSize: '0.8rem' }} onClick={() => dispatch(clearError())}>Dismiss</button>
        </div>
      )}

      {/* Results count */}
      <div className={styles.resultMeta}>
        Showing <strong>{filteredCities.length}</strong> cities
        {searchQuery && <> matching "<em>{searchQuery}</em>"</>}
        {filterLevel !== 'all' && <> · Filtered by <em>{filterLevel}</em></>}
      </div>

      {/* City grid */}
      {filteredCities.length > 0 ? (
        <div className="grid-4">
          {filteredCities.map(({ city, data }) => (
            <CityCard
              key={city}
              city={city}
              data={data}
              isFavorite={favorites.includes(city)}
            />
          ))}
        </div>
      ) : (
        <div className={styles.empty}>
          <span style={{ fontSize: '3rem' }}>🌍</span>
          <p>No cities found. Try adjusting your filters or search for a city above.</p>
        </div>
      )}
    </div>
  )
}
