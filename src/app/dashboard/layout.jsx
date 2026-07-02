'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

const navItems = [
  { href: '/dashboard', label: 'Resumen', icon: '📊' },
  { href: '/dashboard/productos', label: 'Productos', icon: '📦' },
  { href: '/dashboard/stock', label: 'Stock', icon: '📋' },
  { href: '/dashboard/proveedores', label: 'Proveedores', icon: '🤝' },
]

export default function DashboardLayout({ children }) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return router.push('/login')
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, role')
        .eq('id', session.user.id)
        .single()
      setProfile(profile)
      setLoading(false)
    })
  }, [router])

  if (loading) return <div className="Container"><p>Cargando...</p></div>

  return (
    <div className="Dashboard">
      <aside className="Dashboard-sidebar">
        <div className="Dashboard-user">
          <div className="Dashboard-avatar">
            {profile?.full_name?.[0] || 'U'}
          </div>
          <div>
            <strong>{profile?.full_name || 'Usuario'}</strong>
            <span className="Dashboard-role">{profile?.role}</span>
          </div>
        </div>
        <nav className="Dashboard-nav">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`Dashboard-navItem ${pathname === item.href ? 'active' : ''}`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <Link href="/" className="Dashboard-back">← Volver a la tienda</Link>
      </aside>
      <div className="Dashboard-content">
        {children}
      </div>
    </div>
  )
}
