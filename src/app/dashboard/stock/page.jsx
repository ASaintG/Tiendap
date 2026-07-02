'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function StockPage() {
  const [products, setProducts] = useState([])
  const [movements, setMovements] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [adjustment, setAdjustment] = useState({ product_id: '', quantity: 0, note: '' })

  const fetchData = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const [prodRes, movRes] = await Promise.all([
      supabase.from('products').select('id, name, stock_quantity, slug').eq('vendor_id', session.user.id).order('name'),
      supabase.from('stock_movements').select('*, products(name)').eq('vendor_id', session.user.id).order('created_at', { ascending: false }).limit(50),
    ])

    setProducts(prodRes.data || [])
    setMovements(movRes.data || [])
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const handleAdjustment = async (e) => {
    e.preventDefault()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const qty = parseInt(adjustment.quantity)
    if (qty === 0) return

    const product = products.find(p => p.id === adjustment.product_id)
    if (!product) return

    const newStock = product.stock_quantity + qty
    if (newStock < 0) {
      alert('El stock no puede ser negativo')
      return
    }

    await supabase.from('products').update({ stock_quantity: newStock }).eq('id', adjustment.product_id)

    await supabase.from('stock_movements').insert({
      product_id: adjustment.product_id,
      vendor_id: session.user.id,
      quantity_change: qty,
      reason: 'manual_adjustment',
      note: adjustment.note || null,
    })

    setAdjustment({ product_id: '', quantity: 0, note: '' })
    setShowForm(false)
    fetchData()
  }

  if (loading) return <p className="Dashboard-loading">Cargando...</p>

  return (
    <div className="Dashboard-page">
      <div className="Dashboard-header">
        <h1>Stock</h1>
        <button className="btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancelar' : '+ Ajuste manual'}
        </button>
      </div>

      {showForm && (
        <form className="Dashboard-form" onSubmit={handleAdjustment}>
          <div className="form-grid">
            <div className="form-group">
              <label>Producto</label>
              <select value={adjustment.product_id} onChange={(e) => setAdjustment(prev => ({ ...prev, product_id: e.target.value }))} required>
                <option value="">Seleccionar...</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} (stock: {p.stock_quantity})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Cantidad (positivo=entrada, negativo=salida)</label>
              <input type="number" value={adjustment.quantity} onChange={(e) => setAdjustment(prev => ({ ...prev, quantity: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label>Nota</label>
              <input value={adjustment.note} onChange={(e) => setAdjustment(prev => ({ ...prev, note: e.target.value }))} placeholder="Motivo del ajuste" />
            </div>
          </div>
          <button type="submit" className="btn">Registrar ajuste</button>
        </form>
      )}

      <h2 style={{ marginTop: 32, fontSize: 18 }}>Stock actual</h2>
      <table className="DashTable">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Stock actual</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td className={p.stock_quantity < 10 ? 'text-danger' : ''}>{p.stock_quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 style={{ marginTop: 32, fontSize: 18 }}>Últimos movimientos</h2>
      <table className="DashTable">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Motivo</th>
            <th>Nota</th>
            <th>Fecha</th>
          </tr>
        </thead>
        <tbody>
          {movements.map(m => (
            <tr key={m.id}>
              <td>{m.products?.name}</td>
              <td className={m.quantity_change > 0 ? 'text-green' : 'text-danger'}>{m.quantity_change > 0 ? `+${m.quantity_change}` : m.quantity_change}</td>
              <td>{m.reason}</td>
              <td>{m.note || '-'}</td>
              <td>{new Date(m.created_at).toLocaleDateString('es-CL')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
