import { useState } from 'react'
import { supabase } from '../supabase'
import Background from './Background'

const Login = ({ onLogin, darkMode, setDarkMode }) => {
  const [isSignup, setIsSignup] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handle = async () => {
    setError('')
    setMessage('')
    setLoading(true)

    if (!email || !password) {
      setError('Please fill in all fields')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    if (isSignup) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(error.message)
      } else {
        setMessage('Account created! Please check your email to confirm, then log in.')
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
      } else {
        onLogin(data.user)
      }
    }
    setLoading(false)
  }

  return (
    <div className={darkMode ? 'app dark' : 'app'} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <Background darkMode={darkMode} />

      <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <h1 className="tasky-title" style={{ fontSize: '72px' }}>
            tasky<span className="tasky-heart">♥</span>
          </h1>
          <p style={{
            fontFamily: 'Playfair Display, serif',
            fontStyle: 'italic',
            fontSize: '16px',
            color: darkMode ? '#c4b5fd' : '#6b5b95',
            marginTop: '12px',
            opacity: 0.85,
          }}>
            the calendar that thinks ahead
          </p>
        </div>

        <div style={{
          background: darkMode ? 'rgba(20,5,40,0.85)' : 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(20px)',
          borderRadius: '28px',
          padding: '36px',
          width: '360px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          boxShadow: '0 8px 40px rgba(150,100,220,0.2)',
          border: darkMode ? '1px solid rgba(180,150,255,0.15)' : '1px solid rgba(255,255,255,0.95)',
        }}>
          <h2 style={{
            fontFamily: 'Playfair Display, serif',
            fontStyle: 'italic',
            fontSize: '22px',
            color: darkMode ? '#c4b5fd' : '#7c5cbf',
            marginBottom: '4px',
          }}>
            {isSignup ? 'Create account ✨' : 'Welcome 🌸'}
          </h2>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handle()}
            style={{
              padding: '11px 14px',
              borderRadius: '12px',
              border: '1px solid rgba(180,150,220,0.3)',
              fontSize: '14px',
              background: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(248,240,255,0.8)',
              color: darkMode ? '#e2d5ff' : '#3d2d6b',
              outline: 'none',
              fontFamily: 'Quicksand, sans-serif',
              fontWeight: 500,
            }}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handle()}
            style={{
              padding: '11px 14px',
              borderRadius: '12px',
              border: '1px solid rgba(180,150,220,0.3)',
              fontSize: '14px',
              background: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(248,240,255,0.8)',
              color: darkMode ? '#e2d5ff' : '#3d2d6b',
              outline: 'none',
              fontFamily: 'Quicksand, sans-serif',
              fontWeight: 500,
            }}
          />

          {error && (
  <p style={{ color: '#f87171', fontSize: '13px', fontFamily: 'Quicksand, sans-serif' }}>
    {error.includes('confirm') || error.includes('verified')
      ? 'Please check your email (including spam folder) for a confirmation link! 🌸'
      : error}
  </p>
)}

          {message && (
            <p style={{ color: '#86efac', fontSize: '13px', fontFamily: 'Quicksand, sans-serif' }}>
              {message}
            </p>
          )}

          <button
            onClick={handle}
            disabled={loading}
            style={{
              background: 'linear-gradient(135deg, #9b7fd4, #c4b5fd)',
              color: 'white',
              border: 'none',
              borderRadius: '14px',
              padding: '12px',
              fontSize: '15px',
              fontWeight: 700,
              fontFamily: 'Quicksand, sans-serif',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              boxShadow: '0 4px 14px rgba(155,127,212,0.4)',
              transition: 'all 0.2s',
              marginTop: '4px',
            }}
          >
            {loading ? 'Loading...' : isSignup ? 'Create Account' : 'Log In'}
          </button>

          <p style={{
            textAlign: 'center',
            fontSize: '13px',
            color: darkMode ? '#c4b5fd' : '#9b7fd4',
            fontFamily: 'Quicksand, sans-serif',
            cursor: 'pointer',
            marginTop: '4px',
          }}
            onClick={() => { setIsSignup(!isSignup); setError(''); setMessage('') }}
          >
            {isSignup ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
          </p>
        </div>

        <button className="mode-btn" onClick={() => setDarkMode(!darkMode)} style={{ marginTop: '8px' }}>
          {darkMode ? '☀️' : '🌙'}
        </button>
      </div>
    </div>
  )
}

export default Login
