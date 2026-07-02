'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function EditarCategoriaPage() {
  const router = useRouter()
  const params = useParams()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', slug: '', parent_id: '' })

  useEffect(() => {
    Promise.all([
      supabase.from('categories').select('id, name').is('parent_id', null).order('name'),
      supabase.from('categories').select('*').eq('id', params.id).single(),
    ]).then(([catRes, catData]) => {
      setCategories(catRes.data || [])
      if (catData.data) {
        setForm({
          name: catData.data.name || '',
          slug: catData.data.slug || '',
          parent_id: catData.data.parent_id || '',
        })
      }
      setLoading(false)
    })
  }, [params.id])

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    await supabase.from('categories').update({
      name: form.name,
      slug: form.slug,
      parent_id: form.parent_id || null,
    }).eq('id', params.id)
    router.push('/admin/categorias')
  }

  if (loading) return <p className="Dashboard-loading">Cargando...</p>

  return (
    <div className="Dashboard-page">
      <h1>Editar categoría</h1>
      <form className="Dashboard-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label>Nombre *</label>
            <input name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Slug *</label>
            <input name="slug" value={form.slug} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Categoría padre</label>
            <select name="parent_id" value={form.parent_id} onChange={handleChange}>
              <option value="">Ninguna</option>
              {categories.filter(c => c.id !== params.id).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>
        <button type="submit" className="btn">Guardar cambios</button>
      </form>
    </div>
  )
}
