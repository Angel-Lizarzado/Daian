'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Store, Package, MessageCircle, BarChart3, Settings,
    Plus, Search, Edit, Trash2, X, Loader2, Upload, Image as ImageIcon, Tag, DollarSign,
    ChevronLeft, ChevronRight
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { getProducts, createProduct, updateProduct, deleteProduct, type ProductWithCategory } from '@/actions/products';
import { getCategories, getCategoriesWithCount, createCategory, type CategoryWithCount } from '@/actions/categories';
import { getAllHeroSlides } from '@/actions/hero-slides';
import { getSales, type SaleWithProduct } from '@/actions/sales';
import { useExchangeRate } from '@/context/ExchangeRateContext';
import { formatVes } from '@/lib/exchange-rate';
import AdminSlidesSection from '@/components/AdminSlidesSection';
import AdminCategoriesSection from '@/components/AdminCategoriesSection';
import AdminSalesSection from '@/components/AdminSalesSection';
import ImageUploader from '@/components/ImageUploader';
import VideoUploader from '@/components/VideoUploader';
import AdminAlibabaImporter from '@/components/AdminAlibabaImporter';

interface Category {
    id: number;
    name: string;
}

interface ProductFormData {
    name: string;
    description: string;
    priceUsd: number;
    oldPriceUsd?: number;
    isOffer: boolean;
    stock: number;
    image: string;
    images?: string[];
    categoryId: number;
}

interface HeroSlide {
    id: number;
    title: string;
    subtitle: string;
    buttonText: string;
    buttonLink: string;
    image: string;
    badge: string | null;
    isActive: boolean;
    order: number;
}

