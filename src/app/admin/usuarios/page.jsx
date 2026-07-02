'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function UsuariosPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchUsers = async () => {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
    setUsers(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchUsers() }, [])

  const handleRoleChange = async (id, role) => {
    await supabase.from('profiles').update({ role }).eq('id', id)
    fetchUsers()
  }

  if (loading) return <p className="Dashboard-loading">Cargando...</p>

  return (
    <div className="Dashboard-page">
      <h1>Usuarios</h1>

      <table className="DashTable">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email (ID)</th>
            <th>Rol</th>
            <th>Creado</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>{u.full_name || '—'}</td>
              <td style={{ fontSize: 12, color: '#6b7280' }}>{u.id}</td>
              <td>
                <select value={u.role} onChange={(e) => handleRoleChange(u.id, e.target.value)} className="role-select">
                  <option value="customer">Cliente</option>
                  <option value="vendor">Vendedor</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
              <td>{new Date(u.created_at).toLocaleDateString('es-CL')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
