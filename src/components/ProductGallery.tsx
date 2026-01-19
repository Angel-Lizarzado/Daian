'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';

interface ProductGalleryProps {
    mainImage: string;
    images: string[];
    videos?: string[];
    productName: string;
    isOffer?: boolean;
    stock?: number;
}

export default function ProductGallery({
    mainImage,
    images = [],
    videos = [],
    productName,
    isOffer,
    stock
}: ProductGalleryProps) {
    // Combinar imágenes y videos en una sola lista de "media"
    // Filtrar imagen principal de las adicionales para no duplicar
    const imageItems = [mainImage, ...images.filter(img => img !== mainImage)]
        .filter(Boolean)
        .map(url => ({ type: 'image' as const, url }));

    const videoItems = (videos || [])
        .filter(Boolean)
        .map(url => ({ type: 'video' as const, url }));

    const allMedia = [...imageItems, ...videoItems];
    const [currentIndex, setCurrentIndex] = useState(0);
    const videoRef = useRef<HTMLVideoElement>(null);

    // Resetear video cuando cambia el índice
    useEffect(() => {
        if (allMedia[currentIndex]?.type === 'video' && videoRef.current) {
            videoRef.current.currentTime = 0;
            // Opcional: auto-play al cambiar a video
            videoRef.current.play().catch(() => { });
        } else {
            // Pausar si cambiamos fuera de un video (aunque React desmontará el componente)
        }
    }, [currentIndex, allMedia]);

    const goToIndex = (index: number) => {
        setCurrentIndex(index);
    };

    const nextMedia = () => {
        setCurrentIndex((prev) => (prev + 1) % allMedia.length);
    };

    const prevMedia = () => {
        setCurrentIndex((prev) => (prev - 1 + allMedia.length) % allMedia.length);
    };

    const currentItem = allMedia[currentIndex];

    if (!currentItem) return null;

    return (
        <div className="flex flex-col gap-4 w-full">
            {/* Main Viewer */}
            <div className="w-full aspect-[3/4] lg:aspect-[4/5] overflow-hidden rounded-xl bg-gray-100 relative group">
                {/* Badges */}
                {isOffer && (
                    <div className="absolute top-4 left-4 z-10">
                        <span className="bg-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white">
                            Oferta
                        </span>
                    </div>
                )}
                {!isOffer && stock !== undefined && stock > 0 && stock <= 5 && (
                    <div className="absolute top-4 left-4 z-10">
                        <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-text-main">
                            ¡Últimas unidades!
                        </span>
                    </div>
                )}

                {/* Current Media Render */}
                {currentItem.type === 'video' ? (
                    <div className="w-full h-full bg-black flex items-center justify-center">
                        <video
                            ref={videoRef}
                            src={currentItem.url}
                            className="w-full h-full object-contain"
                            controls
                            playsInline
                            loop
                            // @ts-ignore
                            referrerPolicy="no-referrer"
                        // muted // Autoplay usually requires muted
                        />
                    </div>
                ) : (
                    <img
                        src={currentItem.url}
                        alt={`${productName} - Imagen ${currentIndex + 1}`}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/600x800?text=Sin+Imagen';
                        }}
                    />
                )}

                {/* Navigation Arrows (only if multiple items) */}
                {allMedia.length > 1 && (
                    <>
                        <button
                            onClick={prevMedia}
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm text-text-main flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-lg z-20"
                            aria-label="Anterior"
                        >
                            <ChevronLeft className="h-6 w-6" />
                        </button>
                        <button
                            onClick={nextMedia}
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm text-text-main flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-lg z-20"
                            aria-label="Siguiente"
                        >
                            <ChevronRight className="h-6 w-6" />
                        </button>

                        {/* Counter */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full font-medium z-20">
                            {currentIndex + 1} / {allMedia.length}
                        </div>
                    </>
                )}
            </div>

            {/* Thumbnails */}
            {allMedia.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                    {allMedia.map((item, index) => (
                        <button
                            key={index}
                            onClick={() => goToIndex(index)}
                            className={`flex-shrink-0 w-16 h-20 lg:w-20 lg:h-24 rounded-lg overflow-hidden transition-all relative ${currentIndex === index
                                ? 'ring-2 ring-primary ring-offset-2'
                                : 'opacity-60 hover:opacity-100'
                                }`}
                        >
                            {item.type === 'video' ? (
                                <div className="w-full h-full bg-black flex items-center justify-center relative">
                                    <video
                                        src={item.url}
                                        className="w-full h-full object-cover opacity-70"
                                        muted // Muted for thumbnail
                                        // @ts-ignore
                                        referrerPolicy="no-referrer"
                                        onLoadedMetadata={(e) => {
                                            // Set to a few seconds in to show content instead of black frame?
                                            // (e.target as HTMLVideoElement).currentTime = 1;
                                        }}
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-6 h-6 rounded-full bg-white/80 flex items-center justify-center">
                                            <Play className="h-3 w-3 text-black fill-black ml-0.5" />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <img
                                    src={item.url}
                                    alt={`${productName} - Miniatura ${index + 1}`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
