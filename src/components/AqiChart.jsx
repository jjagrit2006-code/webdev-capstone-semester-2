import React, { useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, Area, AreaChart
} from 'recharts'
import { getAqiColor } from '../utils/api'
import styles from './AqiChart.module.css'

const METRICS = [
  { key: 'aqi',  label: 'AQI',   color: '#00d4ff' },
  { key: 'pm25', label: 'PM2.5', color: '#f59e0b' },
  { key: 'pm10', label: 'PM10',  color: '#10b981' },
  { key: 'ozone',label: 'Ozone', color: '#a78bfa' },
  { key: 'no2',  label: 'NO₂',   color: '#f87171' },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipTime}>{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} className={styles.tooltipRow}>
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="mono">{p.value?.toFixed(1) ?? '—'}</span>
        </div>
      ))}
    </div>
  )
}

export default function AqiChart({ history = [] }) {
  const [active, setActive] = useState(['aqi', 'pm25'])

  const toggle = (key) => {
    setActive(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
  }

  if (!history.length) {
    return <div className={styles.empty}>No chart data available</div>
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.legend}>
        {METRICS.map(m => (
          <button
            key={m.key}
            className={`${styles.legendBtn} ${active.includes(m.key) ? styles.legendActive : ''}`}
            style={active.includes(m.key) ? { borderColor: m.color, color: m.color } : {}}
            onClick={() => toggle(m.key)}
          >
            <span className={styles.dot} style={{ background: m.color }} />
            {m.label}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            {METRICS.map(m => (
              <linearGradient key={m.key} id={`grad-${m.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={m.color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={m.color} stopOpacity={0}   />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="time"
            tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
            tickLine={false}
            interval={3}
          />
          <YAxis
            tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          {METRICS.filter(m => active.includes(m.key)).map(m => (
            <Area
              key={m.key}
              type="monotone"
              dataKey={m.key}
              name={m.label}
              stroke={m.color}
              strokeWidth={2}
              fill={`url(#grad-${m.key})`}
              dot={false}
              activeDot={{ r: 5, fill: m.color }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
