'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function AdminPage() {
  const [stats, setStats] = useState({})

  useEffect(() => {
    Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('products').select('id', { count: 'exact', head: true }),
      supabase.from('categories').select('id', { count: 'exact', head: true }),
      supabase.from('suppliers').select('id', { count: 'exact', head: true }),
    ]).then(([users, products, categories, suppliers]) => {
      setStats({
        usuarios: users.count || 0,
        productos: products.count || 0,
        categorias: categories.count || 0,
        proveedores: suppliers.count || 0,
      })
    })
  }, [])

  return (
    <div className="Dashboard-page">
      <h1>Panel de Administración</h1>
      <div className="Dashboard-cards">
        <div className="DashCard"><span className="DashCard-icon">👥</span><div><p className="DashCard-value">{stats.usuarios}</p><p className="DashCard-label">Usuarios</p></div></div>
        <div className="DashCard"><span className="DashCard-icon">📦</span><div><p className="DashCard-value">{stats.productos}</p><p className="DashCard-label">Productos</p></div></div>
        <div className="DashCard"><span className="DashCard-icon">📂</span><div><p className="DashCard-value">{stats.categorias}</p><p className="DashCard-label">Categorías</p></div></div>
        <div className="DashCard"><span className="DashCard-icon">🤝</span><div><p className="DashCard-value">{stats.proveedores}</p><p className="DashCard-label">Proveedores</p></div></div>
      </div>
    </div>
  )
}
