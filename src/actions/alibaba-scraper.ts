'use server';

import { createProduct } from './products';

interface ScrapedProduct {
    title: string;
    description: string;
    details: string;
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

        // Variables para almacenar datos
        let title = '';
        let description = '';
        let details = '';
        let price = 0;
        const images: string[] = [];
        const attributes: Record<string, string> = {};

        // === EXTRAER TÍTULO ===
        // Método 1: Meta Open Graph
        const ogTitleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i);
        if (ogTitleMatch) {
            title = ogTitleMatch[1]
                .replace(/-\s*AliExpress.*$/i, '')
                .replace(/-\s*Alibaba.*$/i, '')
                .replace(/\s*\|\s*AliExpress.*$/i, '')
                .trim();
        }

        // Método 2: Title tag
        if (!title) {
            const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
            if (titleMatch) {
                title = titleMatch[1]
                    .replace(/-\s*AliExpress.*$/i, '')
                    .replace(/-\s*Alibaba.*$/i, '')
                    .replace(/\|.*$/, '')
                    .trim();
            }
        }

        // Método 3: JSON estructurado - subject
        if (!title || title.length < 10) {
            const subjectMatch = html.match(/"subject":\s*"([^"]+)"/);
            if (subjectMatch) {
                title = subjectMatch[1].trim();
            }
        }

        // === EXTRAER DESCRIPCIÓN ===
        // AliExpress guarda la descripción en JSON, buscar múltiples patrones

        // Patrón 1: description en JSON
        const descJsonPatterns = [
            /"description":\s*"([^"]{50,})"/i,
            /"productDescription":\s*"([^"]{50,})"/i,
            /"itemDescription":\s*"([^"]{50,})"/i,
        ];

        for (const pattern of descJsonPatterns) {
            const match = html.match(pattern);
            if (match && match[1] && !match[1].includes('Smarter Shopping')) {
                description = match[1]
                    .replace(/\\n/g, '\n')
                    .replace(/\\r/g, '')
                    .replace(/\\"/g, '"')
                    .trim();
                break;
            }
        }

        // Patrón 2: Buscar en HTML con clases de descripción
        if (!description || description.includes('Smarter Shopping')) {
            const descHtmlPatterns = [
                /<div[^>]*class="[^"]*product-description[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
                /<div[^>]*class="[^"]*description-content[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
                /<div[^>]*id="[^"]*description[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
            ];

            for (const pattern of descHtmlPatterns) {
                const matches = html.match(pattern);
                if (matches) {
                    const cleanDesc = matches[0]
                        .replace(/<[^>]+>/g, ' ')
                        .replace(/\s+/g, ' ')
                        .trim();
                    if (cleanDesc.length > 30 && !cleanDesc.includes('Smarter Shopping')) {
                        description = cleanDesc.substring(0, 500);
                        break;
                    }
                }
            }
        }

        // Patrón 3: Título como descripción si no hay otra
        if (!description || description.includes('Smarter Shopping')) {
            description = title ? `${title}. Producto importado de ${source === 'aliexpress' ? 'AliExpress' : 'Alibaba'}.` : '';
        }

        // === EXTRAER DETALLES/ESPECIFICACIONES ===
        // Buscar atributos del producto en JSON
        const attrPatterns = [
            /"attrName":\s*"([^"]+)",\s*"attrValue":\s*"([^"]+)"/gi,
            /"name":\s*"([^"]{3,30})",\s*"value":\s*"([^"]+)"/gi,
        ];

        for (const pattern of attrPatterns) {
            const matches = html.matchAll(pattern);
            for (const match of matches) {
                if (Object.keys(attributes).length < 15) {
                    const key = match[1].trim();
                    const value = match[2].trim();
                    // Filtrar atributos irrelevantes
                    if (!key.includes('http') && !value.includes('http') &&
                        key.length > 1 && value.length > 0 &&
                        !key.toLowerCase().includes('click') &&
                        !key.toLowerCase().includes('script')) {
                        attributes[key] = value;
                    }
                }
            }
        }

        // Buscar especificaciones en skuPropertyList
        const specJsonMatch = html.match(/"skuPropertyList":\s*(\[[^\]]+\])/);
        if (specJsonMatch) {
            try {
                const specs = JSON.parse(specJsonMatch[1]);
                for (const spec of specs) {
                    if (spec.skuPropertyName && spec.skuPropertyValues && Array.isArray(spec.skuPropertyValues)) {
                        const values = spec.skuPropertyValues
                            .map((v: any) => v.propertyValueDisplayName || v.skuPropertyValueName)
                            .filter(Boolean)
                            .join(', ');
                        if (values) {
                            attributes[spec.skuPropertyName] = values;
                        }
                    }
                }
            } catch (e) {
                // Ignorar errores de parsing
            }
        }

        // Convertir atributos a detalles
        if (Object.keys(attributes).length > 0) {
            details = Object.entries(attributes)
                .map(([key, value]) => `• ${key}: ${value}`)
                .join('\n');
        }

        // === EXTRAER PRECIO ===
        const pricePatterns = [
            /"formatedActivityPrice":\s*"[^"]*\$?\s*([\d.]+)/i,
            /"formatedPrice":\s*"[^"]*\$?\s*([\d.]+)/i,
            /"minPrice":\s*"?([\d.]+)/i,
            /"price":\s*"?([\d.]+)/i,
            /\$\s*([\d,]+\.?\d*)/,
            /USD\s*([\d,]+\.?\d*)/i,
        ];

        for (const pattern of pricePatterns) {
            const match = html.match(pattern);
            if (match) {
                const priceStr = match[1].replace(',', '');
                const parsed = parseFloat(priceStr);
                if (parsed > 0 && parsed < 10000) {
                    price = parsed;
                    break;
                }
            }
        }

        // === EXTRAER IMÁGENES ===
        // 1. Open Graph images
        const ogImageMatches = html.matchAll(/<meta\s+property="og:image(?::url)?"\s+content="([^"]+)"/gi);
        for (const match of ogImageMatches) {
            if (match[1] && !images.includes(match[1]) && images.length < 15) {
                images.push(match[1]);
            }
        }

        // 2. Buscar en JSON estructurado - imagePathList
        const jsonImageMatch = html.match(/"imagePathList":\s*\[([^\]]+)\]/);
        if (jsonImageMatch) {
            const imgList = jsonImageMatch[1].match(/"([^"]+)"/g);
            if (imgList) {
                for (const img of imgList) {
                    const cleanImg = img.replace(/"/g, '').replace(/\\/g, '');
                    if (cleanImg.startsWith('http') && !images.includes(cleanImg) && images.length < 15) {
                        images.push(cleanImg);
                    }
                }
            }
        }

        // 3. Buscar galleryUrls en AliExpress
        const galleryMatch = html.match(/"galleryUrls":\s*\[([^\]]+)\]/);
        if (galleryMatch) {
            const imgList = galleryMatch[1].match(/"([^"]+)"/g);
            if (imgList) {
                for (const img of imgList) {
                    const cleanImg = img.replace(/"/g, '').replace(/\\/g, '');
                    if (cleanImg.startsWith('http') && !images.includes(cleanImg) && images.length < 15) {
                        images.push(cleanImg);
                    }
                }
            }
        }

        // 4. Buscar imágenes de CDN de AliExpress/Alibaba con alta resolución
        const cdnImageMatches = html.matchAll(/(https?:\/\/[^"'\s<>]+(?:alicdn|ae01|cbu01)[^"'\s<>]+\.(?:jpg|jpeg|png|webp))/gi);
        for (const match of cdnImageMatches) {
            let imgUrl = match[1];
            // Filtrar imágenes pequeñas y avatares
            if (!imgUrl.includes('avatar') &&
                !imgUrl.includes('icon') &&
                !imgUrl.includes('50x50') &&
                !imgUrl.includes('100x100') &&
                !imgUrl.includes('_.webp') &&
                !imgUrl.includes('_80x80') &&
                !images.includes(imgUrl) &&
                images.length < 15) {
                images.push(imgUrl);
            }
        }

        // Si no hay título, falló
        if (!title || title.length < 5) {
            return {
                success: false,
                error: `No se pudo extraer información. La página puede requerir verificación humana.`
            };
        }

        return {
            success: true,
            data: {
                title,
                description,
                details,
                price,
                images,
                attributes,
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
    customName?: string,
    customDescription?: string
): Promise<{ success: boolean; productId?: number; error?: string }> {
    try {
        const product = await createProduct({
            name: customName || scrapedData.title,
            description: customDescription || scrapedData.description,
            details: scrapedData.details || null,
            priceUsd: customPrice || scrapedData.price || 10,
            isOffer: false,
            stock: 10,
            image: scrapedData.images[0] || 'https://via.placeholder.com/400x500?text=Sin+Imagen',
            images: scrapedData.images,
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
