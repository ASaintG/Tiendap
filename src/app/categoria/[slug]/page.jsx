import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabaseServer'

export const dynamic = 'force-dynamic'

export default async function CategoriaPage({ params }) {
  const { slug } = await params
  const { data: category } = await supabase
    .from('categories')
    .select('id, name, slug')
    .eq('slug', slug)
    .single()

  if (!category) notFound()

  const { data: subcategories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .eq('parent_id', category.id)
    .order('name')

  const categoryIds = [category.id, ...(subcategories?.map(c => c.id) || [])]

  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, slug, price, brand, stock_quantity, categories!inner(name, slug)')
    .in('category_id', categoryIds)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  return (
    <div className="Catalog">
      <div className="Catalog-header">
        <h1>{category.name}</h1>
        <Link href="/" className="Catalog-clear">Ver todos</Link>
      </div>

      {subcategories?.length > 0 && (
        <div className="Subcategories">
          {subcategories.map((sub) => (
            <Link key={sub.id} href={`/categoria/${sub.slug}`} className="Subcategory-link">
              {sub.name}
            </Link>
          ))}
        </div>
      )}

      {error && (
        <div className="Catalog-error">
          <p>Error: {error.message}</p>
        </div>
      )}
      {!products?.length ? (
        <div className="Catalog-empty">
          <p>No hay productos en esta categoría</p>
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
