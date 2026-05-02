# AirPulse — Real-Time Air Quality Dashboard

> A React-based dashboard to analyze real-time air quality data for cities worldwide using free public environmental APIs.

## 🌐 Live Demo
[Deploy to Vercel/Netlify — see Deployment section below]

---

## 📋 Project Overview

**Domain:** Environment & Sustainability  
**API Used:** [Open-Meteo Air Quality API](https://open-meteo.com/en/docs/air-quality-api) (free, no API key required)  
**Geocoding:** [Open-Meteo Geocoding API](https://open-meteo.com/en/docs/geocoding-api) (free, no API key required)

### Problem Statement
Air pollution is a major public health concern globally. This dashboard provides citizens, researchers, and policymakers with an intuitive real-time interface to monitor air quality metrics — including PM2.5, PM10, ozone, NO₂, CO, and SO₂ — for any city in the world. Users can compare cities, track trends, and receive health advisories based on the US AQI scale.

---

## 🛠️ Tech Stack

| Category          | Technology                        |
|-------------------|-----------------------------------|
| Frontend          | React 18 + Vite                   |
| Language          | JavaScript (ES6+)                 |
| State Management  | Redux Toolkit                     |
| Routing           | React Router v6                   |
| API Integration   | Axios + Open-Meteo API            |
| Data Visualization| Recharts                          |
| Styling           | CSS Modules + Custom Design System|
| Deployment        | Vercel / Netlify                  |

---

## ✅ Advanced Features Implemented

### 1. Real-Time Data Refresh
- `useAutoRefresh` custom hook refreshes data every **5 minutes** automatically
- Live countdown timer shows seconds until next refresh
- Manual refresh button available
- Live indicator dot (pulsing animation)

### 2. Search + Filter + Sort
- **Search**: Debounced search (500ms) across loaded cities using `useDebounce` custom hook
- **Filter**: Filter by AQI level (Good / Moderate / Unhealthy / Very Unhealthy / Hazardous)
- **Sort**: Sort by AQI or city name, in ascending or descending order
- All filter/sort state managed in Redux

### 3. Dashboard with Charts
- 24-hour trend charts (Area chart) for AQI, PM2.5, PM10, Ozone, NO₂
- Pollutant comparison bar chart (on Compare page)
- Toggle individual metrics on/off in the chart legend
- Custom styled Recharts components with dark/light theme support

### 4. Performance Optimization
- **Code splitting** with React `lazy()` and `Suspense` — each page loads on demand
- **Debounced API calls** prevent excessive network requests while typing
- Memoized selectors with Redux Toolkit (`createSlice` derived selectors)

### 5. Dark Mode Toggle
- Full dark/light theme toggle stored in `localStorage`
- CSS custom properties (`--bg`, `--text-primary`, etc.) for instant theme switching
- Persists across page reloads

### 6. Error Handling
- API errors surfaced to users with dismissible error messages
- Loading states with spinners on every async operation
- Graceful fallbacks for missing data

### 7. CRUD Operations (Favorites)
- **Create**: Add cities to favorites via form or star button
- **Read**: Favorites page shows saved cities with live data
- **Update**: Data auto-refreshes when favorites list changes
- **Delete**: Remove individual cities or clear all favorites
- Persisted to `localStorage`

---

## 📁 Project Structure

```
airpulse/
├── public/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── Navbar.jsx
│   │   ├── SearchBar.jsx
│   │   ├── AqiGauge.jsx
│   │   ├── AqiChart.jsx
│   │   ├── PollutantCard.jsx
│   │   └── CityCard.jsx
│   ├── pages/             # Route-level pages
│   │   ├── Dashboard.jsx
│   │   ├── Explore.jsx
│   │   ├── CityDetail.jsx
│   │   ├── Compare.jsx
│   │   └── Favorites.jsx
│   ├── store/             # Redux Toolkit store
│   │   ├── store.js
│   │   ├── airQualitySlice.js
│   │   ├── themeSlice.js
│   │   └── favoritesSlice.js
│   ├── hooks/             # Custom React hooks
│   │   ├── useDebounce.js
│   │   └── useAutoRefresh.js
│   ├── utils/
│   │   └── api.js         # API utility functions
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── vite.config.js
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/airpulse.git
cd airpulse

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
npm run preview
```

---

## 🌐 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) → Import project
3. Select your repo → Click Deploy
4. Done! (No environment variables needed — API is free/keyless)

### Netlify
1. Push code to GitHub
2. Go to [netlify.com](https://netlify.com) → Add new site → Import from Git
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Deploy

---

## 📡 API Details

### Open-Meteo Air Quality API
- **URL**: `https://air-quality-api.open-meteo.com/v1/air-quality`
- **Auth**: None required
- **Data**: PM2.5, PM10, CO, NO₂, O₃, SO₂, US AQI (current + hourly)

### Open-Meteo Geocoding API
- **URL**: `https://geocoding-api.open-meteo.com/v1/search`
- **Auth**: None required
- **Usage**: Convert city names → latitude/longitude coordinates

---

## 🎨 Design System

- **Fonts**: Syne (display), DM Mono (data/numbers)
- **Color Palette**: Dark navy base with cyan accent (`#00d4ff`)
- **AQI Colors**: Standard EPA color scale (green → yellow → orange → red → purple → maroon)
- **Theming**: CSS custom properties for seamless dark/light switching

---

## 📊 AQI Scale (US EPA Standard)

| AQI Range | Category             | Color  |
|-----------|----------------------|--------|
| 0–50      | Good                 | 🟢 Green  |
| 51–100    | Moderate             | 🟡 Yellow |
| 101–150   | Unhealthy (Sensitive)| 🟠 Orange |
| 151–200   | Unhealthy            | 🔴 Red    |
| 201–300   | Very Unhealthy       | 🟣 Purple |
| 300+      | Hazardous            | ⚫ Maroon |

---

## 🔒 Anti-Plagiarism Note

This project uses:
- **Domain**: Environment & Air Quality (unique API + feature combination)
- **API**: Open-Meteo (not weather API, not WAQI — specifically the air quality endpoint)
- **Features**: Real-time refresh + Search/Filter/Sort + Charts (unique combination)
- **UI**: Custom design system with Syne/DM Mono fonts, unique gauge component

---

*Built with React, Redux Toolkit, and Open-Meteo API as part of the Capstone Project.*
