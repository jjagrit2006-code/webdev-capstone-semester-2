import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { addFavorite, removeFavorite } from '../store/favoritesSlice'
import { getAqiLevel, getAqiColor } from '../utils/api'
import styles from './CityCard.module.css'

export default function CityCard({ city, data, isFavorite }) {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { label, bg } = getAqiLevel(data?.aqi)
  const color = getAqiColor(data?.aqi)

  const handleFav = (e) => {
    e.stopPropagation()
    if (isFavorite) dispatch(removeFavorite(city))
    else dispatch(addFavorite(city))
  }

  return (
    <div
      className={`card ${bg} ${styles.card}`}
      onClick={() => navigate(`/city/${encodeURIComponent(city)}`)}
    >
      <div className={styles.top}>
        <div>
          <div className={styles.cityName}>{data?.city || city}</div>
          <div className={styles.country}>{data?.country || ''}</div>
        </div>
        <button className={styles.favBtn} onClick={handleFav} title={isFavorite ? 'Remove' : 'Save'}>
          {isFavorite ? '★' : '☆'}
        </button>
      </div>

      <div className={styles.aqi} style={{ color }}>
        <span className="mono">{data?.aqi ?? '—'}</span>
        <span className={styles.aqiLabel}>{label}</span>
      </div>

      <div className={styles.pills}>
        {data?.pm25 != null && <span className={styles.pill}>PM2.5 <b>{data.pm25.toFixed(1)}</b></span>}
        {data?.pm10 != null && <span className={styles.pill}>PM10 <b>{data.pm10.toFixed(1)}</b></span>}
      </div>
    </div>
  )
}
