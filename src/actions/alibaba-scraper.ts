'use server';

import { createProduct } from './products';

interface ScrapedProduct {
    title: string;
    description: string;
    price: number;
    images: string[];
    attributes: Record<string, string>;
    source: 'aliexpress' | 'alibaba' | 'unknown';
}

interface ScrapeResult {
    success: boolean;
    data?: ScrapedProduct;
    error?: string;
}

export async function scrapeProductFromUrl(url: string): Promise<ScrapeResult> {
    try {
        // Detectar la fuente
        let source: 'aliexpress' | 'alibaba' | 'unknown' = 'unknown';
        if (url.includes('aliexpress.com')) {
            source = 'aliexpress';
        } else if (url.includes('alibaba.com')) {
            source = 'alibaba';
        } else {
            return { success: false, error: 'URL no soportada. Usa AliExpress o Alibaba.' };
        }

        // Hacer fetch de la página
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
                'Cache-Control': 'no-cache',
            },
        });

        if (!response.ok) {
            return { success: false, error: `Error al acceder: ${response.status}` };
        }

        const html = await response.text();

        // Intentar extraer datos según la fuente
        let title = '';
        let description = '';
        let price = 0;
        const images: string[] = [];

        // === EXTRAER TÍTULO ===
        // Método 1: Meta Open Graph
        const ogTitleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i);
        if (ogTitleMatch) {
            title = ogTitleMatch[1].replace(/-\s*AliExpress.*$/i, '').replace(/-\s*Alibaba.*$/i, '').trim();
        }

        // Método 2: Title tag
        if (!title) {
            const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
            if (titleMatch) {
                title = titleMatch[1].replace(/-\s*AliExpress.*$/i, '').replace(/-\s*Alibaba.*$/i, '').replace(/\|.*$/, '').trim();
            }
        }

        // === EXTRAER DESCRIPCIÓN ===
        const descMatch = html.match(/<meta\s+(?:name|property)="(?:description|og:description)"\s+content="([^"]+)"/i);
        if (descMatch) {
            description = descMatch[1].trim();
        }

        // === EXTRAER PRECIO ===
        // Buscar precio en varios formatos
        const pricePatterns = [
            /\$\s*([\d,]+\.?\d*)/,
            /USD\s*([\d,]+\.?\d*)/i,
            /price['":\s]*['"$]*\s*([\d,]+\.?\d*)/i,
            /"price":\s*"?\$?([\d,]+\.?\d*)/i,
        ];

        for (const pattern of pricePatterns) {
            const match = html.match(pattern);
            if (match) {
                const priceStr = match[1].replace(',', '');
                const parsed = parseFloat(priceStr);
                if (parsed > 0 && parsed < 10000) { // Rango razonable
                    price = parsed;
                    break;
                }
            }
        }

        // === EXTRAER IMÁGENES ===
        // Open Graph image
        const ogImageMatches = html.matchAll(/<meta\s+property="og:image(?::url)?"\s+content="([^"]+)"/gi);
        for (const match of ogImageMatches) {
            if (match[1] && !images.includes(match[1]) && images.length < 5) {
                images.push(match[1]);
            }
        }

        // Buscar en JSON estructurado
        const jsonImageMatch = html.match(/"imagePathList":\s*\[([^\]]+)\]/);
        if (jsonImageMatch) {
            const imgList = jsonImageMatch[1].match(/"([^"]+)"/g);
            if (imgList) {
                for (const img of imgList) {
                    const cleanImg = img.replace(/"/g, '');
                    if (cleanImg.startsWith('http') && !images.includes(cleanImg) && images.length < 5) {
                        images.push(cleanImg);
                    }
                }
            }
        }

        // Buscar imágenes de CDN de AliExpress/Alibaba
        const cdnImageMatches = html.matchAll(/(https?:\/\/[^"'\s]+(?:alicdn|ae01|cbu01)[^"'\s]+\.(?:jpg|jpeg|png|webp))/gi);
        for (const match of cdnImageMatches) {
            if (match[1] && !images.includes(match[1]) && images.length < 5) {
                // Limpiar la URL y asegurar tamaño grande
                let imgUrl = match[1].split('_')[0]; // Remover sufijos de tamaño
                if (!imgUrl.includes('avatar') && !imgUrl.includes('icon')) {
                    images.push(match[1]);
                }
            }
        }

        // Si no hay título, falló
        if (!title || title.length < 5) {
            return {
                success: false,
                error: `No se pudo extraer información del producto. La página puede estar bloqueando solicitudes automáticas o requiere verificación humana.`
            };
        }

        return {
            success: true,
            data: {
                title,
                description: description || `Producto importado desde ${source === 'aliexpress' ? 'AliExpress' : 'Alibaba'}: ${title}`,
                price,
                images: images.length > 0 ? images : [],
                attributes: {},
                source,
            },
        };

    } catch (error) {
        console.error('Error scraping product:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error desconocido'
        };
    }
}

export async function importProductFromScrape(
    scrapedData: ScrapedProduct,
    categoryId: number,
    customPrice?: number,
    customName?: string
): Promise<{ success: boolean; productId?: number; error?: string }> {
    try {
        const product = await createProduct({
            name: customName || scrapedData.title,
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
            error: error instanceof Error ? error.message : 'Error al importar'
        };
    }
}
