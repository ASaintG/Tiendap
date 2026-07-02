'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function NuevaCategoriaPage() {
  const router = useRouter()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', slug: '', parent_id: '' })

  useEffect(() => {
    supabase.from('categories').select('id, name').is('parent_id', null).order('name').then(({ data }) => setCategories(data || []))
  }, [])

  const generateSlug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value, ...(name === 'name' ? { slug: generateSlug(value) } : {}) }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    await supabase.from('categories').insert({
      name: form.name,
      slug: form.slug,
      parent_id: form.parent_id || null,
    })
    router.push('/admin/categorias')
  }

  return (
    <div className="Dashboard-page">
      <h1>Nueva categoría</h1>
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
              <option value="">Ninguna (categoría principal)</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>
        <button type="submit" className="btn" disabled={loading}>Guardar</button>
      </form>
    </div>
  )
}
