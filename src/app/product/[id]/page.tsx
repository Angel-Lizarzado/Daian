import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Heart, Minus, Plus } from 'lucide-react';
import { getProductById, getRelatedProducts } from '@/actions/products';
import PriceDisplay from '@/components/PriceDisplay';
import WhatsAppButton from '@/components/WhatsAppButton';
import ProductCard from '@/components/ProductCard';

interface ProductPageProps {
    params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
    const { id } = await params;
    const productId = parseInt(id, 10);

    if (isNaN(productId)) {
        notFound();
    }

    const product = await getProductById(productId);

    if (!product) {
        notFound();
    }

    const relatedProducts = await getRelatedProducts(product.categoryId, product.id, 4);

    return (
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
            {/* Breadcrumb */}
            <div className="flex flex-wrap gap-2 items-center text-sm mb-8">
                <Link href="/" className="text-text-muted hover:text-primary transition-colors font-medium">
                    Inicio
                </Link>
                <span className="text-text-muted/50 font-medium">/</span>
                <span className="text-text-muted font-medium">{product.category.name}</span>
                <span className="text-text-muted/50 font-medium">/</span>
                <span className="text-text-main font-semibold">{product.name}</span>
            </div>

            {/* Product Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
                {/* Image Section */}
                <div className="flex flex-col gap-4 w-full">
                    <div className="w-full aspect-[3/4] lg:aspect-[4/5] overflow-hidden rounded-xl bg-gray-100 relative group">
                        {/* Badges */}
                        {product.isOffer && (
                            <div className="absolute top-4 left-4 z-10">
                                <span className="bg-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white">
                                    Oferta
                                </span>
                            </div>
                        )}
                        {!product.isOffer && product.stock > 0 && product.stock <= 5 && (
                            <div className="absolute top-4 left-4 z-10">
                                <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-text-main">
                                    ¡Últimas unidades!
                                </span>
                            </div>
                        )}

                        {/* Main Image */}
                        <div
                            className="w-full h-full bg-center bg-no-repeat bg-cover transition-transform duration-700 group-hover:scale-105"
                            style={{ backgroundImage: `url('${product.image}')` }}
                        />
                    </div>
                </div>

                {/* Info Section */}
                <div className="flex flex-col py-2 lg:py-6">
                    {/* Title & Favorite */}
                    <div className="flex justify-between items-start w-full mb-2">
                        <div className="flex flex-col">
                            <h1 className="text-3xl lg:text-5xl font-light text-text-main leading-tight mb-2 tracking-tight">
                                {product.name}
                            </h1>
                            <p className="text-text-muted text-sm font-medium">
                                {product.category.name}
                            </p>
                        </div>
                        <button className="p-2 rounded-full bg-gray-50 text-text-muted hover:text-primary transition-colors">
                            <Heart className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Price */}
                    <div className="flex flex-col gap-3 mb-6 pt-6 border-t border-border mt-4">
                        <PriceDisplay
                            priceUsd={product.priceUsd}
                            oldPriceUsd={product.oldPriceUsd}
                            isOffer={product.isOffer}
                            size="lg"
                        />

                        {/* Stock Status */}
                        <div className="flex items-center gap-3">
                            {product.stock > 0 ? (
                                <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold uppercase tracking-wide flex items-center gap-1">
                                    <span className="size-1.5 rounded-full bg-green-500 animate-pulse" />
                                    Disponible ({product.stock} unidades)
                                </span>
                            ) : (
                                <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-bold uppercase tracking-wide">
                                    Agotado
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Description */}
                    <div className="prose prose-sm text-text-muted mb-8 leading-relaxed max-w-md">
                        <p>{product.description}</p>
                    </div>

                    {/* WhatsApp Button */}
                    <div className="flex flex-col gap-4">
                        <div className="flex gap-4">
                            {/* Quantity Selector (visual only) */}
                            <div className="flex items-center rounded-full bg-white border border-border h-14 px-2">
                                <button className="size-10 flex items-center justify-center text-text-muted hover:text-primary transition-colors">
                                    <Minus className="h-4 w-4" />
                                </button>
                                <span className="w-8 text-center text-text-main font-semibold">1</span>
                                <button className="size-10 flex items-center justify-center text-text-muted hover:text-primary transition-colors">
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>

                            {/* WhatsApp Button */}
                            <div className="flex-1">
                                <WhatsAppButton
                                    productId={product.id}
                                    productName={product.name}
                                    priceUsd={product.priceUsd}
                                    disabled={product.stock === 0}
                                />
                            </div>
                        </div>
                        <p className="text-xs text-text-muted text-center mt-1">
                            Envío gratis en Caracas para pedidos mayores a $50.
                        </p>
                    </div>
                </div>
            </div>

            {/* Related Products */}
            {relatedProducts.length > 0 && (
                <div className="w-full pt-16 pb-12 border-t border-border mt-12">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-2xl font-bold text-text-main">Productos Relacionados</h3>
                        <Link
                            href="/"
                            className="text-primary hover:text-primary-hover font-medium text-sm flex items-center gap-1 transition-colors group"
                        >
                            Ver todo
                            <ChevronLeft className="h-4 w-4 rotate-180 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                        {relatedProducts.map((relatedProduct) => (
                            <ProductCard
                                key={relatedProduct.id}
                                id={relatedProduct.id}
                                name={relatedProduct.name}
                                description={relatedProduct.description}
                                priceUsd={relatedProduct.priceUsd}
                                oldPriceUsd={relatedProduct.oldPriceUsd}
                                isOffer={relatedProduct.isOffer}
                                stock={relatedProduct.stock}
                                image={relatedProduct.image}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
