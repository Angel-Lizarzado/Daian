'use client';

import { useState } from 'react';
import { Link2, Loader2, CheckCircle, AlertCircle, Download, X, Package, ExternalLink } from 'lucide-react';
import { scrapeProductFromUrl, importProductFromScrape } from '@/actions/alibaba-scraper';

interface Category {
    id: number;
    name: string;
}

interface ScrapedData {
    title: string;
    description: string;
    price: number;
    images: string[];
    attributes: Record<string, string>;
    source: 'aliexpress' | 'alibaba' | 'unknown';
}

interface AdminAlibabaImporterProps {
    categories: Category[];
    onProductImported: () => Promise<void>;
}

export default function AdminAlibabaImporter({ categories, onProductImported }: AdminAlibabaImporterProps) {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [scrapedData, setScrapedData] = useState<ScrapedData | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<number>(categories[0]?.id || 0);
    const [customPrice, setCustomPrice] = useState<string>('');
    const [customName, setCustomName] = useState<string>('');
    const [importSuccess, setImportSuccess] = useState(false);

    const handleScrape = async () => {
        if (!url.trim()) {
            setError('Por favor ingresa una URL');
            return;
        }

        setLoading(true);
        setError(null);
        setScrapedData(null);
        setImportSuccess(false);

        const result = await scrapeProductFromUrl(url);

        if (result.success && result.data) {
            setScrapedData(result.data);
            setCustomPrice(result.data.price?.toString() || '');
            setCustomName(result.data.title || '');
        } else {
            setError(result.error || 'Error desconocido');
        }

        setLoading(false);
    };

    const handleImport = async () => {
        if (!scrapedData || !selectedCategory) return;

        setLoading(true);
        setError(null);

        const result = await importProductFromScrape(
            scrapedData,
            selectedCategory,
            customPrice ? parseFloat(customPrice) : undefined,
            customName || undefined
        );

        if (result.success) {
            setImportSuccess(true);
            setScrapedData(null);
            setUrl('');
            setCustomPrice('');
            setCustomName('');
            await onProductImported();
        } else {
            setError(result.error || 'Error al importar');
        }

        setLoading(false);
    };

    const handleReset = () => {
        setUrl('');
        setScrapedData(null);
        setError(null);
        setImportSuccess(false);
        setCustomPrice('');
        setCustomName('');
    };

    return (
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border border-orange-200 p-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
                    <Download className="h-5 w-5 text-white" />
                </div>
                <div>
                    <h3 className="font-bold text-text-main flex items-center gap-2">
                        Importar Producto
                        <span className="text-xs bg-orange-200 text-orange-700 px-2 py-0.5 rounded-full font-medium">BETA</span>
                    </h3>
                    <p className="text-sm text-text-muted">Pega URL de AliExpress o Alibaba</p>
                </div>
            </div>

            {/* Success Message */}
            {importSuccess && (
                <div className="mb-4 p-4 bg-green-100 border border-green-300 rounded-xl flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                        <p className="text-green-800 font-medium">¡Producto importado!</p>
                        <p className="text-green-600 text-sm">Ya puedes verlo en el inventario</p>
                    </div>
                    <button onClick={handleReset} className="ml-auto text-green-600 hover:text-green-800">
                        <X className="h-5 w-5" />
                    </button>
                </div>
            )}

            {/* URL Input */}
            {!scrapedData && !importSuccess && (
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="flex-1 relative">
                        <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted" />
                        <input
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://www.aliexpress.com/item/... o https://www.alibaba.com/..."
                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-orange-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                        />
                    </div>
                    <button
                        onClick={handleScrape}
                        disabled={loading || !url.trim()}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-sm shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Extrayendo...
                            </>
                        ) : (
                            <>
                                <Package className="h-5 w-5" />
                                Extraer
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                    <div className="flex-1">
                        <p className="text-red-800 font-medium">Error al extraer datos</p>
                        <p className="text-red-600 text-sm">{error}</p>
                        <p className="text-red-500 text-xs mt-2">
                            💡 Tip: Prueba abriendo el producto en una nueva pestaña para verificar que la URL es correcta.
                        </p>
                    </div>
                </div>
            )}

            {/* Scraped Data Preview */}
            {scrapedData && (
                <div className="mt-4 space-y-4">
                    <div className="bg-white rounded-xl border border-orange-200 p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="font-bold text-text-main">Datos Extraídos</h4>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${scrapedData.source === 'aliexpress'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-orange-100 text-orange-700'
                                }`}>
                                {scrapedData.source === 'aliexpress' ? 'AliExpress' : 'Alibaba'}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Image Preview */}
                            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 relative">
                                {scrapedData.images.length > 0 ? (
                                    <img
                                        src={scrapedData.images[0]}
                                        alt={scrapedData.title}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x400?text=Sin+Imagen';
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-text-muted">
                                        <Package className="h-16 w-16 opacity-30" />
                                    </div>
                                )}
                                {scrapedData.images.length > 1 && (
                                    <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                                        +{scrapedData.images.length - 1} fotos
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3">
                                {/* Editable Title */}
                                <div>
                                    <label className="text-xs font-bold text-text-muted uppercase">Nombre del producto</label>
                                    <input
                                        type="text"
                                        value={customName}
                                        onChange={(e) => setCustomName(e.target.value)}
                                        className="w-full mt-1 px-3 py-2 rounded-lg bg-background border-none text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="text-xs font-bold text-text-muted uppercase">Descripción</label>
                                    <p className="text-sm text-text-muted line-clamp-3 mt-1">{scrapedData.description}</p>
                                </div>

                                {/* Price */}
                                <div>
                                    <label className="text-xs font-bold text-text-muted uppercase">Precio detectado</label>
                                    <p className="text-lg font-bold text-green-600">
                                        {scrapedData.price > 0 ? `$${scrapedData.price.toFixed(2)}` : 'No detectado'}
                                    </p>
                                </div>

                                {/* Source Link */}
                                <a
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-xs text-orange-600 hover:text-orange-800"
                                >
                                    <ExternalLink className="h-3 w-3" />
                                    Ver original
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Import Options */}
                    <div className="bg-white rounded-xl border border-orange-200 p-4">
                        <h4 className="font-bold text-text-main mb-3">Opciones de Importación</h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Category */}
                            <div>
                                <label className="block text-xs font-bold text-text-muted uppercase mb-1">Categoría</label>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(Number(e.target.value))}
                                    className="w-full px-4 py-2.5 rounded-lg bg-background border-none text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
                                >
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Custom Price */}
                            <div>
                                <label className="block text-xs font-bold text-text-muted uppercase mb-1">Precio USD (tu precio de venta)</label>
                                <input
                                    type="number"
                                    value={customPrice}
                                    onChange={(e) => setCustomPrice(e.target.value)}
                                    placeholder="0.00"
                                    step="0.01"
                                    min="0"
                                    className="w-full px-4 py-2.5 rounded-lg bg-background border-none text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={handleReset}
                                className="flex-1 py-3 px-4 rounded-xl text-center text-sm font-bold text-text-muted hover:bg-gray-100 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleImport}
                                disabled={loading || !selectedCategory || !customPrice}
                                className="flex-1 py-3 px-4 rounded-xl text-center text-sm font-bold bg-green-600 text-white hover:bg-green-700 shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <>
                                        <CheckCircle className="h-5 w-5" />
                                        Importar
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
