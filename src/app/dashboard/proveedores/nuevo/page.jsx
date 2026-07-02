'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function NuevoProveedorPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', contact_name: '', email: '', phone: '', address: '', notes: '',
  })

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const { error } = await supabase.from('suppliers').insert({
      vendor_id: session.user.id,
      ...form,
    })

    if (!error) router.push('/dashboard/proveedores')
    setLoading(false)
  }

  return (
    <div className="Dashboard-page">
      <h1>Nuevo proveedor</h1>
      <form className="Dashboard-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label>Nombre *</label>
            <input name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Nombre de contacto</label>
            <input name="contact_name" value={form.contact_name} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Teléfono</label>
            <input name="phone" value={form.phone} onChange={handleChange} />
          </div>
          <div className="form-group full-width">
            <label>Dirección</label>
            <input name="address" value={form.address} onChange={handleChange} />
          </div>
          <div className="form-group full-width">
            <label>Notas</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} rows="3" />
          </div>
        </div>
        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar proveedor'}
        </button>
      </form>
    </div>
  )
}
