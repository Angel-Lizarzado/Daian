'use server';

import { createProduct } from './products';

interface ScrapedProduct {
    title: string;
    description: string;
    details: string;
    price: number;
    images: string[];
    videos: string[];
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

        // Usar ScraperAPI si está disponible (producción)
        const scraperApiKey = process.env.SCRAPER_API_KEY;
        let fetchUrl = url;

        if (scraperApiKey) {
            // Usar ScraperAPI como proxy para evitar bloqueos
            fetchUrl = `https://api.scraperapi.com?api_key=${scraperApiKey}&url=${encodeURIComponent(url)}&render=true&country_code=es`;
        }

        // Hacer fetch de la página
        const response = await fetch(fetchUrl, {
            headers: scraperApiKey ? {} : {
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
        const videos: string[] = [];
        const attributes: Record<string, string> = {};

        // ... (rest of the code until images extraction)

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

        // ... (rest of extraction logic)

        // === EXTRAER IMÁGENES ===
        // Prioridad: JSON estructurado (es lo más preciso)

        // 1. Buscar en JSON estructurado - imagePathList
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

        // 2. Buscar galleryUrls en AliExpress (otra variante común)
        if (images.length < 3) {
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
        }

        // 3. Open Graph images (Backup si no hay JSON)
        if (images.length === 0) {
            const ogImageMatches = html.matchAll(/<meta\s+property="og:image(?::url)?"\s+content="([^"]+)"/gi);
            for (const match of ogImageMatches) {
                if (match[1] && !images.includes(match[1]) && images.length < 15) {
                    images.push(match[1]);
                }
            }
        }

        // 4. Buscar imágenes de CDN (Solo si estamos desesperados o tenemos muy pocas)
        if (images.length < 3) {
            const cdnImageMatches = html.matchAll(/(https?:\/\/[^"'\s<>]+(?:alicdn|ae01|cbu01)[^"'\s<>]+\.(?:jpg|jpeg|png|webp))/gi);
            for (const match of cdnImageMatches) {
                let imgUrl = match[1];
                // Filtro estricto para evitar basura
                if (!imgUrl.includes('avatar') &&
                    !imgUrl.includes('icon') &&
                    !imgUrl.includes('logo') &&
                    !imgUrl.includes('banner') &&
                    !imgUrl.includes('search') &&
                    !imgUrl.includes('brand') &&
                    !imgUrl.includes('50x50') &&
                    !imgUrl.includes('100x100') &&
                    !imgUrl.includes('_.webp') &&
                    !imgUrl.includes('_80x80') &&
                    !imgUrl.includes('.gif') &&
                    !images.includes(imgUrl) &&
                    images.length < 15) {
                    images.push(imgUrl);
                }
            }
        }

        // === EXTRAER VIDEOS ===
        // 1. Buscar en JSON estructurado (videoUrl, videoUid)
        // AliExpress suele tener el video en un videoModule
        const videoModuleMatch = html.match(/"videoModule":\s*({[^}]+})/);
        if (videoModuleMatch) {
            try {
                const videoData = JSON.parse(videoModuleMatch[1]);
                if (videoData.videoUrl && !videos.includes(videoData.videoUrl)) {
                    videos.push(videoData.videoUrl);
                }
            } catch (e) { }
        }

        // 2. Buscar videoUid y construir URL (para algunos casos de AliExpress)
        const videoIdMatch = html.match(/"videoId":\s*"(\d+)"/);
        const videoUidMatch = html.match(/"videoUid":\s*"([^"]+)"/);
        if (videoIdMatch && videoUidMatch) {
            // A veces la URL se puede construir o está en otro campo, pero intentaremos buscar mp4 directos primero
        }

        // 3. Búsqueda general de .mp4 en alicdn
        const mp4Matches = html.matchAll(/https?:\/\/[^"']+\.mp4/gi);
        for (const match of mp4Matches) {
            if (!videos.includes(match[0]) && videos.length < 5) {
                videos.push(match[0]);
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
                videos,
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
            videos: scrapedData.videos,
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
