'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function DashboardPage() {
  const [stats, setStats] = useState(null)
  const [lowStock, setLowStock] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return

      const [productos, stockMovements, lowStockData] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact', head: true }).eq('vendor_id', session.user.id),
        supabase.from('stock_movements').select('quantity_change').eq('vendor_id', session.user.id),
        supabase.from('products').select('name, slug, stock_quantity').eq('vendor_id', session.user.id).lt('stock_quantity', 10).order('stock_quantity').limit(10),
      ])

      const totalEntradas = stockMovements.data?.filter(m => m.quantity_change > 0).reduce((a, b) => a + b.quantity_change, 0) || 0
      const totalSalidas = stockMovements.data?.filter(m => m.quantity_change < 0).reduce((a, b) => a + Math.abs(b.quantity_change), 0) || 0

      setStats({
        totalProductos: productos.count || 0,
        totalMovimientos: stockMovements.data?.length || 0,
        totalEntradas,
        totalSalidas,
      })
      setLowStock(lowStockData.data || [])
      setLoading(false)
    })
  }, [])

  if (loading) return <p className="Dashboard-loading">Cargando...</p>

  return (
    <div className="Dashboard-page">
      <h1>Resumen</h1>

      <div className="Dashboard-cards">
        <div className="DashCard">
          <span className="DashCard-icon">📦</span>
          <div>
            <p className="DashCard-value">{stats.totalProductos}</p>
            <p className="DashCard-label">Productos</p>
          </div>
        </div>
        <div className="DashCard">
          <span className="DashCard-icon">📥</span>
          <div>
            <p className="DashCard-value">+{stats.totalEntradas}</p>
            <p className="DashCard-label">Entradas de stock</p>
          </div>
        </div>
        <div className="DashCard">
          <span className="DashCard-icon">📤</span>
          <div>
            <p className="DashCard-value">-{stats.totalSalidas}</p>
            <p className="DashCard-label">Salidas de stock</p>
          </div>
        </div>
        <div className="DashCard">
          <span className="DashCard-icon">📋</span>
          <div>
            <p className="DashCard-value">{stats.totalMovimientos}</p>
            <p className="DashCard-label">Movimientos totales</p>
          </div>
        </div>
      </div>

      {lowStock.length > 0 && (
        <div className="Dashboard-section">
          <h2>Productos con stock bajo</h2>
          <table className="DashTable">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Stock actual</th>
              </tr>
            </thead>
            <tbody>
              {lowStock.map((p) => (
                <tr key={p.slug}>
                  <td>{p.name}</td>
                  <td className="text-danger">{p.stock_quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
