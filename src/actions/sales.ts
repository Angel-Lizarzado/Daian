'use server';

import { prisma } from '@/lib/prisma';
import { Sale, Product } from '@prisma/client';

export type SaleWithProduct = Sale & {
    product: Product;
};

export async function getSales(): Promise<SaleWithProduct[]> {
    try {
        return await prisma.sale.findMany({
            include: { product: true },
            orderBy: { createdAt: 'desc' },
        });
    } catch (error) {
        console.error('Error fetching sales:', error);
        return [];
    }
}

export async function createSale(data: {
    productId: number;
    quantity: number;
    priceUsd: number;
    exchangeRate: number;
    notes?: string;
}): Promise<{ success: boolean; sale?: Sale; error?: string }> {
    try {
        // Verificar stock disponible
        const product = await prisma.product.findUnique({
            where: { id: data.productId },
        });

        if (!product) {
            return { success: false, error: 'Producto no encontrado' };
        }

        if (product.stock < data.quantity) {
            return { success: false, error: `Stock insuficiente. Disponible: ${product.stock}` };
        }

        // Calcular totales
        const totalUsd = data.priceUsd * data.quantity;
        const totalVes = totalUsd * data.exchangeRate;

        // Crear venta y descontar stock en transacción
        const [sale] = await prisma.$transaction([
            prisma.sale.create({
                data: {
                    productId: data.productId,
                    quantity: data.quantity,
                    priceUsd: data.priceUsd,
                    totalUsd,
                    exchangeRate: data.exchangeRate,
                    totalVes,
                    notes: data.notes,
                },
            }),
            prisma.product.update({
                where: { id: data.productId },
                data: { stock: product.stock - data.quantity },
            }),
        ]);

        return { success: true, sale };
    } catch (error) {
        console.error('Error creating sale:', error);
        return { success: false, error: 'Error al registrar la venta' };
    }
}

export async function deleteSale(id: number): Promise<{ success: boolean; error?: string }> {
    try {
        // Obtener la venta para restaurar el stock
        const sale = await prisma.sale.findUnique({
            where: { id },
        });

        if (!sale) {
            return { success: false, error: 'Venta no encontrada' };
        }

        // Eliminar venta y restaurar stock en transacción
        await prisma.$transaction([
            prisma.sale.delete({
                where: { id },
            }),
            prisma.product.update({
                where: { id: sale.productId },
                data: { stock: { increment: sale.quantity } },
            }),
        ]);

        return { success: true };
    } catch (error) {
        console.error('Error deleting sale:', error);
        return { success: false, error: 'Error al eliminar la venta' };
    }
}

export async function getSalesStats(): Promise<{
    totalSales: number;
    totalRevenue: number;
    totalRevenueVes: number;
    todaySales: number;
}> {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [allSales, todaySalesData] = await Promise.all([
            prisma.sale.findMany(),
            prisma.sale.findMany({
                where: {
                    createdAt: { gte: today },
                },
            }),
        ]);

        const totalRevenue = allSales.reduce((sum, sale) => sum + sale.totalUsd, 0);
        const totalRevenueVes = allSales.reduce((sum, sale) => sum + sale.totalVes, 0);

        return {
            totalSales: allSales.length,
            totalRevenue,
            totalRevenueVes,
            todaySales: todaySalesData.length,
        };
    } catch (error) {
        console.error('Error getting stats:', error);
        return { totalSales: 0, totalRevenue: 0, totalRevenueVes: 0, todaySales: 0 };
    }
}
