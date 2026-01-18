'use client';

import { useState } from 'react';
import { Plus, Edit, Trash2, X, Loader2, Tag, Package } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { createCategory, deleteCategory, updateCategory } from '@/actions/categories';

interface Category {
    id: number;
    name: string;
    _count?: { products: number };
}

interface CategoryFormData {
    name: string;
}

interface AdminCategoriesSectionProps {
    categories: Category[];
    onRefresh: () => Promise<void>;
}

export default function AdminCategoriesSection({ categories, onRefresh }: AdminCategoriesSectionProps) {
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState<number | null>(null);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<CategoryFormData>();

    const openCreateModal = () => {
        setEditingCategory(null);
        reset({ name: '' });
        setShowModal(true);
    };

    const openEditModal = (category: Category) => {
        setEditingCategory(category);
        reset({ name: category.name });
        setShowModal(true);
    };

    const onSubmit = async (data: CategoryFormData) => {
        setSaving(true);
        try {
            if (editingCategory) {
                await updateCategory(editingCategory.id, data.name);
            } else {
                await createCategory(data.name);
            }
            await onRefresh();
            setShowModal(false);
        } catch (error) {
            console.error('Error saving category:', error);
        }
        setSaving(false);
    };

    const handleDelete = async (id: number, productCount: number) => {
        if (productCount > 0) {
            alert(`No se puede eliminar. Esta categoría tiene ${productCount} productos asociados.`);
            return;
        }

        if (!confirm('¿Estás seguro de eliminar esta categoría?')) return;

        setDeleting(id);
        try {
            await deleteCategory(id);
            await onRefresh();
        } catch (error) {
            console.error('Error deleting category:', error);
            alert('Error al eliminar la categoría');
        }
        setDeleting(null);
    };

    return (
        <>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-bold text-text-main">Categorías</h3>
                    <p className="text-sm text-text-muted">Organiza tus productos en categorías</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-full font-bold text-sm shadow-lg transition-all"
                >
                    <Plus className="h-4 w-4" />
                    Nueva Categoría
                </button>
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                    <div
                        key={category.id}
                        className="bg-surface rounded-xl border border-border p-5 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Tag className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-text-main">{category.name}</h4>
                                    <p className="text-sm text-text-muted flex items-center gap-1">
                                        <Package className="h-3 w-3" />
                                        {category._count?.products || 0} productos
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => openEditModal(category)}
                                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                                >
                                    <Edit className="h-4 w-4 text-primary" />
                                </button>
                                <button
                                    onClick={() => handleDelete(category.id, category._count?.products || 0)}
                                    disabled={deleting === category.id}
                                    className="p-2 rounded-full hover:bg-red-50 transition-colors disabled:opacity-50"
                                >
                                    {deleting === category.id ? (
                                        <Loader2 className="h-4 w-4 text-red-500 animate-spin" />
                                    ) : (
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Empty State */}
                {categories.length === 0 && (
                    <div className="col-span-full py-12 text-center">
                        <Tag className="h-12 w-12 mx-auto text-text-muted/30 mb-4" />
                        <p className="text-text-muted mb-4">No hay categorías creadas</p>
                        <button
                            onClick={openCreateModal}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-full text-sm font-medium hover:bg-primary-hover transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                            Crear primera categoría
                        </button>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl border border-border">
                        <div className="px-8 py-5 border-b border-border flex items-center justify-between">
                            <h3 className="text-xl font-black text-text-main">
                                {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <X className="h-5 w-5 text-text-muted" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="p-8">
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-text-main mb-1.5">
                                    Nombre de la Categoría
                                </label>
                                <input
                                    {...register('name', { required: 'El nombre es requerido' })}
                                    placeholder="Ej. Vestidos, Accesorios..."
                                    className="w-full px-4 py-3 rounded-xl bg-background border-transparent focus:border-primary focus:bg-white focus:ring-0 transition-colors text-sm"
                                />
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                            </div>

                            <div className="flex gap-3">
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
                                    className="flex-1 py-3 px-4 rounded-full text-center text-sm font-bold bg-primary text-white hover:bg-primary-hover shadow-lg transition-all disabled:opacity-50 flex items-center justify-center"
                                >
                                    {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Guardar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
