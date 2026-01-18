'use server';

import { prisma } from '@/lib/prisma';

interface LogSaleInput {
    productId: number;
    productName: string;
    priceUsd: number;
    exchangeRate: number;
}

export async function logSaleAndGetWhatsAppUrl(input: LogSaleInput): Promise<string> {
    const { productName, priceUsd, exchangeRate } = input;
    const priceVesCalculated = priceUsd * exchangeRate;

    // Log the sale to database
    await prisma.saleLog.create({
        data: {
            productName,
            priceUsdAtMoment: priceUsd,
            exchangeRate,
            priceVesCalculated,
        },
    });

    // Create WhatsApp message
    const message = encodeURIComponent(
        `Hola Daian, quiero ${productName}. Precio: $${priceUsd.toFixed(2)} (Bs. ${priceVesCalculated.toFixed(2)}).`
    );

    // Return WhatsApp URL
    return `https://wa.me/584164974877?text=${message}`;
}
