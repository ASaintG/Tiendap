'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function EditarProveedorPage() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '', contact_name: '', email: '', phone: '', address: '', notes: '',
  })

  useEffect(() => {
    supabase.from('suppliers').select('*').eq('id', params.id).single().then(({ data }) => {
      if (data) {
        setForm({
          name: data.name || '',
          contact_name: data.contact_name || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          notes: data.notes || '',
        })
      }
      setLoading(false)
    })
  }, [params.id])

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    await supabase.from('suppliers').update(form).eq('id', params.id)
    router.push('/dashboard/proveedores')
  }

  if (loading) return <p className="Dashboard-loading">Cargando...</p>

  return (
    <div className="Dashboard-page">
      <h1>Editar proveedor</h1>
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
        <button type="submit" className="btn" disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>
    </div>
  )
}
