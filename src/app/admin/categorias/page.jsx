'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'

export default function CategoriasPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('name')
    setCategories(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchCategories() }, [])

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta categoría?')) return
    await supabase.from('categories').delete().eq('id', id)
    fetchCategories()
  }

  if (loading) return <p className="Dashboard-loading">Cargando...</p>

  return (
    <div className="Dashboard-page">
      <div className="Dashboard-header">
        <h1>Categorías</h1>
        <Link href="/admin/categorias/nuevo" className="btn">+ Nueva categoría</Link>
      </div>

      <table className="DashTable">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Slug</th>
            <th>Padre</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {categories.map(c => (
            <tr key={c.id}>
              <td>{c.name}</td>
              <td>{c.slug}</td>
              <td>{c.parent_id ? 'Subcategoría' : 'Principal'}</td>
              <td className="actions">
                <Link href={`/admin/categorias/${c.id}/editar`}>Editar</Link>
                <button onClick={() => handleDelete(c.id)} className="text-danger">Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
