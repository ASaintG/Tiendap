import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabaseServer'

export const dynamic = 'force-dynamic'

export default async function ProductoPage({ params }) {
  const { slug } = await params
  const { data: product } = await supabase
    .from('products')
    .select(`
      id, name, slug, description, brand, model, specs,
      price, stock_quantity, is_active,
      categories(name, slug),
      product_images(image_data, alt_text, sort_order),
      profiles!products_vendor_id_fkey(full_name)
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!product) notFound()

  const specsEntries = product.specs ? Object.entries(product.specs) : []

  return (
    <div className="ProductDetail">
      <div className="ProductDetail-breadcrumb">
        <Link href="/">Inicio</Link>
        {product.categories && (
          <Link href={`/categoria/${product.categories.slug}`}>
            {product.categories.name}
          </Link>
        )}
        <span>{product.name}</span>
      </div>

      <div className="ProductDetail-content">
        <div className="ProductDetail-gallery">
          <div className="ProductDetail-placeholder">Sin imagen</div>
          {product.product_images?.length > 0 && (
            <div className="ProductDetail-thumbs">
              {product.product_images
                .sort((a, b) => a.sort_order - b.sort_order)
                .map((img) => (
                  <img key={img.image_data} src={img.image_data} alt={img.alt_text || product.name} />
                ))}
            </div>
          )}
        </div>

        <div className="ProductDetail-info">
          <h1>{product.name}</h1>
          {product.brand && <p className="ProductDetail-brand">{product.brand}</p>}
          {product.model && <p className="ProductDetail-model">Modelo: {product.model}</p>}

          <div className="ProductDetail-price">
            ${Number(product.price).toLocaleString('es-CL')}
          </div>

          <span className={`ProductDetail-stock ${product.stock_quantity > 0 ? 'in-stock' : 'out-of-stock'}`}>
            {product.stock_quantity > 0 ? `En stock (${product.stock_quantity} disponibles)` : 'Agotado'}
          </span>

          {product.description && (
            <div className="ProductDetail-description">
              <h3>Descripción</h3>
              <p>{product.description}</p>
            </div>
          )}

          {specsEntries.length > 0 && (
            <div className="ProductDetail-specs">
              <h3>Especificaciones</h3>
              <table>
                <tbody>
                  {specsEntries.map(([key, value]) => (
                    <tr key={key}>
                      <td>{key}</td>
                      <td>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {product.profiles?.full_name && (
            <p className="ProductDetail-vendor">
              Vendido por: {product.profiles.full_name}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
