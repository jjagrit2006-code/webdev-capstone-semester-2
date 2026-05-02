import axios from 'axios'

// ── Geocoding (free, no key) ─────────────────────────────────────────────────
const GEO_BASE = 'https://geocoding-api.open-meteo.com/v1'

// ── Air Quality (free, no key) ───────────────────────────────────────────────
const AQ_BASE = 'https://air-quality-api.open-meteo.com/v1'

// Get coordinates from city name
async function geocodeCity(cityName) {
  const res = await axios.get(`${GEO_BASE}/search`, {
    params: { name: cityName, count: 1, language: 'en', format: 'json' },
  })
  if (!res.data.results?.length) throw new Error(`City "${cityName}" not found`)
  const { latitude, longitude, name, country } = res.data.results[0]
  return { latitude, longitude, name, country }
}

// Get current + hourly air quality for a city
export async function fetchAirQuality(cityName) {
  const geo = await geocodeCity(cityName)

  const res = await axios.get(`${AQ_BASE}/air-quality`, {
    params: {
      latitude: geo.latitude,
      longitude: geo.longitude,
      current: [
        'us_aqi',
        'pm10',
        'pm2_5',
        'carbon_monoxide',
        'nitrogen_dioxide',
        'ozone',
        'sulphur_dioxide',
      ].join(','),
      hourly: [
        'pm10',
        'pm2_5',
        'us_aqi',
        'ozone',
        'nitrogen_dioxide',
      ].join(','),
      timezone: 'auto',
      forecast_days: 1,
    },
  })

  const c = res.data.current
  const h = res.data.hourly

  // Build last 24h history from hourly (for charts)
  const times = h.time?.slice(0, 24) || []
  const history = times.map((t, i) => ({
    time: t.split('T')[1] || t,
    aqi: h.us_aqi?.[i] ?? null,
    pm25: h.pm2_5?.[i] ?? null,
    pm10: h.pm10?.[i] ?? null,
    ozone: h.ozone?.[i] ?? null,
    no2: h.nitrogen_dioxide?.[i] ?? null,
  }))

  return {
    city: geo.name,
    country: geo.country,
    latitude: geo.latitude,
    longitude: geo.longitude,
    aqi: c.us_aqi,
    pm25: c.pm2_5,
    pm10: c.pm10,
    co: c.carbon_monoxide,
    no2: c.nitrogen_dioxide,
    ozone: c.ozone,
    so2: c.sulphur_dioxide,
    history,
  }
}

// AQI level helper
export function getAqiLevel(aqi) {
  if (aqi === null || aqi === undefined) return { label: 'Unknown', cls: '', bg: '' }
  if (aqi <= 50)  return { label: 'Good',           cls: 'aqi-good',      bg: 'bg-good'      }
  if (aqi <= 100) return { label: 'Moderate',        cls: 'aqi-moderate',  bg: 'bg-moderate'  }
  if (aqi <= 150) return { label: 'Unhealthy for Sensitive', cls: 'aqi-unhealthy', bg: 'bg-unhealthy' }
  if (aqi <= 200) return { label: 'Unhealthy',       cls: 'aqi-unhealthy', bg: 'bg-unhealthy' }
  if (aqi <= 300) return { label: 'Very Unhealthy',  cls: 'aqi-very',      bg: 'bg-very'      }
  return              { label: 'Hazardous',           cls: 'aqi-hazardous', bg: 'bg-hazardous' }
}

export function getAqiColor(aqi) {
  if (!aqi) return '#7da8c8'
  if (aqi <= 50)  return '#10b981'
  if (aqi <= 100) return '#f59e0b'
  if (aqi <= 200) return '#ef4444'
  if (aqi <= 300) return '#9333ea'
  return '#7f1d1d'
}
