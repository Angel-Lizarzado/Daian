'use server';

import { prisma } from '@/lib/prisma';
import { Product, Category } from '@prisma/client';

export type ProductWithCategory = Product & {
    category: Category;
};

export async function getProducts(): Promise<ProductWithCategory[]> {
    return prisma.product.findMany({
        include: { category: true },
        orderBy: { createdAt: 'desc' },
    });
}

export async function getProductById(id: number): Promise<ProductWithCategory | null> {
    return prisma.product.findUnique({
        where: { id },
        include: { category: true },
    });
}

export async function getRelatedProducts(categoryId: number, excludeId: number, limit = 4): Promise<ProductWithCategory[]> {
    return prisma.product.findMany({
        where: {
            categoryId,
            id: { not: excludeId },
        },
        include: { category: true },
        take: limit,
    });
}

export async function createProduct(data: {
    name: string;
    description: string;
    priceUsd: number;
    oldPriceUsd?: number | null;
    isOffer: boolean;
    stock: number;
    image: string;
    categoryId: number;
}): Promise<Product> {
    return prisma.product.create({
        data,
    });
}

export async function updateProduct(
    id: number,
    data: {
        name?: string;
        description?: string;
        priceUsd?: number;
        oldPriceUsd?: number | null;
        isOffer?: boolean;
        stock?: number;
        image?: string;
        categoryId?: number;
    }
): Promise<Product> {
    return prisma.product.update({
        where: { id },
        data,
    });
}

export async function deleteProduct(id: number): Promise<void> {
    await prisma.product.delete({
        where: { id },
    });
}
