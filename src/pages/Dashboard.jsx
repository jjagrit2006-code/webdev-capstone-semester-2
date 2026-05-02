import React, { useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import {
  fetchCityAirQuality,
  fetchMultipleCities,
  selectCurrentData,
  selectCurrentCity,
  selectStatus,
  selectLastUpdated,
  selectCitiesData,
} from '../store/airQualitySlice'
import { selectFavorites } from '../store/favoritesSlice'
import { useAutoRefresh } from '../hooks/useAutoRefresh'
import { getAqiLevel, getAqiColor } from '../utils/api'
import SearchBar from '../components/SearchBar'
import AqiGauge from '../components/AqiGauge'
import PollutantCard from '../components/PollutantCard'
import AqiChart from '../components/AqiChart'
import CityCard from '../components/CityCard'
import { selectFavorites as selectFavCities } from '../store/favoritesSlice'
import styles from './Dashboard.module.css'

// Default city to load on first visit
const DEFAULT_CITY = 'Delhi'
const DEFAULT_CITIES = ['Delhi', 'Mumbai', 'London', 'New York', 'Beijing']

export default function Dashboard() {
  const dispatch = useDispatch()
  const currentData = useSelector(selectCurrentData)
  const currentCity = useSelector(selectCurrentCity)
  const status = useSelector(selectStatus)
  const lastUpdated = useSelector(selectLastUpdated)
  const citiesData = useSelector(selectCitiesData)
  const favorites = useSelector(selectFavorites)

  const { countdown, refresh } = useAutoRefresh(currentCity || DEFAULT_CITY, 5 * 60 * 1000)

  // Load default city on mount
  useEffect(() => {
    dispatch(fetchCityAirQuality(DEFAULT_CITY))
    dispatch(fetchMultipleCities(DEFAULT_CITIES))
  }, [dispatch])

  const formatTime = (iso) => {
    if (!iso) return ''
    return new Date(iso).toLocaleTimeString()
  }

  const topCities = citiesData.slice(0, 4)

  return (
    <div className={styles.page}>
      {/* Hero header */}
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <div className={styles.liveRow}>
            <span className="live-dot" />
            <span className={styles.liveLabel}>Live Air Quality</span>
            <span className={styles.refreshIn}>Refreshes in {countdown}s</span>
            <button className="btn btn-ghost" onClick={refresh} disabled={status === 'loading'} style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem' }}>
              ↺ Refresh
            </button>
          </div>
          <h1 className={styles.heroTitle}>AirPulse Dashboard</h1>
          <p className={styles.heroSub}>Real-time air quality data for cities worldwide</p>
        </div>
        <div className={styles.heroSearch}>
          <SearchBar placeholder="Search any city..." />
        </div>
      </section>

      {/* Current city detail */}
      {(currentData || status === 'loading') && (
        <section className={`${styles.section} fade-up`}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              {currentData ? `${currentData.city}, ${currentData.country}` : 'Loading...'}
            </h2>
            {lastUpdated && (
              <span className={styles.updated}>Updated {formatTime(lastUpdated)}</span>
            )}
          </div>

          {status === 'loading' && !currentData ? (
            <div className={styles.loadingCenter}>
              <div className="spinner" />
              <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>Fetching air quality data...</p>
            </div>
          ) : currentData ? (
            <>
              {/* Main metrics row */}
              <div className={styles.mainMetrics}>
                {/* Gauge */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                  <AqiGauge aqi={currentData.aqi} size={200} />
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {currentData.latitude?.toFixed(2)}°N, {currentData.longitude?.toFixed(2)}°E
                    </div>
                  </div>
                </div>

                {/* Stats grid */}
                <div className={styles.statsGrid}>
                  <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Health Advice</span>
                    <HealthAdvice aqi={currentData.aqi} />
                  </div>
                  <div className="card">
                    <AqiCompareBars data={currentData} />
                  </div>
                </div>
              </div>

              {/* Pollutant cards */}
              <div className="grid-3" style={{ marginTop: '1.25rem' }}>
                <PollutantCard type="pm25"  value={currentData.pm25}  />
                <PollutantCard type="pm10"  value={currentData.pm10}  />
                <PollutantCard type="ozone" value={currentData.ozone} />
                <PollutantCard type="no2"   value={currentData.no2}   />
                <PollutantCard type="co"    value={currentData.co}    />
                <PollutantCard type="so2"   value={currentData.so2}   />
              </div>

              {/* Chart */}
              <div className="card" style={{ marginTop: '1.25rem' }}>
                <h3 style={{ marginBottom: '1rem', fontSize: '0.95rem', fontWeight: 700 }}>24-Hour Trend</h3>
                <AqiChart history={currentData.history} />
              </div>
            </>
          ) : null}
        </section>
      )}

      {/* Cities overview */}
      {topCities.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Cities Overview</h2>
            <Link to="/explore" className={styles.seeAll}>See all →</Link>
          </div>
          <div className="grid-4">
            {topCities.map(({ city, data }) => (
              <CityCard
                key={city}
                city={city}
                data={data}
                isFavorite={favorites.includes(city)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

// ── Health Advice sub-component ──────────────────────────────────────────────
function HealthAdvice({ aqi }) {
  const advices = [
    { max: 50,  icon: '😊', text: 'Air quality is satisfactory. Enjoy outdoor activities!', color: 'var(--good)' },
    { max: 100, icon: '😐', text: 'Acceptable air quality. Unusually sensitive people should consider limiting prolonged outdoor exertion.', color: 'var(--moderate)' },
    { max: 150, icon: '😷', text: 'Sensitive groups (children, elderly, those with respiratory/heart conditions) should reduce prolonged outdoor exertion.', color: 'var(--unhealthy)' },
    { max: 200, icon: '🚫', text: 'Everyone may begin to experience health effects. Sensitive groups should avoid outdoor activity.', color: 'var(--unhealthy)' },
    { max: 300, icon: '☠️', text: 'Health warnings of emergency conditions. Everyone should avoid outdoor activity.', color: 'var(--very-unhealthy)' },
    { max: 999, icon: '💀', text: 'Hazardous! Stay indoors with purified air. Avoid all outdoor activity.', color: 'var(--hazardous)' },
  ]
  const advice = advices.find(a => (aqi ?? 0) <= a.max) || advices[advices.length - 1]
  return (
    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
      <span style={{ fontSize: '2rem', lineHeight: 1 }}>{advice.icon}</span>
      <p style={{ color: advice.color, fontSize: '0.875rem', lineHeight: 1.6, fontWeight: 500 }}>{advice.text}</p>
    </div>
  )
}

// ── AQI Compare Bars ─────────────────────────────────────────────────────────
function AqiCompareBars({ data }) {
  const metrics = [
    { label: 'PM2.5', value: data.pm25, max: 250, color: '#f59e0b' },
    { label: 'PM10',  value: data.pm10, max: 430, color: '#10b981' },
    { label: 'Ozone', value: data.ozone,max: 200, color: '#a78bfa' },
    { label: 'NO₂',   value: data.no2,  max: 200, color: '#f87171' },
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Pollutant Levels</span>
      {metrics.map(m => (
        <div key={m.label} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ width: 40, fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{m.label}</span>
          <div style={{ flex: 1, height: 6, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ width: `${Math.min((m.value || 0) / m.max * 100, 100)}%`, height: '100%', background: m.color, borderRadius: 99, transition: 'width 1s ease' }} />
          </div>
          <span style={{ width: 45, fontSize: '0.72rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', textAlign: 'right' }}>
            {m.value?.toFixed(1) ?? '—'}
          </span>
        </div>
      ))}
    </div>
  )
}
