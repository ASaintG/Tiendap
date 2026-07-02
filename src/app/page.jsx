import Link from 'next/link'
import { supabase } from '@/lib/supabaseServer'

export const dynamic = 'force-dynamic'

export default async function HomePage({ searchParams }) {
  const busqueda = searchParams?.buscar

  let query = supabase
    .from('products')
    .select('id, name, slug, price, brand, stock_quantity, categories(name, slug)')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (busqueda) {
    query = query.ilike('name', `%${busqueda}%`)
  }

  const { data: products, error } = await query

  return (
    <div className="Catalog">
      {error && (
        <div className="Catalog-error">
          <p>Error al cargar productos: {error.message}</p>
        </div>
      )}
      <div className="Catalog-header">
        <h1>{busqueda ? `Resultados de "${busqueda}"` : 'Todos los productos'}</h1>
        {busqueda && (
          <Link href="/" className="Catalog-clear">Limpiar filtro</Link>
        )}
      </div>

      {!products?.length ? (
        <div className="Catalog-empty">
          <p>No hay productos disponibles</p>
        </div>
      ) : (
        <div className="Catalog-grid">
          {products.map((product) => (
            <Link key={product.id} href={`/producto/${product.slug}`} className="ProductCard">
              <div className="ProductCard-image">
                <div className="ProductCard-placeholder">Sin imagen</div>
              </div>
              <div className="ProductCard-body">
                {product.brand && <span className="ProductCard-brand">{product.brand}</span>}
                <h3 className="ProductCard-name">{product.name}</h3>
                {product.categories && (
                  <span className="ProductCard-category">{product.categories.name}</span>
                )}
                <div className="ProductCard-footer">
                  <span className="ProductCard-price">
                    ${Number(product.price).toLocaleString('es-CL')}
                  </span>
                  <span className={`ProductCard-stock ${product.stock_quantity > 0 ? 'in-stock' : 'out-of-stock'}`}>
                    {product.stock_quantity > 0 ? 'En stock' : 'Agotado'}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
