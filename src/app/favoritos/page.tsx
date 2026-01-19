'use client';

import Link from 'next/link';
import { Heart, ArrowLeft, Trash2, MessageCircle, ShoppingBag } from 'lucide-react';
import { useFavorites } from '@/context/FavoritesContext';
import { useExchangeRate } from '@/context/ExchangeRateContext';
import { formatVes } from '@/lib/exchange-rate';

export default function FavoritosPage() {
    const { favorites, removeFavorite, clearFavorites } = useFavorites();
    const { rate } = useExchangeRate();

    // Calcular total
    const totalUsd = favorites.reduce((sum, item) => sum + item.priceUsd, 0);
    const totalVes = totalUsd * rate;

    // Generar mensaje para WhatsApp con todos los productos
    const handleBuyAll = () => {
        const productList = favorites
            .map((item) => `• ${item.name} - $${item.priceUsd.toFixed(2)}`)
            .join('\n');

        const message = encodeURIComponent(
            `¡Hola Daian! Quiero comprar los siguientes productos:\n\n${productList}\n\n*Total: $${totalUsd.toFixed(2)} (Bs. ${formatVes(totalVes)})*`
        );

        window.open(`https://wa.me/573003344963?text=${message}`, '_blank');
    };

    return (
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-primary mb-4"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Volver a la tienda
                    </Link>
                    <h1 className="font-serif-logo text-3xl font-bold text-text-main">
                        Mis Favoritos
                    </h1>
                    <p className="text-text-muted mt-1">
                        {favorites.length} {favorites.length === 1 ? 'producto guardado' : 'productos guardados'}
                    </p>
                </div>
                <div className="flex gap-3">
                    {favorites.length > 0 && (
                        <>
                            <button
                                onClick={clearFavorites}
                                className="text-sm text-text-muted hover:text-red-500 transition-colors px-4 py-2"
                            >
                                Limpiar todo
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Favorites Grid */}
            {favorites.length > 0 ? (
                <>
                    {/* Buy All Summary */}
                    <div className="mb-8 p-6 bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl border border-primary/20">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-lg font-bold text-text-main flex items-center gap-2">
                                    <ShoppingBag className="h-5 w-5 text-primary" />
                                    Resumen de tu lista
                                </h3>
                                <p className="text-text-muted text-sm mt-1">
                                    {favorites.length} productos • Total: <span className="font-bold text-primary">${totalUsd.toFixed(2)}</span>
                                    <span className="text-text-muted"> (Bs. {formatVes(totalVes)})</span>
                                </p>
                            </div>
                            <button
                                onClick={handleBuyAll}
                                className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white px-6 py-3 rounded-full font-bold shadow-lg transition-all hover:-translate-y-0.5"
                            >
                                <MessageCircle className="h-5 w-5" />
                                Pedir Todo por WhatsApp
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {favorites.map((item) => (
                            <div
                                key={item.id}
                                className="group relative bg-surface rounded-xl border border-border overflow-hidden hover:shadow-lg transition-shadow"
                            >
                                {/* Image */}
                                <Link href={`/product/${item.id}`}>
                                    <div
                                        className="aspect-square bg-cover bg-center"
                                        style={{ backgroundImage: `url('${item.image}')` }}
                                    />
                                </Link>

                                {/* Remove Button */}
                                <button
                                    onClick={() => removeFavorite(item.id)}
                                    className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
                                >
                                    <Trash2 className="h-4 w-4 text-text-muted hover:text-red-500" />
                                </button>

                                {/* Content */}
                                <div className="p-4">
                                    <Link href={`/product/${item.id}`}>
                                        <h3 className="font-bold text-text-main hover:text-primary transition-colors">
                                            {item.name}
                                        </h3>
                                    </Link>
                                    <div className="mt-2">
                                        <p className="text-lg font-bold text-primary">${item.priceUsd.toFixed(2)}</p>
                                        <p className="text-sm text-text-muted">
                                            Bs. {formatVes(item.priceUsd * rate)}
                                        </p>
                                    </div>
                                    <a
                                        href={`https://wa.me/573003344963?text=${encodeURIComponent(`Hola Daian, quiero ${item.name} - $${item.priceUsd}`)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] py-2.5 text-sm font-bold text-white hover:bg-[#20bd5a] transition-colors"
                                    >
                                        Pedir por WhatsApp
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <div className="text-center py-20">
                    <Heart className="h-16 w-16 mx-auto text-text-muted/30 mb-4" />
                    <h2 className="text-xl font-bold text-text-main mb-2">
                        No tienes favoritos aún
                    </h2>
                    <p className="text-text-muted mb-6">
                        Explora nuestra tienda y guarda tus productos favoritos
                    </p>
                    <Link
                        href="/"
                        className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-6 text-sm font-bold text-white transition-all hover:bg-primary-hover"
                    >
                        Explorar Tienda
                    </Link>
                </div>
            )}
        </div>
    );
}
