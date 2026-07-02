# Documentación del Proyecto — Next.js + Supabase Auth

## Estructura del proyecto

```
src/
├── app/
│   ├── layout.jsx        # Layout raíz (html, body, metadata)
│   ├── page.jsx          # Home protegido (requiere sesión)
│   ├── login/
│   │   └── page.jsx      # Login con magic link
│   └── globals.css       # Estilos globales
├── lib/
│   └── supabaseClient.js # Cliente de Supabase (lado cliente)
└── middleware.js          # Proxy que protege rutas
```

## Cómo funciona el flujo de auth

### 1. Login (`/login`)
- Usuario ingresa su email y hace clic en "Enviar magic link"
- Se llama a `supabase.auth.signInWithOtp({ email })`
- Supabase envía un link mágico al correo
- Se muestra pantalla de confirmación

### 2. Magic link
- Usuario abre su correo y hace clic en el link
- Supabase setea una cookie de sesión automáticamente
- El proxy (middleware) detecta la cookie y redirige a Home

### 3. Proxy (`middleware.js`)
- Se ejecuta en cada request
- Si no hay sesión y la ruta no es `/login` → redirige a `/login`
- Si hay sesión y la ruta es `/login` → redirige a `/`
- Maneja cookies con `@supabase/ssr` (httpOnly, secure, sameSite)

### 4. Home (`/`) — doble verificación
- El proxy ya protege la ruta, pero el componente también verifica con `getSession()` por seguridad
- Si no hay sesión → `router.push('/login')`
- Muestra el email del usuario y botón de cerrar sesión

## Variables de entorno (`.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
```

En Next.js las variables que necesita el cliente deben empezar con `NEXT_PUBLIC_`.

## Comandos

| Comando | Descripción |
|---------|-------------|
| `pnpm dev` | Inicia servidor de desarrollo |
| `pnpm build` | Compila para producción |
| `pnpm start` | Sirve la build de producción |

## Cómo agregar una nueva página

1. Crear carpeta dentro de `src/app/`, ej: `src/app/productos/`
2. Crear `page.jsx` dentro:

```jsx
export default function ProductosPage() {
  return <h1>Productos</h1>
}
```

3. La ruta será `/productos` automáticamente
4. El proxy ya protege todas las rutas (menos `/login`)

## Cómo usar Supabase desde cualquier componente

```jsx
'use client'
import { supabase } from '@/lib/supabaseClient'

// Leer datos
const { data } = await supabase.from('tabla').select('*')

// Insertar
await supabase.from('tabla').insert({ campo: 'valor' })
```

El `@` en `@/lib/supabaseClient` es un alias configurado en `tsconfig.json` que apunta a `src/`.

## Diferencia clave con CRA

| Concepto | CRA (react-scripts) | Next.js |
|----------|-------------------|---------|
| Routing | Manual (react-router) | File-based en `app/` |
| Env vars cliente | `REACT_APP_` | `NEXT_PUBLIC_` |
| Entry point | `src/index.js` | `src/app/layout.jsx` |
| HTML | `public/index.html` | Generado automáticamente |
| Imports | Rutas relativas | `@/` alias para `src/` |
| Dev server | `npm start` | `pnpm dev` |
| Estilos globales | `index.css` importado en `index.js` | `globals.css` importado en `layout.jsx` |

## Seed de datos de prueba

1. Abrir Supabase > Authentication > Users y copiar el UUID del usuario
2. En `seed.sql`, reemplazar `'TU_UUID_AQUI'` con ese UUID
3. Ejecutar `seed.sql` en el SQL Editor de Supabase
4. Se puede ejecutar múltiples veces sin errores (todo tiene `ON CONFLICT`)

## Rutas de la app

```
PÚBLICAS (sin login)
  /                          Catálogo de productos (con búsqueda)
  /producto/[slug]           Detalle del producto
  /categoria/[slug]          Productos por categoría
  /login                     Magic link

VENDEDOR (requiere rol vendor)
  /dashboard                 Resumen con stats + alerta stock bajo
  /dashboard/productos       Lista de productos
  /dashboard/productos/nuevo Crear producto
  /dashboard/productos/[id]/editar  Editar producto
  /dashboard/stock           Stock actual + ajuste manual + movimientos
  /dashboard/proveedores     Lista de proveedores
  /dashboard/proveedores/nuevo      Crear proveedor
  /dashboard/proveedores/[id]/editar Editar proveedor

ADMIN (requiere rol admin)
  /admin                     Stats generales de la plataforma
  /admin/categorias          CRUD de categorías (con jerarquía)
  /admin/categorias/nuevo         Crear categoría
  /admin/categorias/[id]/editar   Editar categoría
  /admin/usuarios            Gestión de roles (customer / vendor / admin)
```
