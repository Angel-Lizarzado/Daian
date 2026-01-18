# 🌸 Daian Store

Tienda online autogestionable construida con Next.js, Prisma y Tailwind CSS. Diseñada para el mercado venezolano con conversión automática de divisas USD/VES.

## ✨ Características

- **Catálogo de Productos**: Gestión completa de productos con categorías, precios y stock
- **Conversión BCV**: Precios en USD con conversión automática a bolívares usando tasa oficial
- **Hero Slider**: Banner dinámico administrable desde el panel
- **Compra por WhatsApp**: Flujo de compra integrado con WhatsApp
- **Panel de Administración**: Dashboard completo para gestionar productos y slides
- **Subida de Imágenes**: Soporte para URL externa o subida local

## 🛠️ Tecnologías

- **Framework**: Next.js 15 (App Router)
- **Base de Datos**: Prisma + SQLite
- **Estilos**: Tailwind CSS v4
- **Iconos**: Lucide React
- **Formularios**: React Hook Form

## 🚀 Instalación

```bash
# Clonar repositorio
git clone https://github.com/Angel-Lizarzado/Daian.git
cd Daian

# Instalar dependencias
npm install

# Configurar base de datos
npx prisma migrate dev

# Cargar datos de prueba
npx tsx prisma/seed.ts

# Iniciar servidor de desarrollo
npm run dev
```

## 📁 Estructura del Proyecto

```
src/
├── actions/          # Server Actions (CRUD, upload)
├── app/              # Páginas y rutas
│   ├── admin/        # Panel de administración
│   ├── login/        # Inicio de sesión
│   └── product/      # Detalle de producto
├── components/       # Componentes reutilizables
├── context/          # Contextos de React
└── lib/              # Utilidades (Prisma, tasa de cambio)
```

## 🔐 Acceso al Panel Admin

- **URL**: `/login`
- **Usuario**: `Daian`
- **Contraseña**: `daian2026`

## 📸 Funcionalidades del Admin

| Sección | Descripción |
|---------|-------------|
| **Inventario** | CRUD de productos, categorías, precios USD/VES |
| **Hero Slides** | Gestión de banners del carrusel principal |
| **Subida de Imágenes** | URL externa o archivo local (JPG, PNG, WebP, GIF) |

## 🌐 API de Tasa de Cambio

La aplicación obtiene la tasa oficial del BCV desde [DolarAPI](https://ve.dolarapi.com/v1/dolares/oficial) con revalidación cada hora.

## 📄 Licencia

MIT
