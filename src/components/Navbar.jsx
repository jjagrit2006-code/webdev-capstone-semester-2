import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toggleTheme, selectTheme } from '../store/themeSlice'
import styles from './Navbar.module.css'

export default function Navbar() {
  const dispatch = useDispatch()
  const theme = useSelector(selectTheme)
  const navigate = useNavigate()

  return (
    <nav className={styles.navbar}>
      <div className={styles.brand} onClick={() => navigate('/')}>
        <span className={styles.logo}>⬡</span>
        <span className={styles.brandName}>AirPulse</span>
      </div>

      <div className={styles.links}>
        <NavLink to="/"          className={({isActive}) => isActive ? styles.active : ''}>Dashboard</NavLink>
        <NavLink to="/explore"   className={({isActive}) => isActive ? styles.active : ''}>Explore</NavLink>
        <NavLink to="/compare"   className={({isActive}) => isActive ? styles.active : ''}>Compare</NavLink>
        <NavLink to="/favorites" className={({isActive}) => isActive ? styles.active : ''}>Favorites</NavLink>
      </div>

      <div className={styles.actions}>
        <button
          className={`btn btn-ghost ${styles.themeBtn}`}
          onClick={() => dispatch(toggleTheme())}
          title="Toggle theme"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>
    </nav>
  )
}
