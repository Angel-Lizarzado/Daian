'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface Slide {
    id: number;
    title: string;
    subtitle: string;
    buttonText: string;
    buttonLink: string;
    image: string;
    badge?: string | null;
}

interface HeroSliderProps {
    slides: Slide[];
}

// Slide por defecto cuando no hay slides en la DB
const defaultSlide: Slide = {
    id: 0,
    title: 'Elegancia Sin Esfuerzo',
    subtitle: 'Descubre nuestra nueva colección de piezas minimalistas diseñadas para la mujer moderna. Telas suaves, tonos neutros y cortes atemporales.',
    buttonText: 'Ver Colección',
    buttonLink: '#products',
    image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2073&q=80',
    badge: 'Nueva Colección',
};

export default function HeroSlider({ slides }: HeroSliderProps) {
    const displaySlides = slides.length > 0 ? slides : [defaultSlide];
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    const nextSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % displaySlides.length);
    }, [displaySlides.length]);

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + displaySlides.length) % displaySlides.length);
    };

    const goToSlide = (index: number) => {
        setCurrentIndex(index);
        setIsAutoPlaying(false);
        setTimeout(() => setIsAutoPlaying(true), 5000);
    };

    // Auto-play
    useEffect(() => {
        if (!isAutoPlaying || displaySlides.length <= 1) return;

        const interval = setInterval(nextSlide, 5000);
        return () => clearInterval(interval);
    }, [isAutoPlaying, displaySlides.length, nextSlide]);

    const currentSlide = displaySlides[currentIndex];

    return (
        <section className="mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-12">
            <div className="relative overflow-hidden rounded-xl bg-primary-light shadow-sm">
                {/* Slide Container */}
                <div
                    className="relative min-h-[400px] lg:min-h-[500px] px-6 py-12 lg:px-20 lg:py-24 transition-all duration-500"
                >
                    {/* Background Image */}
                    <div
                        className="absolute right-0 top-0 h-full w-full lg:w-1/2 bg-cover bg-center opacity-10 lg:opacity-40 transition-all duration-500"
                        style={{
                            backgroundImage: `url('${currentSlide.image}')`,
                            maskImage: 'linear-gradient(to left, black, transparent)'
                        }}
                    />

                    {/* Mobile gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-light via-primary-light/80 to-transparent lg:hidden" />

                    {/* Content */}
                    <div className="relative z-10 max-w-lg">
                        {currentSlide.badge && (
                            <span className="mb-4 inline-block rounded-full bg-primary/20 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary animate-fade-in">
                                {currentSlide.badge}
                            </span>
                        )}
                        <h2
                            key={`title-${currentSlide.id}`}
                            className="font-serif-logo text-4xl font-bold leading-tight text-text-main lg:text-6xl animate-slide-up"
                        >
                            {currentSlide.title}
                        </h2>
                        <p
                            key={`subtitle-${currentSlide.id}`}
                            className="mt-6 text-lg text-text-muted leading-relaxed animate-slide-up-delay"
                        >
                            {currentSlide.subtitle}
                        </p>
                        <div className="mt-8 flex flex-wrap gap-4 animate-slide-up-delay-2">
                            <Link
                                href={currentSlide.buttonLink}
                                className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-sm font-bold text-white transition-all hover:bg-primary-hover shadow-lg shadow-primary/30"
                            >
                                {currentSlide.buttonText}
                            </Link>
                            <a
                                href="https://wa.me/573003344963"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex h-12 items-center justify-center rounded-full border border-primary/30 bg-transparent px-8 text-sm font-bold text-text-main transition-all hover:bg-primary/10"
                            >
                                Contáctanos
                            </a>
                        </div>
                    </div>

                    {/* Navigation Arrows */}
                    {displaySlides.length > 1 && (
                        <>
                            <button
                                onClick={prevSlide}
                                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex size-10 items-center justify-center rounded-full bg-white/80 hover:bg-white text-text-main shadow-md transition-all hover:scale-110"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <button
                                onClick={nextSlide}
                                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex size-10 items-center justify-center rounded-full bg-white/80 hover:bg-white text-text-main shadow-md transition-all hover:scale-110"
                            >
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </>
                    )}
                </div>

                {/* Dots Indicator */}
                {displaySlides.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                        {displaySlides.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToSlide(index)}
                                className={`h-2 rounded-full transition-all ${index === currentIndex
                                    ? 'w-8 bg-primary'
                                    : 'w-2 bg-text-main/20 hover:bg-text-main/40'
                                    }`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
