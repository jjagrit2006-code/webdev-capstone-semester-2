import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { fetchCityAirQuality } from '../store/airQualitySlice'
import { fetchAirQuality, getAqiLevel, getAqiColor } from '../utils/api'
import AqiGauge from '../components/AqiGauge'
import AqiChart from '../components/AqiChart'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend
} from 'recharts'
import styles from './Compare.module.css'

const POLLUTANTS = [
  { key: 'pm25',  label: 'PM2.5' },
  { key: 'pm10',  label: 'PM10' },
  { key: 'ozone', label: 'Ozone' },
  { key: 'no2',   label: 'NO₂' },
  { key: 'co',    label: 'CO' },
]

export default function Compare() {
  const [cities, setCities] = useState([null, null])
  const [inputs, setInputs] = useState(['', ''])
  const [loading, setLoading] = useState([false, false])
  const [errors, setErrors] = useState(['', ''])

  const fetchForSlot = async (idx) => {
    const city = inputs[idx].trim()
    if (!city) return

    setLoading(prev => { const n = [...prev]; n[idx] = true; return n })
    setErrors(prev => { const n = [...prev]; n[idx] = ''; return n })

    try {
      const data = await fetchAirQuality(city)
      setCities(prev => { const n = [...prev]; n[idx] = data; return n })
    } catch (err) {
      setErrors(prev => { const n = [...prev]; n[idx] = err.message; return n })
    } finally {
      setLoading(prev => { const n = [...prev]; n[idx] = false; return n })
    }
  }

  // Build bar chart data
  const barData = POLLUTANTS.map(p => ({
    name: p.label,
    [cities[0]?.city || 'City A']: cities[0]?.[p.key] ?? 0,
    [cities[1]?.city || 'City B']: cities[1]?.[p.key] ?? 0,
  }))

  const COLORS = ['#00d4ff', '#f59e0b']

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Compare Cities</h1>
        <p className={styles.subtitle}>Side-by-side air quality comparison for any two cities</p>
      </div>

      {/* City selectors */}
      <div className={styles.selectors}>
        {[0, 1].map(idx => (
          <div key={idx} className={styles.slotInput}>
            <label className={styles.slotLabel}>City {idx + 1}</label>
            <div className={styles.inputRow}>
              <input
                className="input"
                value={inputs[idx]}
                onChange={e => setInputs(prev => { const n = [...prev]; n[idx] = e.target.value; return n })}
                onKeyDown={e => e.key === 'Enter' && fetchForSlot(idx)}
                placeholder={idx === 0 ? 'e.g. Delhi' : 'e.g. London'}
              />
              <button
                className="btn btn-primary"
                onClick={() => fetchForSlot(idx)}
                disabled={loading[idx] || !inputs[idx].trim()}
              >
                {loading[idx] ? '...' : 'Load'}
              </button>
            </div>
            {errors[idx] && <p className={styles.error}>{errors[idx]}</p>}
          </div>
        ))}
      </div>

      {/* Comparison cards */}
      {(cities[0] || cities[1]) && (
        <>
          {/* AQI gauges */}
          <div className={styles.gaugeRow}>
            {[0, 1].map(idx => (
              <div key={idx} className={`card ${styles.gaugeCard}`}>
                {cities[idx] ? (
                  <>
                    <h2 className={styles.cityName}>{cities[idx].city}</h2>
                    <p className={styles.country}>{cities[idx].country}</p>
                    <AqiGauge aqi={cities[idx].aqi} size={180} />
                    <div className={styles.quickStats}>
                      <div><span>PM2.5</span><b>{cities[idx].pm25?.toFixed(1)}</b></div>
                      <div><span>PM10</span><b>{cities[idx].pm10?.toFixed(1)}</b></div>
                      <div><span>Ozone</span><b>{cities[idx].ozone?.toFixed(1)}</b></div>
                    </div>
                  </>
                ) : (
                  <div className={styles.emptySlot}>
                    {loading[idx]
                      ? <><div className="spinner" /><p>Loading...</p></>
                      : <p>Enter City {idx + 1} above</p>
                    }
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pollutant bar chart */}
          {cities[0] && cities[1] && (
            <div className="card">
              <h3 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: 700 }}>Pollutant Comparison</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={barData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }}
                    labelStyle={{ color: 'var(--text-muted)', fontSize: 11 }}
                  />
                  <Legend />
                  <Bar dataKey={cities[0]?.city} fill={COLORS[0]} radius={[4, 4, 0, 0]} />
                  <Bar dataKey={cities[1]?.city} fill={COLORS[1]} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Winner row */}
          {cities[0] && cities[1] && (
            <div className={`card ${styles.winner}`}>
              {cities[0].aqi < cities[1].aqi ? (
                <><span className={styles.crown}>👑</span> <strong>{cities[0].city}</strong> has cleaner air (AQI {cities[0].aqi} vs {cities[1].aqi})</>
              ) : cities[1].aqi < cities[0].aqi ? (
                <><span className={styles.crown}>👑</span> <strong>{cities[1].city}</strong> has cleaner air (AQI {cities[1].aqi} vs {cities[0].aqi})</>
              ) : (
                <>🤝 Both cities have the same AQI ({cities[0].aqi})</>
              )}
            </div>
          )}

          {/* Individual charts */}
          {(cities[0] || cities[1]) && (
            <div className="grid-2">
              {[0, 1].map(idx => cities[idx] && (
                <div key={idx} className="card">
                  <h3 style={{ marginBottom: '1rem', fontSize: '0.95rem', fontWeight: 700 }}>
                    {cities[idx].city} — 24h Trend
                  </h3>
                  <AqiChart history={cities[idx].history} />
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {!cities[0] && !cities[1] && (
        <div className={styles.placeholder}>
          <span style={{ fontSize: '4rem' }}>🌆</span>
          <p>Enter two cities above to compare their air quality side by side</p>
        </div>
      )}
    </div>
  )
}
