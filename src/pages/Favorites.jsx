import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectFavorites, addFavorite, removeFavorite } from '../store/favoritesSlice'
import { fetchMultipleCities, selectCitiesData, selectStatus } from '../store/airQualitySlice'
import CityCard from '../components/CityCard'
import styles from './Favorites.module.css'

export default function Favorites() {
  const dispatch = useDispatch()
  const favorites = useSelector(selectFavorites)
  const citiesData = useSelector(selectCitiesData)
  const status = useSelector(selectStatus)
  const [newCity, setNewCity] = useState('')

  // Re-fetch favorites data whenever favorites change
  useEffect(() => {
    if (favorites.length > 0) {
      dispatch(fetchMultipleCities(favorites))
    }
  }, [favorites, dispatch])

  const handleAdd = (e) => {
    e.preventDefault()
    if (!newCity.trim()) return
    dispatch(addFavorite(newCity.trim()))
    setNewCity('')
  }

  const handleRemoveAll = () => {
    if (confirm('Remove all favorites?')) {
      favorites.forEach(city => dispatch(removeFavorite(city)))
    }
  }

  // Match city data to favorites
  const favCityData = favorites.map(city => {
    const found = citiesData.find(c => c.city.toLowerCase() === city.toLowerCase())
    return { city, data: found?.data || null }
  })

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Saved Cities</h1>
          <p className={styles.subtitle}>{favorites.length} cities saved · data refreshes automatically</p>
        </div>
        {favorites.length > 0 && (
          <button className="btn btn-ghost" onClick={handleRemoveAll} style={{ color: 'var(--unhealthy)' }}>
            🗑 Clear All
          </button>
        )}
      </div>

      {/* Add city form */}
      <form onSubmit={handleAdd} className={styles.addForm}>
        <input
          className="input"
          value={newCity}
          onChange={e => setNewCity(e.target.value)}
          placeholder="Add a city to favorites..."
          style={{ flex: 1 }}
        />
        <button type="submit" className="btn btn-primary" disabled={!newCity.trim()}>
          + Add
        </button>
      </form>

      {/* Loading */}
      {status === 'loading' && (
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div className="spinner" style={{ width: 22, height: 22 }} />
          <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Refreshing data...</span>
        </div>
      )}

      {/* Favorites grid */}
      {favCityData.length > 0 ? (
        <div className="grid-4">
          {favCityData.map(({ city, data }) => (
            <CityCard key={city} city={city} data={data} isFavorite={true} />
          ))}
        </div>
      ) : (
        <div className={styles.empty}>
          <span style={{ fontSize: '4rem' }}>⭐</span>
          <h2>No favorites yet</h2>
          <p>Add cities above, or click the ☆ star on any city card to save it here.</p>
        </div>
      )}

      {/* AQI Legend */}
      <div className="card" style={{ marginTop: '1rem' }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem' }}>AQI Scale Reference</h3>
        <div className={styles.legend}>
          {[
            { range: '0–50',   label: 'Good',              color: 'var(--good)' },
            { range: '51–100', label: 'Moderate',           color: 'var(--moderate)' },
            { range: '101–150',label: 'Unhealthy (Sens.)',  color: 'var(--unhealthy)' },
            { range: '151–200',label: 'Unhealthy',          color: 'var(--unhealthy)' },
            { range: '201–300',label: 'Very Unhealthy',     color: 'var(--very-unhealthy)' },
            { range: '300+',   label: 'Hazardous',          color: '#dc2626' },
          ].map(item => (
            <div key={item.range} className={styles.legendItem}>
              <div className={styles.legendDot} style={{ background: item.color }} />
              <span className={styles.legendRange}>{item.range}</span>
              <span className={styles.legendLabel}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
