'use server';

import { prisma } from '@/lib/prisma';
import { HeroSlide } from '@prisma/client';

export async function getHeroSlides(): Promise<HeroSlide[]> {
    return prisma.heroSlide.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' },
    });
}

export async function getAllHeroSlides(): Promise<HeroSlide[]> {
    return prisma.heroSlide.findMany({
        orderBy: { order: 'asc' },
    });
}

export async function createHeroSlide(data: {
    title: string;
    subtitle: string;
    buttonText: string;
    buttonLink: string;
    image: string;
    badge?: string;
    isActive?: boolean;
    order?: number;
}): Promise<HeroSlide> {
    return prisma.heroSlide.create({
        data: {
            ...data,
            isActive: data.isActive ?? true,
            order: data.order ?? 0,
        },
    });
}

export async function updateHeroSlide(
    id: number,
    data: {
        title?: string;
        subtitle?: string;
        buttonText?: string;
        buttonLink?: string;
        image?: string;
        badge?: string;
        isActive?: boolean;
        order?: number;
    }
): Promise<HeroSlide> {
    return prisma.heroSlide.update({
        where: { id },
        data,
    });
}

export async function deleteHeroSlide(id: number): Promise<void> {
    await prisma.heroSlide.delete({
        where: { id },
    });
}
