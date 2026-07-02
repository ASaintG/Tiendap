'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function Header({ categories }) {
  const [session, setSession] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [search, setSearch] = useState('')
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setSession(null)
    router.push('/')
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) router.push(`/?buscar=${encodeURIComponent(search)}`)
  }

  return (
    <header className="Header">
      <div className="Header-inner">
        <Link href="/" className="Header-logo">MiTienda</Link>

        <nav className="Header-nav">
          {categories?.map((cat) => (
            <Link key={cat.id} href={`/categoria/${cat.slug}`} className="Header-link">
              {cat.name}
            </Link>
          ))}
        </nav>

        <form className="Header-search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Buscar productos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>

        <div className="Header-user" onClick={() => setMenuOpen(!menuOpen)}>
          {session ? (
            <>
              <span className="Header-avatar">
                {session.user.email?.[0].toUpperCase()}
              </span>
              {menuOpen && (
                <div className="Header-dropdown">
                  <Link href="/dashboard">Dashboard</Link>
                  <button onClick={handleLogout}>Cerrar sesión</button>
                </div>
              )}
            </>
          ) : (
            <Link href="/login" className="Header-login">Iniciar sesión</Link>
          )}
        </div>
      </div>
    </header>
  )
}
