import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { fetchCityAirQuality, selectStatus } from '../store/airQualitySlice'
import { useDebounce } from '../hooks/useDebounce'
import styles from './SearchBar.module.css'

export default function SearchBar({ placeholder = 'Search any city...' }) {
  const [input, setInput] = useState('')
  const debouncedInput = useDebounce(input, 500)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const status = useSelector(selectStatus)

  const handleSearch = (e) => {
    e.preventDefault()
    if (!input.trim()) return
    dispatch(fetchCityAirQuality(input.trim()))
    navigate(`/city/${encodeURIComponent(input.trim())}`)
    setInput('')
  }

  return (
    <form onSubmit={handleSearch} className={styles.form}>
      <div className={styles.wrapper}>
        <span className={styles.icon}>🔍</span>
        <input
          className={`input ${styles.input}`}
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={placeholder}
          aria-label="Search city"
        />
        {status === 'loading' && <span className={styles.loading}>⟳</span>}
      </div>
      <button type="submit" className="btn btn-primary" disabled={!input.trim() || status === 'loading'}>
        Go
      </button>
    </form>
  )
}
