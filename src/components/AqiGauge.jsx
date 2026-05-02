import React from 'react'
import { getAqiLevel, getAqiColor } from '../utils/api'
import styles from './AqiGauge.module.css'

export default function AqiGauge({ aqi, size = 180 }) {
  const { label } = getAqiLevel(aqi)
  const color = getAqiColor(aqi)
  const maxAqi = 500
  const pct = Math.min((aqi || 0) / maxAqi, 1)

  // SVG arc
  const r = 70
  const cx = 90
  const cy = 90
  const circumference = Math.PI * r  // half circle
  const strokeDash = circumference * pct

  return (
    <div className={styles.wrapper} style={{ width: size, height: size * 0.65 }}>
      <svg
        viewBox="0 0 180 110"
        xmlns="http://www.w3.org/2000/svg"
        className={styles.svg}
      >
        {/* Background track */}
        <path
          d={`M ${cx - r},${cy} A ${r},${r} 0 0,1 ${cx + r},${cy}`}
          fill="none"
          stroke="var(--border)"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* Colored fill */}
        <path
          d={`M ${cx - r},${cy} A ${r},${r} 0 0,1 ${cx + r},${cy}`}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${strokeDash} ${circumference}`}
          style={{ filter: `drop-shadow(0 0 8px ${color}55)`, transition: 'stroke-dasharray 1s ease' }}
        />
        {/* AQI value */}
        <text
          x="90" y="80"
          textAnchor="middle"
          fill={color}
          fontSize="32"
          fontFamily="var(--font-mono)"
          fontWeight="500"
        >
          {aqi ?? '—'}
        </text>
        <text
          x="90" y="98"
          textAnchor="middle"
          fill="var(--text-muted)"
          fontSize="10"
          fontFamily="var(--font-display)"
        >
          US AQI
        </text>
      </svg>
      <div className={styles.label} style={{ color }}>
        {label}
      </div>
      {/* Scale labels */}
      <div className={styles.scale}>
        <span>0</span>
        <span>500</span>
      </div>
    </div>
  )
}
