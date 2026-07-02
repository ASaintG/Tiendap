'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function NuevoProductoPage() {
  const router = useRouter()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', slug: '', description: '', brand: '', model: '',
    category_id: '', price: '', stock_quantity: '',
  })
  const [specs, setSpecs] = useState([{ key: '', value: '' }])

  useEffect(() => {
    supabase.from('categories').select('id, name').order('name').then(({ data }) => setCategories(data || []))
  }, [])

  const generateSlug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'name' ? { slug: generateSlug(value) } : {}),
    }))
  }

  const handleSpecChange = (i, field, value) => {
    const newSpecs = [...specs]
    newSpecs[i][field] = value
    setSpecs(newSpecs)
  }

  const addSpec = () => setSpecs([...specs, { key: '', value: '' }])
  const removeSpec = (i) => setSpecs(specs.filter((_, idx) => idx !== i))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const specsJson = specs.filter(s => s.key).reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {})

    const { error } = await supabase.from('products').insert({
      vendor_id: session.user.id,
      category_id: form.category_id || null,
      name: form.name,
      slug: form.slug,
      description: form.description || null,
      brand: form.brand || null,
      model: form.model || null,
      specs: specsJson,
      price: parseFloat(form.price),
      stock_quantity: parseInt(form.stock_quantity) || 0,

    })

    if (!error) router.push('/dashboard/productos')
    setLoading(false)
  }

  return (
    <div className="Dashboard-page">
      <h1>Nuevo producto</h1>
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
            <label>Marca</label>
            <input name="brand" value={form.brand} onChange={handleChange} placeholder="Kingston, Logitech..." />
          </div>
          <div className="form-group">
            <label>Modelo</label>
            <input name="model" value={form.model} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Categoría</label>
            <select name="category_id" value={form.category_id} onChange={handleChange}>
              <option value="">Sin categoría</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Precio *</label>
            <input name="price" type="number" step="0.01" min="0" value={form.price} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Stock inicial</label>
            <input name="stock_quantity" type="number" min="0" value={form.stock_quantity} onChange={handleChange} />
          </div>
        </div>

        <div className="form-group full-width">
          <label>Descripción</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows="3" />
        </div>

        <div className="form-group full-width">
          <label>Especificaciones técnicas</label>
          {specs.map((spec, i) => (
            <div key={i} className="spec-row">
              <input placeholder="Nombre (ej: Capacidad)" value={spec.key} onChange={(e) => handleSpecChange(i, 'key', e.target.value)} />
              <input placeholder="Valor (ej: 1TB)" value={spec.value} onChange={(e) => handleSpecChange(i, 'value', e.target.value)} />
              {specs.length > 1 && <button type="button" onClick={() => removeSpec(i)} className="btn-danger">×</button>}
            </div>
          ))}
          <button type="button" onClick={addSpec} className="btn-secondary">+ Agregar especificación</button>
        </div>

        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar producto'}
        </button>
      </form>
    </div>
  )
}
