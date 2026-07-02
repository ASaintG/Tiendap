'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'

export default function ProductosPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchProducts = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const { data } = await supabase
      .from('products')
      .select('id, name, slug, price, stock_quantity, is_active, categories(name)')
      .eq('vendor_id', session.user.id)
      .order('created_at', { ascending: false })

    setProducts(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchProducts() }, [])

  const toggleActive = async (id, current) => {
    await supabase.from('products').update({ is_active: !current }).eq('id', id)
    fetchProducts()
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este producto?')) return
    await supabase.from('products').delete().eq('id', id)
    fetchProducts()
  }

  if (loading) return <p className="Dashboard-loading">Cargando...</p>

  return (
    <div className="Dashboard-page">
      <div className="Dashboard-header">
        <h1>Productos</h1>
        <Link href="/dashboard/productos/nuevo" className="btn">+ Nuevo producto</Link>
      </div>

      <table className="DashTable">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Categoría</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{p.categories?.name || '-'}</td>
              <td>${Number(p.price).toLocaleString('es-CL')}</td>
              <td>{p.stock_quantity}</td>
              <td>
                <button className={`badge ${p.is_active ? 'badge-green' : 'badge-gray'}`} onClick={() => toggleActive(p.id, p.is_active)}>
                  {p.is_active ? 'Activo' : 'Inactivo'}
                </button>
              </td>
              <td className="actions">
                <Link href={`/dashboard/productos/${p.id}/editar`}>Editar</Link>
                <button onClick={() => handleDelete(p.id)} className="text-danger">Eliminar</button>
              </td>
            </tr>
          ))}
          {products.length === 0 && (
            <tr><td colSpan="6" style={{ textAlign: 'center', color: '#9ca3af' }}>No tienes productos aún</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
