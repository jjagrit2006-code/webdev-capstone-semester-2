import { useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { fetchCityAirQuality } from '../store/airQualitySlice'

// Auto-refreshes air quality data for a city every `intervalMs` milliseconds
export function useAutoRefresh(city, intervalMs = 5 * 60 * 1000) {
  const dispatch = useDispatch()
  const intervalRef = useRef(null)
  const [countdown, setCountdown] = useState(intervalMs / 1000)

  useEffect(() => {
    if (!city) return

    // Reset countdown
    setCountdown(intervalMs / 1000)

    // Countdown ticker (every second)
    const ticker = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) return intervalMs / 1000
        return prev - 1
      })
    }, 1000)

    // Data refresh interval
    intervalRef.current = setInterval(() => {
      dispatch(fetchCityAirQuality(city))
    }, intervalMs)

    return () => {
      clearInterval(intervalRef.current)
      clearInterval(ticker)
    }
  }, [city, intervalMs, dispatch])

  // Manual refresh function
  const refresh = () => {
    if (city) {
      dispatch(fetchCityAirQuality(city))
      setCountdown(intervalMs / 1000)
    }
  }

  return { countdown, refresh }
}
