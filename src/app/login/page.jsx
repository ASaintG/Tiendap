'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await supabase.auth.signInWithOtp({ email })

    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="Container">
        <div className="Card" style={{ textAlign: 'center' }}>
          <h1>Revisa tu correo</h1>
          <p style={{ margin: '20px 0', color: '#666' }}>
            Te enviamos un magic link a <strong>{email}</strong>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="Container">
      <div className="Card">
        <h1>Iniciar Sesión</h1>
        <form onSubmit={handleSubmit}>
          <label>
            Correo electrónico
            <input
              type="email"
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          {error && <p className="error">{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar magic link'}
          </button>
        </form>
      </div>
    </div>
  )
}
