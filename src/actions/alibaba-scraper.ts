'use server';

import { prisma } from '@/lib/prisma';
import { createProduct } from './products';

interface ScrapedProduct {
    title: string;
    description: string;
    price: number;
    images: string[];
    attributes: Record<string, string>;
}

interface ScrapeResult {
    success: boolean;
    data?: ScrapedProduct;
    error?: string;
}

export async function scrapeAlibabaProduct(url: string): Promise<ScrapeResult> {
    try {
        // Validar URL
        if (!url.includes('alibaba.com')) {
            return { success: false, error: 'La URL debe ser de Alibaba.com' };
        }

        // Intentar hacer fetch de la página
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
            },
        });

        if (!response.ok) {
            return { success: false, error: `Error al acceder a la página: ${response.status}` };
        }

        const html = await response.text();

        // Extraer datos con regex (más confiable que parsear HTML completo)
        const titleMatch = html.match(/<h1[^>]*class="[^"]*title[^"]*"[^>]*>([^<]+)<\/h1>/i) ||
            html.match(/<title>([^<]+)<\/title>/i);

        const title = titleMatch
            ? titleMatch[1].replace(/\s*-\s*Alibaba\.com.*$/i, '').trim()
            : 'Producto sin nombre';

        // Buscar descripción
        const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i) ||
            html.match(/<meta\s+property="og:description"\s+content="([^"]+)"/i);
        const description = descMatch ? descMatch[1].trim() : '';

        // Buscar precio (puede variar mucho en la estructura)
        const priceMatch = html.match(/\$\s*([\d,]+\.?\d*)/);
        const price = priceMatch ? parseFloat(priceMatch[1].replace(',', '')) : 0;

        // Buscar imágenes (Open Graph y otras)
        const imageMatches = html.matchAll(/<meta\s+property="og:image"\s+content="([^"]+)"/gi);
        const images: string[] = [];
        for (const match of imageMatches) {
            if (match[1] && !images.includes(match[1])) {
                images.push(match[1]);
            }
        }

        // Buscar imágenes adicionales en el HTML
        const imgMatches = html.matchAll(/<img[^>]+src="(https:\/\/[^"]*alicdn[^"]+)"/gi);
        for (const match of imgMatches) {
            if (match[1] && !images.includes(match[1]) && images.length < 5) {
                images.push(match[1]);
            }
        }

        // Si no encontramos datos útiles
        if (!title || title === 'Producto sin nombre') {
            return {
                success: false,
                error: 'No se pudieron extraer datos del producto. Alibaba puede estar bloqueando la solicitud o la estructura de la página cambió.'
            };
        }

        return {
            success: true,
            data: {
                title,
                description: description || `Producto importado desde Alibaba: ${title}`,
                price,
                images,
                attributes: {},
            },
        };
    } catch (error) {
        console.error('Error scraping Alibaba:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error desconocido al extraer datos'
        };
    }
}

export async function importAlibabaProduct(
    scrapedData: ScrapedProduct,
    categoryId: number,
    customPrice?: number
): Promise<{ success: boolean; productId?: number; error?: string }> {
    try {
        const product = await createProduct({
            name: scrapedData.title,
            description: scrapedData.description,
            priceUsd: customPrice || scrapedData.price || 10,
            isOffer: false,
            stock: 10,
            image: scrapedData.images[0] || 'https://via.placeholder.com/400x500?text=Sin+Imagen',
            categoryId,
        });

        return { success: true, productId: product.id };
    } catch (error) {
        console.error('Error importing product:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error al importar el producto'
        };
    }
}
