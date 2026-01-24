'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { Product, Category } from '@prisma/client';
import { demoProducts, demoCategories } from '@/lib/demo-data';

export type ProductWithCategory = Product & {
    category: Category;
};

export async function getProducts(): Promise<ProductWithCategory[]> {
    try {
        return await prisma.product.findMany({
            include: { category: true },
            orderBy: { createdAt: 'desc' },
        });
    } catch (error) {
        console.log('Using demo products (database unavailable)');
        return demoProducts as ProductWithCategory[];
    }
}

export async function getProductById(id: number): Promise<ProductWithCategory | null> {
    try {
        return await prisma.product.findUnique({
            where: { id },
            include: { category: true },
        });
    } catch (error) {
        console.log('Using demo product (database unavailable)');
        const product = demoProducts.find(p => p.id === id);
        return product as ProductWithCategory | null;
    }
}

export async function getRelatedProducts(categoryId: number, excludeId: number, limit = 4): Promise<ProductWithCategory[]> {
    try {
        return await prisma.product.findMany({
            where: {
                categoryId,
                id: { not: excludeId },
            },
            include: { category: true },
            take: limit,
        });
    } catch (error) {
        console.log('Using demo related products (database unavailable)');
        return demoProducts
            .filter(p => p.categoryId === categoryId && p.id !== excludeId)
            .slice(0, limit) as ProductWithCategory[];
    }
}

export async function createProduct(data: {
    name: string;
    description: string;
    details?: string | null;
    priceUsd: number;
    oldPriceUsd?: number | null;
    isOffer: boolean;
    stock: number;
    image: string;
    images?: string[];
    videos?: string[];
    categoryId: number;
}): Promise<Product> {
    const product = await prisma.product.create({
        data: {
            ...data,
            images: data.images || [],
            videos: data.videos || [],
        },
    });

    revalidatePath('/');
    revalidatePath('/admin');
    return product;
}

export async function updateProduct(
    id: number,
    data: {
        name?: string;
        description?: string;
        details?: string | null;
        priceUsd?: number;
        oldPriceUsd?: number | null;
        isOffer?: boolean;
        stock?: number;
        image?: string;
        images?: string[];
        videos?: string[];
        categoryId?: number;
    }
): Promise<Product> {
    const product = await prisma.product.update({
        where: { id },
        data,
    });

    revalidatePath('/');
    revalidatePath(`/product/${id}`);
    revalidatePath('/admin');
    return product;
}

export async function deleteProduct(id: number): Promise<void> {
    await prisma.product.delete({
        where: { id },
    });

    revalidatePath('/');
    revalidatePath('/admin');
}
