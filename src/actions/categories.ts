'use server';

import { prisma } from '@/lib/prisma';
import { Category } from '@prisma/client';

export async function getCategories(): Promise<Category[]> {
    return prisma.category.findMany({
        orderBy: { name: 'asc' },
    });
}

export async function createCategory(name: string): Promise<Category> {
    return prisma.category.create({
        data: { name },
    });
}

export async function deleteCategory(id: number): Promise<void> {
    await prisma.category.delete({
        where: { id },
    });
}
