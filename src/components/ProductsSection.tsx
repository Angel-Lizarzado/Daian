'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from './ProductCard';
import { type ProductWithCategory } from '@/actions/products';

interface ProductsSectionProps {
    products: ProductWithCategory[];
}

type FilterType = 'all' | 'offers' | 'new';

export default function ProductsSection({ products }: ProductsSectionProps) {
    const searchParams = useSearchParams();
    const [filter, setFilter] = useState<FilterType>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');

    // Leer parámetros de URL al cargar
    useEffect(() => {
        console.log('ProductsSection received:', products?.length, 'products');
        console.log('Sample product:', products?.[0]);

        const filterParam = searchParams.get('filter');
        const searchParam = searchParams.get('search');
        const categoryParam = searchParams.get('category');

        if (filterParam === 'offers') setFilter('offers');
        else if (filterParam === 'new') setFilter('new');
        else setFilter('all');

        if (searchParam) setSearchTerm(searchParam);
        if (categoryParam) setCategoryFilter(categoryParam);
        else setCategoryFilter('');
    }, [searchParams]);

    // Filtrar productos
    const filteredProducts = useMemo(() => {
        let result = [...products];

        // Aplicar filtro de categoría
        if (categoryFilter) {
            result = result.filter((p) =>
                p.category.name.toLowerCase() === categoryFilter.toLowerCase()
            );
        }

        // Aplicar filtro de búsqueda
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(
                (p) =>
                    p.name.toLowerCase().includes(term) ||
                    p.description.toLowerCase().includes(term) ||
                    p.category.name.toLowerCase().includes(term)
            );
        }

        // Aplicar filtro de tipo
        if (filter === 'offers') {
            result = result.filter((p) => p.isOffer);
        } else if (filter === 'new') {
            // "Nuevos" = productos agregados en los últimos 30 días
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            result = result.filter((p) => new Date(p.createdAt) >= thirtyDaysAgo);
        }

        return result;
    }, [products, filter, searchTerm, categoryFilter]);

    const handleFilterChange = (newFilter: FilterType) => {
        setFilter(newFilter);
        // Actualizar URL sin recargar
        const url = new URL(window.location.href);
        if (newFilter === 'all') {
            url.searchParams.delete('filter');
        } else {
            url.searchParams.set('filter', newFilter);
        }
        window.history.pushState({}, '', url.toString());
    };

    return (
        <>
            {/* Products Section Header */}
            <div id="products" className="mx-auto max-w-7xl px-6 py-8 lg:px-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="hidden"> Debug: {products?.length} loaded </div>
                    <h3 className="font-serif-logo text-3xl font-bold text-text-main">
                        {categoryFilter
                            ? categoryFilter
                            : filter === 'offers'
                                ? 'Ofertas'
                                : filter === 'new'
                                    ? 'Nuevos'
                                    : 'Productos Destacados'}
                    </h3>
                    <p className="mt-2 text-text-muted">
                        {searchTerm
                            ? `Resultados para "${searchTerm}"`
                            : categoryFilter
                                ? `${filteredProducts.length} productos en esta categoría`
                                : filter === 'offers'
                                    ? 'Los mejores precios en nuestra selección.'
                                    : filter === 'new'
                                        ? 'Agregados recientemente a nuestra tienda.'
                                        : 'Selección curada para esta temporada.'
                        }
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => handleFilterChange('all')}
                        className={`flex h-10 px-4 items-center justify-center rounded-full text-sm font-medium transition-colors ${filter === 'all'
                            ? 'bg-primary text-white shadow-sm'
                            : 'border border-border hover:bg-background'
                            }`}
                    >
                        Todos
                    </button>
                    <button
                        onClick={() => handleFilterChange('offers')}
                        className={`flex h-10 px-4 items-center justify-center rounded-full text-sm font-medium transition-colors ${filter === 'offers'
                            ? 'bg-primary text-white shadow-sm'
                            : 'border border-border hover:bg-background'
                            }`}
                    >
                        Ofertas
                    </button>
                    <button
                        onClick={() => handleFilterChange('new')}
                        className={`flex h-10 px-4 items-center justify-center rounded-full text-sm font-medium transition-colors ${filter === 'new'
                            ? 'bg-primary text-white shadow-sm'
                            : 'border border-border hover:bg-background'
                            }`}
                    >
                        Nuevos
                    </button>
                </div>
            </div>

            {/* Products Grid */}
            <section className="mx-auto max-w-7xl px-6 pb-20 lg:px-8">
                {filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredProducts.map((product) => (
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
                                slug={product.slug}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">🔍</div>
                        <h4 className="text-xl font-bold text-text-main mb-2">
                            {searchTerm ? 'No se encontraron productos' : 'No hay productos para mostrar'}
                        </h4>
                        <p className="text-text-muted mb-6">
                            {searchTerm
                                ? `No hay resultados para "${searchTerm}". Intenta con otro término.`
                                : 'Prueba con otro filtro o vuelve pronto.'
                            }
                        </p>
                        {(searchTerm || filter !== 'all') && (
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    handleFilterChange('all');
                                    window.history.pushState({}, '', window.location.pathname);
                                }}
                                className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-6 text-sm font-bold text-white transition-all hover:bg-primary-hover"
                            >
                                Ver todos los productos
                            </button>
                        )}
                    </div>
                )}
            </section>
        </>
    );
}
