import React from 'react'
import styles from './PollutantCard.module.css'

const POLLUTANTS = {
  pm25:  { label: 'PM2.5', unit: 'μg/m³', safe: 12,  warn: 35,  icon: '💨' },
  pm10:  { label: 'PM10',  unit: 'μg/m³', safe: 54,  warn: 154, icon: '🌫️' },
  ozone: { label: 'Ozone', unit: 'μg/m³', safe: 54,  warn: 70,  icon: '☁️' },
  no2:   { label: 'NO₂',   unit: 'μg/m³', safe: 53,  warn: 100, icon: '🏭' },
  co:    { label: 'CO',    unit: 'mg/m³',  safe: 4.4, warn: 9.4, icon: '🔥' },
  so2:   { label: 'SO₂',   unit: 'μg/m³', safe: 35,  warn: 75,  icon: '⚗️' },
}

export default function PollutantCard({ type, value }) {
  const meta = POLLUTANTS[type] || { label: type, unit: '', safe: 50, warn: 100, icon: '📊' }
  const pct = Math.min((value || 0) / (meta.warn * 2) * 100, 100)

  let statusColor = 'var(--good)'
  let status = 'Safe'
  if (value > meta.warn) { statusColor = 'var(--unhealthy)'; status = 'Unhealthy' }
  else if (value > meta.safe) { statusColor = 'var(--moderate)'; status = 'Moderate' }

  return (
    <div className={`card ${styles.card}`}>
      <div className={styles.header}>
        <span className={styles.icon}>{meta.icon}</span>
        <span className={styles.label}>{meta.label}</span>
        <span className={`badge ${styles.status}`} style={{ background: `${statusColor}22`, color: statusColor }}>
          {status}
        </span>
      </div>
      <div className={styles.value}>
        <span className="mono">{value != null ? value.toFixed(1) : '—'}</span>
        <span className={styles.unit}>{meta.unit}</span>
      </div>
      <div className={styles.bar}>
        <div className={styles.fill} style={{ width: `${pct}%`, background: statusColor }} />
      </div>
      <div className={styles.thresholds}>
        <span>Safe: &lt;{meta.safe}</span>
        <span>Warn: &lt;{meta.warn}</span>
      </div>
    </div>
  )
}