export default function AdminDashboard() {
    const router = useRouter();
    const { rate } = useExchangeRate();
    const [products, setProducts] = useState<ProductWithCategory[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [categoriesWithCount, setCategoriesWithCount] = useState<CategoryWithCount[]>([]);
    const [slides, setSlides] = useState<HeroSlide[]>([]);
    const [sales, setSales] = useState<SaleWithProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<ProductWithCategory | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [saving, setSaving] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [activeTab, setActiveTab] = useState<'products' | 'slides' | 'categories' | 'sales'>('products');
    const [editableMedia, setEditableMedia] = useState<string[]>([]);

    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<ProductFormData>();
    const priceUsd = watch('priceUsd');

    useEffect(() => {
        // Check authentication
        const isAuthenticated = document.cookie.includes('admin_session=authenticated');
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
        loadData();
    }, [router]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [productsData, categoriesData, categoriesCountData, slidesData, salesData] = await Promise.all([
                getProducts().catch(() => [] as ProductWithCategory[]),
                getCategories().catch(() => [] as Category[]),
                getCategoriesWithCount().catch(() => [] as CategoryWithCount[]),
                getAllHeroSlides().catch(() => [] as HeroSlide[]),
                getSales().catch(() => [] as SaleWithProduct[])
            ]);
            setProducts(productsData);
            setCategories(categoriesData);
            setCategoriesWithCount(categoriesCountData);
            setSlides(slidesData);
            setSales(salesData);
        } catch (error) {
            console.error('Error loading data:', error);
        }
        setLoading(false);
    };

    const openCreateModal = () => {
        setEditingProduct(null);
        setEditableMedia([]);
        reset({
            name: '',
            description: '',
            priceUsd: 0,
            oldPriceUsd: undefined,
            isOffer: false,
            stock: 0,
            image: '',
            categoryId: categories[0]?.id || 0,
        });
        setShowModal(true);
    };

    const openEditModal = (product: ProductWithCategory) => {
        setEditingProduct(product);
        // Merge existing images and videos into unified media list for sorting
        // Note: videos field exists but we want to unify everything into 'images' on save
        setEditableMedia([
            ...(product.images || []),
            ...(product.videos || [])
        ]);
        reset({
            name: product.name,
            description: product.description,
            priceUsd: product.priceUsd,
            oldPriceUsd: product.oldPriceUsd || undefined,
            isOffer: product.isOffer,
            stock: product.stock,
            image: product.image,
            categoryId: product.categoryId,
        });
        setShowModal(true);
    };

    const addMedia = (url: string) => {
        setEditableMedia(prev => [...prev, url]);
    };

    const removeMedia = (index: number) => {
        setEditableMedia(prev => prev.filter((_, i) => i !== index));
    };

    const moveMedia = (index: number, direction: 'left' | 'right') => {
        const newMedia = [...editableMedia];
        if (direction === 'left' && index > 0) {
            [newMedia[index - 1], newMedia[index]] = [newMedia[index], newMedia[index - 1]];
        } else if (direction === 'right' && index < newMedia.length - 1) {
            [newMedia[index + 1], newMedia[index]] = [newMedia[index], newMedia[index + 1]];
        }
        setEditableMedia(newMedia);
    };

    const onSubmit = async (data: ProductFormData) => {
        setSaving(true);
        try {
            const productData = {
                ...data,
                // Save ALL media to 'images' to preserve order. 
                // ProductGallery now auto-detects types.
                images: editableMedia,
                videos: [], // Clear legacy video field
            };
            if (editingProduct) {
                await updateProduct(editingProduct.id, productData);
            } else {
                await createProduct(productData);
            }
            await loadData();
            setShowModal(false);
        } catch (error) {
            console.error('Error saving product:', error);
        }
        setSaving(false);
    };

    const handleDelete = async (id: number) => {
        if (confirm('¿Estás seguro de eliminar este producto?')) {
            await deleteProduct(id);
            await loadData();
        }
    };

    const handleCreateCategory = async () => {
        if (newCategoryName.trim()) {
            await createCategory(newCategoryName.trim());
            setNewCategoryName('');
            await loadData();
        }
    };

    const handleLogout = () => {
        document.cookie = 'admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        router.push('/login');
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex h-screen w-full bg-background">
            {/* Sidebar */}
            <aside className="w-64 flex-shrink-0 flex flex-col bg-surface border-r border-border hidden md:flex">
                <div className="p-6 pb-2">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/20 p-2 rounded-full">
                            <Store className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-text-main text-lg font-bold leading-tight">Daian</h1>
                            <p className="text-text-muted text-xs font-medium">Venezuela Admin</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
                    <button
                        onClick={() => setActiveTab('products')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-full transition-colors ${activeTab === 'products'
                            ? 'bg-primary/15 text-text-main font-bold'
                            : 'text-text-muted hover:bg-background hover:text-text-main'
                            }`}
                    >
                        <Package className="h-5 w-5" />
                        <span className="text-sm">Inventario</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('categories')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-full transition-colors ${activeTab === 'categories'
                            ? 'bg-primary/15 text-text-main font-bold'
                            : 'text-text-muted hover:bg-background hover:text-text-main'
                            }`}
                    >
                        <Tag className="h-5 w-5" />
                        <span className="text-sm">Categorías</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('sales')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-full transition-colors ${activeTab === 'sales'
                            ? 'bg-green-100 text-green-700 font-bold'
                            : 'text-text-muted hover:bg-background hover:text-text-main'
                            }`}
                    >
                        <DollarSign className="h-5 w-5" />
                        <span className="text-sm">Ventas</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('slides')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-full transition-colors ${activeTab === 'slides'
                            ? 'bg-primary/15 text-text-main font-bold'
                            : 'text-text-muted hover:bg-background hover:text-text-main'
                            }`}
                    >
                        <ImageIcon className="h-5 w-5" />
                        <span className="text-sm">Hero Slides</span>
                    </button>
                    <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-full text-text-muted hover:bg-background hover:text-text-main transition-colors">
                        <Store className="h-5 w-5" />
                        <span className="text-sm font-medium">Ver Tienda</span>
                    </Link>
                </nav>

                <div className="p-4 border-t border-border">
                    <button
                        onClick={handleLogout}
                        className="w-full text-sm text-text-muted hover:text-primary transition-colors"
                    >
                        Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full overflow-auto">
                {activeTab === 'products' ? (
                    <>
                        <header className="flex items-center justify-between px-8 py-6">
                            <div>
                                <h2 className="text-3xl font-black text-text-main tracking-tight">Inventario</h2>
                                <p className="text-text-muted mt-1">Gestiona tu catálogo, precios y stock.</p>
                            </div>
                            <button
                                onClick={openCreateModal}
                                className="flex items-center gap-2 bg-text-main hover:bg-black text-white px-6 py-3 rounded-full font-bold shadow-lg transition-all transform hover:-translate-y-0.5"
                            >
                                <Plus className="h-5 w-5" />
                                Agregar Producto
                            </button>
                        </header>

                        {/* Search & Filters */}
                        <div className="px-8 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                            <div className="relative w-full md:w-96">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted" />
                                <input
                                    type="text"
                                    placeholder="Buscar por nombre o categoría..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="block w-full pl-11 pr-4 py-3 bg-white border-none ring-1 ring-black/5 rounded-full text-sm text-text-main placeholder-text-muted focus:ring-2 focus:ring-primary focus:outline-none transition-shadow shadow-sm"
                                />
                            </div>
                        </div>

                        {/* Alibaba Importer (Beta) */}
                        <div className="px-8 mb-6">
                            <AdminAlibabaImporter
                                categories={categories}
                                onProductImported={loadData}
                            />
                        </div>

                        {/* Products Table */}
                        <div className="flex-1 overflow-y-auto px-8 pb-8">
                            <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50/50 border-b border-border">
                                                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider w-16">Imagen</th>
                                                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Producto</th>
                                                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Categoría</th>
                                                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Precio (USD / VES)</th>
                                                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Stock</th>
                                                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Estado</th>
                                                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider text-right">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {filteredProducts.map((product) => (
                                                <tr key={product.id} className="group hover:bg-primary/5 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div
                                                            className="h-12 w-12 rounded-full bg-cover bg-center shadow-inner"
                                                            style={{ backgroundImage: `url('${product.image}')` }}
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="text-sm font-bold text-text-main">{product.name}</p>
                                                        <p className="text-xs text-text-muted">ID: {product.id}</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                                            {product.category.name}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="text-sm font-bold text-text-main">${product.priceUsd.toFixed(2)}</p>
                                                        <p className="text-xs text-text-muted">Bs. {formatVes(product.priceUsd * rate)}</p>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-text-muted">{product.stock} unidades</td>
                                                    <td className="px-6 py-4">
                                                        {product.stock > 5 ? (
                                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700">
                                                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2" />
                                                                En Stock
                                                            </span>
                                                        ) : product.stock > 0 ? (
                                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-yellow-50 text-yellow-700">
                                                                <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mr-2" />
                                                                Bajo Stock
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-500">
                                                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2" />
                                                                Agotado
                                                            </span>
                                                        )}
                                                        {product.isOffer && (
                                                            <span className="ml-2 bg-red-50 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-100">
                                                                OFERTA
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={() => openEditModal(product)}
                                                                className="p-2 rounded-full hover:bg-background text-text-muted hover:text-primary transition-colors"
                                                            >
                                                                <Edit className="h-5 w-5" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(product.id)}
                                                                className="p-2 rounded-full hover:bg-background text-text-muted hover:text-red-500 transition-colors"
                                                            >
                                                                <Trash2 className="h-5 w-5" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {filteredProducts.length === 0 && (
                                    <div className="px-6 py-12 text-center">
                                        <Package className="h-12 w-12 mx-auto text-text-muted/30 mb-4" />
                                        <p className="text-text-muted">No hay productos para mostrar</p>
                                    </div>
                                )}

                                <div className="px-6 py-4 border-t border-border">
                                    <p className="text-sm text-text-muted">
                                        Mostrando {filteredProducts.length} de {products.length} productos
                                    </p>
                                </div>
                            </div>
                        </div>
                    </>
                ) : activeTab === 'categories' ? (
                    <div className="flex-1 overflow-y-auto px-8 py-6">
                        <AdminCategoriesSection categories={categoriesWithCount} onRefresh={loadData} />
                    </div>
                ) : activeTab === 'sales' ? (
                    <div className="flex-1 overflow-y-auto px-8 py-6">
                        <AdminSalesSection sales={sales} products={products} onRefresh={loadData} />
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto px-8 py-6">
                        <AdminSlidesSection slides={slides} onRefresh={loadData} />
                    </div>
                )}
            </main>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto border border-border">
                        <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md px-8 py-5 border-b border-border flex items-center justify-between">
                            <h3 className="text-xl font-black text-text-main">
                                {editingProduct ? 'Editar Producto' : 'Agregar Producto'}
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <X className="h-5 w-5 text-text-muted" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
                            {/* Imagen Principal */}
                            <div>
                                <label className="block text-sm font-bold text-text-main mb-1.5">Imagen Principal</label>
                                <ImageUploader
                                    value={watch('image') || ''}
                                    onChange={(url) => setValue('image', url)}
                                />
                                <input type="hidden" {...register('image', { required: 'La imagen es requerida' })} />
                                {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image.message}</p>}
                            </div>

                            {/* Multimedia Gallery (Unified & Sortable) */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-bold text-text-main">Galería Multimedia (Ordenable)</label>
                                    <span className="text-xs text-text-muted">Usa las flechas para reordenar</span>
                                </div>

                                <div className="flex flex-wrap gap-2 mb-3">
                                    {editableMedia.map((url, index) => {
                                        // Helper defined outside render or use simple check
                                        const isVideo = url.toLowerCase().endsWith('.mp4') || url.toLowerCase().endsWith('.webm') || url.toLowerCase().includes('resource_type=video');
                                        return (
                                            <div key={index} className="relative group w-24 h-24 bg-gray-50 border border-border rounded-lg flex flex-col items-center justify-center p-1">
                                                {/* Preview */}
                                                <div className="w-full h-16 rounded overflow-hidden mb-1 bg-black/5 relative">
                                                    {isVideo ? (
                                                        <div className="w-full h-full bg-black flex items-center justify-center">
                                                            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                                                <div className="w-0 h-0 border-l-[6px] border-l-white border-y-[4px] border-y-transparent ml-0.5"></div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <img
                                                            src={url}
                                                            alt="Media"
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => (e.target as HTMLImageElement).src = 'https://via.placeholder.com/64?text=ERR'}
                                                        />
                                                    )}
                                                </div>

                                                {/* Controls */}
                                                <div className="flex items-center gap-1 w-full justify-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => moveMedia(index, 'left')}
                                                        disabled={index === 0}
                                                        className="p-1 hover:bg-gray-200 rounded disabled:opacity-20 text-text-muted transition-colors"
                                                        title="Mover a la izquierda"
                                                    >
                                                        <ChevronLeft className="h-3 w-3" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeMedia(index)}
                                                        className="p-1 hover:bg-red-100 rounded text-red-500 transition-colors"
                                                        title="Eliminar"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => moveMedia(index, 'right')}
                                                        disabled={index === editableMedia.length - 1}
                                                        className="p-1 hover:bg-gray-200 rounded disabled:opacity-20 text-text-muted transition-colors"
                                                        title="Mover a la derecha"
                                                    >
                                                        <ChevronRight className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Inputs for New Media */}
                                <div className="flex flex-col gap-2">
                                    {/* Add Image Input */}
                                    <div className="flex gap-2">
                                        <input
                                            type="url"
                                            placeholder="URL de imagen..."
                                            className="flex-1 px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            id="newImageUrl"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const input = document.getElementById('newImageUrl') as HTMLInputElement;
                                                if (input.value) {
                                                    addMedia(input.value);
                                                    input.value = '';
                                                }
                                            }}
                                            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
                                        >
                                            + Imagen
                                        </button>
                                    </div>

                                    {/* Add Video Input (with Upload) */}
                                    <div className="w-full">
                                        <div className="text-xs font-bold text-text-main mb-1.5">+ Agregar Video</div>
                                        <VideoUploader
                                            value=""
                                            onChange={(url) => {
                                                if (url) {
                                                    addMedia(url);
                                                }
                                            }}
                                            placeholder="URL o archivo mp4..."
                                        />
                                    </div>
                                </div>
                            </div>


                            {/* Name */}
                            <div>
                                <label className="block text-sm font-bold text-text-main mb-1.5">Nombre del Producto</label>
                                <input
                                    {...register('name', { required: 'El nombre es requerido' })}
                                    placeholder="Ej. Vestido de Verano"
                                    className="w-full px-4 py-3 rounded-xl bg-background border-transparent focus:border-primary focus:bg-white focus:ring-0 transition-colors text-sm"
                                />
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-bold text-text-main mb-1.5">Descripción</label>
                                <textarea
                                    {...register('description', { required: 'La descripción es requerida' })}
                                    placeholder="Describe el producto..."
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-xl bg-background border-transparent focus:border-primary focus:bg-white focus:ring-0 transition-colors text-sm resize-none"
                                />
                                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
                            </div>

                            {/* Category & Stock */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-text-main mb-1.5">Categoría</label>
                                    <select
                                        {...register('categoryId', { required: true, valueAsNumber: true })}
                                        className="w-full px-4 py-3 rounded-xl bg-background border-transparent focus:border-primary focus:bg-white focus:ring-0 transition-colors text-sm cursor-pointer"
                                    >
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-text-main mb-1.5">Stock</label>
                                    <input
                                        type="number"
                                        {...register('stock', { required: true, valueAsNumber: true, min: 0 })}
                                        placeholder="0"
                                        className="w-full px-4 py-3 rounded-xl bg-background border-transparent focus:border-primary focus:bg-white focus:ring-0 transition-colors text-sm"
                                    />
                                </div>
                            </div>

                            {/* Prices */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-text-main mb-1.5">Precio (USD)</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-sm font-bold">$</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            {...register('priceUsd', { required: true, valueAsNumber: true, min: 0.01 })}
                                            placeholder="0.00"
                                            className="w-full pl-8 pr-4 py-3 rounded-xl bg-background border-transparent focus:border-primary focus:bg-white focus:ring-0 transition-colors text-sm"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-text-main mb-1.5">Precio (VES)</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-sm font-bold">Bs.</span>
                                        <input
                                            type="text"
                                            value={priceUsd ? formatVes(priceUsd * rate) : ''}
                                            readOnly
                                            placeholder="0.00"
                                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-100 border-transparent cursor-not-allowed text-sm text-text-muted"
                                        />
                                    </div>
                                    <p className="text-[10px] text-text-muted mt-1 ml-1">Tasa BCV: {rate.toFixed(2)}</p>
                                </div>
                            </div>

                            {/* Old Price (for offers) */}
                            <div>
                                <label className="block text-sm font-bold text-text-main mb-1.5">Precio Anterior (opcional)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-sm font-bold">$</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        {...register('oldPriceUsd', { valueAsNumber: true })}
                                        placeholder="0.00"
                                        className="w-full pl-8 pr-4 py-3 rounded-xl bg-background border-transparent focus:border-primary focus:bg-white focus:ring-0 transition-colors text-sm"
                                    />
                                </div>
                            </div>

                            {/* Is Offer Toggle */}
                            <div className="flex items-center justify-between p-4 bg-background rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="bg-primary/20 p-2 rounded-full">
                                        <Package className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-text-main">En Oferta</p>
                                        <p className="text-xs text-text-muted">Mostrar etiqueta de descuento</p>
                                    </div>
                                </div>
                                <input
                                    type="checkbox"
                                    {...register('isOffer')}
                                    className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                                />
                            </div>

                            {/* Buttons */}
                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-3.5 px-4 rounded-full text-center text-sm font-bold text-text-muted hover:bg-gray-100 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 py-3.5 px-4 rounded-full text-center text-sm font-bold bg-text-main text-white hover:opacity-90 shadow-lg transition-all disabled:opacity-50 flex items-center justify-center"
                                >
                                    {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Guardar Producto'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
