'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { Product, Category } from '@prisma/client';
import { demoProducts, demoCategories } from '@/lib/demo-data';

export type ProductWithCategory = Product & {
    category: Category;
    slug: string;
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


function slugify(text: string): string {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')     // Replace spaces with -
        .replace(/[^\w\-]+/g, '') // Remove all non-word chars
        .replace(/\-\-+/g, '-');  // Replace multiple - with single -
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
    let slug = slugify(data.name);

    // Check for uniqueness
    let count = 0;
    while (await prisma.product.count({ where: { slug } }) > 0) {
        count++;
        slug = `${slugify(data.name)}-${count}`;
    }

    const product = await prisma.product.create({
        data: {
            ...data,
            slug,
            images: data.images || [],
            videos: data.videos || [],
        },
    });

    revalidatePath('/');
    revalidatePath('/admin');
    return product;
}

export async function getProductBySlug(slug: string): Promise<ProductWithCategory | null> {
    try {
        return await prisma.product.findUnique({
            where: { slug },
            include: { category: true },
        });
    } catch (error) {
        console.log('Error fetching product by slug', error);
        return null;
    }
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
    // If name changes, we could update slug, but usually better to keep slug stable or ask user. 
    // For now, let's keep slug stable unless explicitly requested, or we can auto-update if name changes.
    // Let's AUTO-UPDATE for simplicity in this MVP rebrand.

    let slugUpdate = {};
    if (data.name) {
        let slug = slugify(data.name);
        // Check for uniqueness (excluding current product)
        const existing = await prisma.product.findFirst({
            where: {
                slug,
                id: { not: id }
            }
        });

        if (existing) {
            let count = 1;
            while (await prisma.product.count({ where: { slug: `${slug}-${count}`, id: { not: id } } }) > 0) {
                count++;
            }
            slug = `${slug}-${count}`;
        }
        slugUpdate = { slug };
    }

    const product = await prisma.product.update({
        where: { id },
        data: {
            ...data,
            ...slugUpdate,
        },
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
