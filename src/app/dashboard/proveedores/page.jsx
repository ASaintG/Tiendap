'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'

export default function ProveedoresPage() {
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchSuppliers = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const { data } = await supabase
      .from('suppliers')
      .select('id, name, contact_name, email, phone')
      .eq('vendor_id', session.user.id)
      .order('name')

    setSuppliers(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchSuppliers() }, [])

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este proveedor?')) return
    await supabase.from('suppliers').delete().eq('id', id)
    fetchSuppliers()
  }

  if (loading) return <p className="Dashboard-loading">Cargando...</p>

  return (
    <div className="Dashboard-page">
      <div className="Dashboard-header">
        <h1>Proveedores</h1>
        <Link href="/dashboard/proveedores/nuevo" className="btn">+ Nuevo proveedor</Link>
      </div>

      <table className="DashTable">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Contacto</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {suppliers.map((s) => (
            <tr key={s.id}>
              <td>{s.name}</td>
              <td>{s.contact_name || '-'}</td>
              <td>{s.email || '-'}</td>
              <td>{s.phone || '-'}</td>
              <td className="actions">
                <Link href={`/dashboard/proveedores/${s.id}/editar`}>Editar</Link>
                <button onClick={() => handleDelete(s.id)} className="text-danger">Eliminar</button>
              </td>
            </tr>
          ))}
          {suppliers.length === 0 && (
            <tr><td colSpan="5" style={{ textAlign: 'center', color: '#9ca3af' }}>No tienes proveedores aún</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
