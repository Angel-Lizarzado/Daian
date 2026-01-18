'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import PriceDisplay from './PriceDisplay';
import WhatsAppButton from './WhatsAppButton';

interface ProductCardProps {
    id: number;
    name: string;
    description: string;
    priceUsd: number;
    oldPriceUsd?: number | null;
    isOffer: boolean;
    stock: number;
    image: string;
}

export default function ProductCard({
    id,
    name,
    description,
    priceUsd,
    oldPriceUsd,
    isOffer,
    stock,
    image,
}: ProductCardProps) {
    return (
        <div className="group relative flex flex-col rounded-xl bg-surface shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] transition-transform duration-300 hover:-translate-y-1 overflow-hidden">
            {/* Image Container */}
            <Link href={`/product/${id}`} className="relative aspect-[4/5] w-full overflow-hidden bg-gray-100">
                {/* Badge */}
                {isOffer && (
                    <div className="absolute top-3 left-3 z-10">
                        <span className="inline-flex items-center rounded-full bg-primary px-3 py-1 text-xs font-bold text-white shadow-sm">
                            Oferta
                        </span>
                    </div>
                )}
                {!isOffer && stock <= 5 && stock > 0 && (
                    <div className="absolute top-3 left-3 z-10">
                        <span className="inline-flex items-center rounded-full bg-white/90 backdrop-blur px-3 py-1 text-xs font-bold text-text-main shadow-sm">
                            ¡Últimas unidades!
                        </span>
                    </div>
                )}
                {stock === 0 && (
                    <div className="absolute top-3 left-3 z-10">
                        <span className="inline-flex items-center rounded-full bg-gray-800 px-3 py-1 text-xs font-bold text-white shadow-sm">
                            Agotado
                        </span>
                    </div>
                )}

                {/* Favorite Button */}
                <button className="absolute top-3 right-3 z-10 flex size-8 items-center justify-center rounded-full bg-white/80 text-text-main opacity-0 transition-opacity duration-300 hover:bg-white hover:text-red-500 group-hover:opacity-100">
                    <Heart className="h-5 w-5" />
                </button>

                {/* Product Image */}
                <div
                    className="h-full w-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                    style={{ backgroundImage: `url('${image}')` }}
                />
            </Link>

            {/* Content */}
            <div className="flex flex-1 flex-col p-5">
                <div className="mb-2">
                    <Link href={`/product/${id}`}>
                        <h3 className="text-lg font-bold text-text-main hover:text-primary transition-colors">
                            {name}
                        </h3>
                    </Link>
                    <p className="text-sm text-text-muted line-clamp-1">{description}</p>
                </div>

                <div className="mb-5">
                    <PriceDisplay
                        priceUsd={priceUsd}
                        oldPriceUsd={oldPriceUsd}
                        isOffer={isOffer}
                        size="md"
                    />
                </div>

                <WhatsAppButton
                    productId={id}
                    productName={name}
                    priceUsd={priceUsd}
                    disabled={stock === 0}
                />
            </div>
        </div>
    );
}
