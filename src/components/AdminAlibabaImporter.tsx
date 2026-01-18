'use client';

import { useState } from 'react';
import { Link2, Loader2, CheckCircle, AlertCircle, Download, X, Package } from 'lucide-react';
import { scrapeAlibabaProduct, importAlibabaProduct } from '@/actions/alibaba-scraper';

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
    const [importSuccess, setImportSuccess] = useState(false);

    const handleScrape = async () => {
        if (!url.trim()) {
            setError('Por favor ingresa una URL de Alibaba');
            return;
        }

        setLoading(true);
        setError(null);
        setScrapedData(null);
        setImportSuccess(false);

        const result = await scrapeAlibabaProduct(url);

        if (result.success && result.data) {
            setScrapedData(result.data);
            setCustomPrice(result.data.price?.toString() || '');
        } else {
            setError(result.error || 'Error desconocido');
        }

        setLoading(false);
    };

    const handleImport = async () => {
        if (!scrapedData || !selectedCategory) return;

        setLoading(true);
        setError(null);

        const result = await importAlibabaProduct(
            scrapedData,
            selectedCategory,
            customPrice ? parseFloat(customPrice) : undefined
        );

        if (result.success) {
            setImportSuccess(true);
            setScrapedData(null);
            setUrl('');
            setCustomPrice('');
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
                        Importar desde Alibaba
                        <span className="text-xs bg-orange-200 text-orange-700 px-2 py-0.5 rounded-full font-medium">BETA</span>
                    </h3>
                    <p className="text-sm text-text-muted">Pega la URL del producto y extrae los datos automáticamente</p>
                </div>
            </div>

            {/* Success Message */}
            {importSuccess && (
                <div className="mb-4 p-4 bg-green-100 border border-green-300 rounded-xl flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                        <p className="text-green-800 font-medium">¡Producto importado correctamente!</p>
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
                            placeholder="https://www.alibaba.com/product-detail/..."
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
                                Extraer Datos
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                    <div>
                        <p className="text-red-800 font-medium">Error al extraer datos</p>
                        <p className="text-red-600 text-sm">{error}</p>
                    </div>
                </div>
            )}

            {/* Scraped Data Preview */}
            {scrapedData && (
                <div className="mt-4 space-y-4">
                    <div className="bg-white rounded-xl border border-orange-200 p-4">
                        <h4 className="font-bold text-text-main mb-3">Datos Extraídos</h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Image Preview */}
                            {scrapedData.images.length > 0 && (
                                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                                    <img
                                        src={scrapedData.images[0]}
                                        alt={scrapedData.title}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x400?text=Sin+Imagen';
                                        }}
                                    />
                                </div>
                            )}

                            <div className="space-y-3">
                                {/* Title */}
                                <div>
                                    <label className="text-xs font-bold text-text-muted uppercase">Título</label>
                                    <p className="text-sm text-text-main font-medium">{scrapedData.title}</p>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="text-xs font-bold text-text-muted uppercase">Descripción</label>
                                    <p className="text-sm text-text-muted line-clamp-3">{scrapedData.description}</p>
                                </div>

                                {/* Price */}
                                <div>
                                    <label className="text-xs font-bold text-text-muted uppercase">Precio Detectado</label>
                                    <p className="text-lg font-bold text-green-600">
                                        {scrapedData.price > 0 ? `$${scrapedData.price.toFixed(2)}` : 'No detectado'}
                                    </p>
                                </div>

                                {/* Images count */}
                                <div>
                                    <label className="text-xs font-bold text-text-muted uppercase">Imágenes</label>
                                    <p className="text-sm text-text-muted">{scrapedData.images.length} encontradas</p>
                                </div>
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
                                <label className="block text-xs font-bold text-text-muted uppercase mb-1">Precio USD (puedes modificar)</label>
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
                                disabled={loading || !selectedCategory}
                                className="flex-1 py-3 px-4 rounded-xl text-center text-sm font-bold bg-green-600 text-white hover:bg-green-700 shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <>
                                        <CheckCircle className="h-5 w-5" />
                                        Importar Producto
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
