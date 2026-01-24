import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { getProductById, getRelatedProducts } from '@/actions/products';
import PriceDisplay from '@/components/PriceDisplay';
import ProductActions from '@/components/ProductActions';
import ProductCard from '@/components/ProductCard';
import ProductGallery from '@/components/ProductGallery';

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
                {/* Image Section - Gallery */}
                <ProductGallery
                    mainImage={product.image}
                    images={product.images || []}
                    videos={product.videos || []}
                    productName={product.name}
                    isOffer={product.isOffer}
                    stock={product.stock}
                />

                {/* Info Section */}
                <div className="flex flex-col py-2 lg:py-6">
                    {/* Title */}
                    <div className="flex flex-col mb-2">
                        <h1 className="text-3xl lg:text-5xl font-light text-text-main leading-tight mb-2 tracking-tight">
                            {product.name}
                        </h1>
                        <p className="text-text-muted text-sm font-medium">
                            {product.category.name}
                        </p>
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
                    <div className="prose prose-sm text-text-muted mb-8 leading-relaxed max-w-md whitespace-pre-line">
                        {product.description}
                    </div>

                    {/* Product Actions: Quantity, WhatsApp, Favorite */}
                    <ProductActions
                        product={{
                            id: product.id,
                            name: product.name,
                            priceUsd: product.priceUsd,
                            image: product.image,
                            stock: product.stock,
                        }}
                    />
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
