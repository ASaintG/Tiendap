'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function EditarProductoPage() {
  const router = useRouter()
  const params = useParams()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '', slug: '', description: '', brand: '', model: '',
    category_id: '', price: '', stock_quantity: '',
  })
  const [specs, setSpecs] = useState([])

  useEffect(() => {
    Promise.all([
      supabase.from('categories').select('id, name').order('name'),
      supabase.from('products').select('*').eq('id', params.id).single(),
    ]).then(([catRes, prodRes]) => {
      setCategories(catRes.data || [])
      const p = prodRes.data
      if (p) {
        setForm({
          name: p.name || '',
          slug: p.slug || '',
          description: p.description || '',
          brand: p.brand || '',
          model: p.model || '',
          category_id: p.category_id || '',
          price: p.price?.toString() || '',
          stock_quantity: p.stock_quantity?.toString() || '0',
        })
        setSpecs(p.specs ? Object.entries(p.specs).map(([key, value]) => ({ key, value: String(value) })) : [])
      }
      setLoading(false)
    })
  }, [params.id])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
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
    setSaving(true)

    const specsJson = specs.filter(s => s.key).reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {})

    await supabase.from('products').update({
      category_id: form.category_id || null,
      name: form.name,
      slug: form.slug,
      description: form.description || null,
      brand: form.brand || null,
      model: form.model || null,
      specs: specsJson,
      price: parseFloat(form.price),
      stock_quantity: parseInt(form.stock_quantity) || 0,

    }).eq('id', params.id)

    router.push('/dashboard/productos')
  }

  if (loading) return <p className="Dashboard-loading">Cargando...</p>

  return (
    <div className="Dashboard-page">
      <h1>Editar producto</h1>
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
            <input name="brand" value={form.brand} onChange={handleChange} />
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
            <label>Stock</label>
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
              <input placeholder="Nombre" value={spec.key} onChange={(e) => handleSpecChange(i, 'key', e.target.value)} />
              <input placeholder="Valor" value={spec.value} onChange={(e) => handleSpecChange(i, 'value', e.target.value)} />
              {specs.length > 1 && <button type="button" onClick={() => removeSpec(i)} className="btn-danger">×</button>}
            </div>
          ))}
          <button type="button" onClick={addSpec} className="btn-secondary">+ Agregar</button>
        </div>

        <button type="submit" className="btn" disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>
    </div>
  )
}
