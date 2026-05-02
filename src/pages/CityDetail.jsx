import React, { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchCityAirQuality,
  selectCurrentData,
  selectCurrentCity,
  selectStatus,
  selectError,
  selectLastUpdated,
} from '../store/airQualitySlice'
import { selectFavorites, addFavorite, removeFavorite } from '../store/favoritesSlice'
import { useAutoRefresh } from '../hooks/useAutoRefresh'
import { getAqiLevel } from '../utils/api'
import AqiGauge from '../components/AqiGauge'
import PollutantCard from '../components/PollutantCard'
import AqiChart from '../components/AqiChart'
import styles from './CityDetail.module.css'

export default function CityDetail() {
  const { cityName } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const currentData = useSelector(selectCurrentData)
  const currentCity = useSelector(selectCurrentCity)
  const status = useSelector(selectStatus)
  const error = useSelector(selectError)
  const lastUpdated = useSelector(selectLastUpdated)
  const favorites = useSelector(selectFavorites)

  const decodedCity = decodeURIComponent(cityName)
  const isFavorite = favorites.includes(decodedCity) || (currentData && favorites.includes(currentData.city))

  const { countdown, refresh } = useAutoRefresh(decodedCity)

  useEffect(() => {
    dispatch(fetchCityAirQuality(decodedCity))
  }, [decodedCity, dispatch])

  const toggleFav = () => {
    const cityKey = currentData?.city || decodedCity
    if (isFavorite) dispatch(removeFavorite(cityKey))
    else dispatch(addFavorite(cityKey))
  }

  if (status === 'loading' && !currentData) {
    return (
      <div className={styles.center}>
        <div className="spinner" />
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Loading {decodedCity}...</p>
      </div>
    )
  }

  if (error && !currentData) {
    return (
      <div className={styles.center}>
        <span style={{ fontSize: '3rem' }}>⚠️</span>
        <p style={{ color: 'var(--unhealthy)', margin: '0.5rem 0' }}>{error}</p>
        <button className="btn btn-ghost" onClick={() => navigate(-1)}>← Go back</button>
      </div>
    )
  }

  if (!currentData) return null

  const { label, bg } = getAqiLevel(currentData.aqi)

  return (
    <div className={styles.page}>
      {/* Back + actions */}
      <div className={styles.topBar}>
        <button className="btn btn-ghost" onClick={() => navigate(-1)}>← Back</button>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span className={styles.refreshInfo}>
            <span className="live-dot" />
            Next refresh in {countdown}s
          </span>
          <button className="btn btn-ghost" onClick={refresh} disabled={status === 'loading'}>↺ Refresh</button>
          <button className={`btn ${isFavorite ? 'btn-ghost' : 'btn-primary'}`} onClick={toggleFav}>
            {isFavorite ? '★ Saved' : '☆ Save City'}
          </button>
        </div>
      </div>

      {/* Header */}
      <div className={`${styles.cityHeader} ${bg}`}>
        <div>
          <h1 className={styles.cityName}>{currentData.city}</h1>
          <p className={styles.countryName}>{currentData.country}</p>
          <p className={styles.coords}>
            {currentData.latitude?.toFixed(4)}°N · {currentData.longitude?.toFixed(4)}°E
          </p>
        </div>
        <AqiGauge aqi={currentData.aqi} size={200} />
      </div>

      {/* Health advice */}
      <div className="card" style={{ borderLeft: '3px solid var(--accent)' }}>
        <HealthAdvice aqi={currentData.aqi} />
      </div>

      {/* Pollutants */}
      <h2 className={styles.sectionTitle}>Pollutant Breakdown</h2>
      <div className="grid-3">
        <PollutantCard type="pm25"  value={currentData.pm25}  />
        <PollutantCard type="pm10"  value={currentData.pm10}  />
        <PollutantCard type="ozone" value={currentData.ozone} />
        <PollutantCard type="no2"   value={currentData.no2}   />
        <PollutantCard type="co"    value={currentData.co}    />
        <PollutantCard type="so2"   value={currentData.so2}   />
      </div>

      {/* Chart */}
      <div className="card">
        <h2 className={styles.sectionTitle} style={{ marginBottom: '1rem' }}>24-Hour History</h2>
        <AqiChart history={currentData.history} />
      </div>

      {lastUpdated && (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
          Last updated: {new Date(lastUpdated).toLocaleString()}
        </p>
      )}
    </div>
  )
}

function HealthAdvice({ aqi }) {
  const tiers = [
    { max: 50,  color: 'var(--good)',          icon: '😊', title: 'Good', advice: 'Air quality is considered satisfactory, and air pollution poses little or no risk.' },
    { max: 100, color: 'var(--moderate)',       icon: '😐', title: 'Moderate', advice: 'Air quality is acceptable. However, there may be a risk for some people, particularly those who are unusually sensitive to air pollution.' },
    { max: 150, color: 'var(--unhealthy)',      icon: '😷', title: 'Unhealthy for Sensitive Groups', advice: 'Members of sensitive groups may experience health effects. The general public is less likely to be affected.' },
    { max: 200, color: 'var(--unhealthy)',      icon: '🚫', title: 'Unhealthy', advice: 'Some members of the general public may experience health effects; members of sensitive groups may experience more serious health effects.' },
    { max: 300, color: 'var(--very-unhealthy)', icon: '☠️', title: 'Very Unhealthy', advice: 'Health alert: The risk of health effects is increased for everyone.' },
    { max: 999, color: '#dc2626',               icon: '💀', title: 'Hazardous', advice: 'Health warning of emergency conditions: everyone is more likely to be affected. Avoid all outdoor physical activity.' },
  ]
  const tier = tiers.find(t => (aqi ?? 0) <= t.max) || tiers[tiers.length - 1]
  return (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
      <span style={{ fontSize: '2.5rem', lineHeight: 1, flexShrink: 0 }}>{tier.icon}</span>
      <div>
        <div style={{ fontWeight: 700, color: tier.color, marginBottom: '0.25rem' }}>{tier.title}</div>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>{tier.advice}</div>
      </div>
    </div>
  )
}
