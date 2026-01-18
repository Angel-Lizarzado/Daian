'use client';

import { useState } from 'react';
import { Plus, Trash2, X, Loader2, DollarSign, Package, Calendar, FileText } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { createSale, deleteSale, type SaleWithProduct } from '@/actions/sales';
import { type ProductWithCategory } from '@/actions/products';
import { useExchangeRate } from '@/context/ExchangeRateContext';
import { formatVes } from '@/lib/exchange-rate';

interface SaleFormData {
    productId: number;
    quantity: number;
    notes?: string;
}

interface AdminSalesSectionProps {
    sales: SaleWithProduct[];
    products: ProductWithCategory[];
    onRefresh: () => Promise<void>;
}

export default function AdminSalesSection({ sales, products, onRefresh }: AdminSalesSectionProps) {
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { rate } = useExchangeRate();

    const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<SaleFormData>({
        defaultValues: { quantity: 1 },
    });

    const selectedProductId = watch('productId');
    const selectedQuantity = watch('quantity') || 1;
    const selectedProduct = products.find(p => p.id === Number(selectedProductId));

    const openModal = () => {
        setError(null);
        reset({ productId: products[0]?.id, quantity: 1, notes: '' });
        setShowModal(true);
    };

    const onSubmit = async (data: SaleFormData) => {
        setSaving(true);
        setError(null);

        const product = products.find(p => p.id === Number(data.productId));
        if (!product) {
            setError('Producto no encontrado');
            setSaving(false);
            return;
        }

        const result = await createSale({
            productId: Number(data.productId),
            quantity: data.quantity,
            priceUsd: product.priceUsd,
            exchangeRate: rate,
            notes: data.notes,
        });

        if (result.success) {
            await onRefresh();
            setShowModal(false);
        } else {
            setError(result.error || 'Error al registrar la venta');
        }
        setSaving(false);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Eliminar esta venta? El stock se restaurará automáticamente.')) return;

        setDeleting(id);
        const result = await deleteSale(id);
        if (result.success) {
            await onRefresh();
        } else {
            alert(result.error || 'Error al eliminar');
        }
        setDeleting(null);
    };

    // Calcular estadísticas
    const totalRevenue = sales.reduce((sum, s) => sum + s.totalUsd, 0);
    const todaySales = sales.filter(s => {
        const today = new Date();
        const saleDate = new Date(s.createdAt);
        return saleDate.toDateString() === today.toDateString();
    }).length;

    return (
        <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                            <DollarSign className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-green-700">Ingresos Totales</p>
                            <p className="text-xl font-bold text-green-800">${totalRevenue.toFixed(2)}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                            <Package className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-blue-700">Total Ventas</p>
                            <p className="text-xl font-bold text-blue-800">{sales.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center">
                            <Calendar className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-purple-700">Ventas Hoy</p>
                            <p className="text-xl font-bold text-purple-800">{todaySales}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-bold text-text-main">Registro de Ventas</h3>
                    <p className="text-sm text-text-muted">Registra ventas y el stock se descuenta automáticamente</p>
                </div>
                <button
                    onClick={openModal}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-full font-bold text-sm shadow-lg transition-all"
                >
                    <Plus className="h-4 w-4" />
                    Registrar Venta
                </button>
            </div>

            {/* Sales Table */}
            <div className="bg-surface rounded-xl border border-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-background">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-bold text-text-muted uppercase">Fecha</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-text-muted uppercase">Producto</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-text-muted uppercase">Cant.</th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-text-muted uppercase">Total USD</th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-text-muted uppercase">Total Bs.</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-text-muted uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {sales.map((sale) => (
                                <tr key={sale.id} className="hover:bg-background/50 transition-colors">
                                    <td className="px-4 py-3 text-sm text-text-muted">
                                        {new Date(sale.createdAt).toLocaleDateString('es-VE', {
                                            day: '2-digit',
                                            month: 'short',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-10 h-10 rounded-lg bg-cover bg-center"
                                                style={{ backgroundImage: `url('${sale.product.image}')` }}
                                            />
                                            <div>
                                                <p className="text-sm font-medium text-text-main">{sale.product.name}</p>
                                                {sale.notes && <p className="text-xs text-text-muted">{sale.notes}</p>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-center text-sm font-medium text-text-main">
                                        {sale.quantity}
                                    </td>
                                    <td className="px-4 py-3 text-right text-sm font-bold text-green-600">
                                        ${sale.totalUsd.toFixed(2)}
                                    </td>
                                    <td className="px-4 py-3 text-right text-sm text-text-muted">
                                        Bs. {formatVes(sale.totalVes)}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <button
                                            onClick={() => handleDelete(sale.id)}
                                            disabled={deleting === sale.id}
                                            className="p-2 rounded-full hover:bg-red-50 transition-colors disabled:opacity-50"
                                        >
                                            {deleting === sale.id ? (
                                                <Loader2 className="h-4 w-4 text-red-500 animate-spin" />
                                            ) : (
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            )}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Empty State */}
                {sales.length === 0 && (
                    <div className="py-12 text-center">
                        <FileText className="h-12 w-12 mx-auto text-text-muted/30 mb-4" />
                        <p className="text-text-muted mb-4">No hay ventas registradas</p>
                        <button
                            onClick={openModal}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-full text-sm font-medium hover:bg-green-700 transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                            Registrar primera venta
                        </button>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl border border-border">
                        <div className="px-8 py-5 border-b border-border flex items-center justify-between">
                            <h3 className="text-xl font-black text-text-main">Registrar Venta</h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <X className="h-5 w-5 text-text-muted" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-5">
                            {/* Product Select */}
                            <div>
                                <label className="block text-sm font-bold text-text-main mb-1.5">Producto</label>
                                <select
                                    {...register('productId', { required: true })}
                                    className="w-full px-4 py-3 rounded-xl bg-background border-transparent focus:border-primary focus:bg-white focus:ring-0 transition-colors text-sm cursor-pointer"
                                >
                                    {products.map((product) => (
                                        <option key={product.id} value={product.id}>
                                            {product.name} - ${product.priceUsd.toFixed(2)} (Stock: {product.stock})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Quantity */}
                            <div>
                                <label className="block text-sm font-bold text-text-main mb-1.5">Cantidad</label>
                                <input
                                    type="number"
                                    min="1"
                                    max={selectedProduct?.stock || 1}
                                    {...register('quantity', { required: true, min: 1, valueAsNumber: true })}
                                    className="w-full px-4 py-3 rounded-xl bg-background border-transparent focus:border-primary focus:bg-white focus:ring-0 transition-colors text-sm"
                                />
                                {selectedProduct && (
                                    <p className="text-xs text-text-muted mt-1">
                                        Disponible: {selectedProduct.stock} unidades
                                    </p>
                                )}
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-bold text-text-main mb-1.5">Notas (opcional)</label>
                                <input
                                    {...register('notes')}
                                    placeholder="Ej. Cliente: María, Pago: Efectivo"
                                    className="w-full px-4 py-3 rounded-xl bg-background border-transparent focus:border-primary focus:bg-white focus:ring-0 transition-colors text-sm"
                                />
                            </div>

                            {/* Preview */}
                            {selectedProduct && (
                                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                                    <p className="text-sm text-green-700 font-medium">Resumen de venta:</p>
                                    <div className="mt-2 flex justify-between">
                                        <span className="text-sm text-green-600">{selectedQuantity}x {selectedProduct.name}</span>
                                        <span className="text-sm font-bold text-green-800">
                                            ${(selectedProduct.priceUsd * selectedQuantity).toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-xs text-green-600 mt-1">
                                        <span>En bolívares:</span>
                                        <span>Bs. {formatVes(selectedProduct.priceUsd * selectedQuantity * rate)}</span>
                                    </div>
                                </div>
                            )}

                            {/* Error */}
                            {error && (
                                <p className="text-red-500 text-sm text-center">{error}</p>
                            )}

                            {/* Buttons */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-3 px-4 rounded-full text-center text-sm font-bold text-text-muted hover:bg-gray-100 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 py-3 px-4 rounded-full text-center text-sm font-bold bg-green-600 text-white hover:bg-green-700 shadow-lg transition-all disabled:opacity-50 flex items-center justify-center"
                                >
                                    {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Registrar Venta'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
