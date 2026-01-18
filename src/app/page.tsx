import ProductCard from '@/components/ProductCard';
import HeroSlider from '@/components/HeroSlider';
import { getProducts } from '@/actions/products';
import { getHeroSlides } from '@/actions/hero-slides';

export default async function HomePage() {
  const [products, slides] = await Promise.all([
    getProducts(),
    getHeroSlides().catch(() => []), // Fallback si la tabla no existe aún
  ]);

  return (
    <>
      {/* Hero Slider */}
      <HeroSlider slides={slides} />

      {/* Products Section Header */}
      <div id="products" className="mx-auto max-w-7xl px-6 py-8 lg:px-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h3 className="font-serif-logo text-3xl font-bold text-text-main">
            Productos Destacados
          </h3>
          <p className="mt-2 text-text-muted">
            Selección curada para esta temporada.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="flex h-10 px-4 items-center justify-center rounded-full border border-transparent bg-primary text-white text-sm font-medium shadow-sm">
            Todos
          </button>
          <button className="flex h-10 px-4 items-center justify-center rounded-full border border-border hover:bg-background text-sm font-medium transition-colors">
            Ofertas
          </button>
          <button className="flex h-10 px-4 items-center justify-center rounded-full border border-border hover:bg-background text-sm font-medium transition-colors">
            Nuevos
          </button>
        </div>
      </div>

      {/* Products Grid */}
      <section className="mx-auto max-w-7xl px-6 pb-20 lg:px-8">
        {products.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                description={product.description}
                priceUsd={product.priceUsd}
                oldPriceUsd={product.oldPriceUsd}
                isOffer={product.isOffer}
                stock={product.stock}
                image={product.image}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🌸</div>
            <h4 className="text-xl font-bold text-text-main mb-2">
              Aún no hay productos
            </h4>
            <p className="text-text-muted mb-6">
              Los productos aparecerán aquí cuando los agregues desde el panel de administración.
            </p>
            <a
              href="/admin"
              className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-6 text-sm font-bold text-white transition-all hover:bg-primary-hover"
            >
              Ir al Panel Admin
            </a>
          </div>
        )}
      </section>
    </>
  );
}
