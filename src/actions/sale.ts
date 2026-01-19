'use server';

interface LogSaleInput {
    productId: number;
    productName: string;
    priceUsd: number;
    exchangeRate: number;
}

export async function logSaleAndGetWhatsAppUrl(input: LogSaleInput): Promise<string> {
    const { productName, priceUsd, exchangeRate } = input;
    const priceVesCalculated = priceUsd * exchangeRate;

    // Nota: El registro formal de ventas ahora se hace desde /admin -> Ventas
    // Este endpoint solo genera la URL de WhatsApp para el cliente

    // Create WhatsApp message
    const message = encodeURIComponent(
        `Hola Daian, quiero ${productName}. Precio: $${priceUsd.toFixed(2)} (Bs. ${priceVesCalculated.toFixed(2)}).`
    );

    // Return WhatsApp URL
    return `https://wa.me/573003344963?text=${message}`;
}
