import './globals.css'
import { supabase } from '@/lib/supabaseServer'
import Header from '@/components/Header'

export const metadata = {
  title: 'MiTienda - Productos de Cómputo',
  description: 'Tu tienda de tecnología',
}

export default async function RootLayout({ children }) {
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .is('parent_id', null)
    .order('name')

  return (
    <html lang="es">
      <body>
        <Header categories={categories} />
        <main>{children}</main>
      </body>
    </html>
  )
}
