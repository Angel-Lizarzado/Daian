'use client';

import { useState } from 'react';
import { Plus, Edit, Trash2, X, Loader2, Image as ImageIcon, Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import {
    getAllHeroSlides,
    createHeroSlide,
    updateHeroSlide,
    deleteHeroSlide
} from '@/actions/hero-slides';
import ImageUploader from '@/components/ImageUploader';

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

interface SlideFormData {
    title: string;
    subtitle: string;
    buttonText: string;
    buttonLink: string;
    image: string;
    badge?: string;
    isActive: boolean;
    order: number;
}

interface AdminSlidesSectionProps {
    slides: HeroSlide[];
    onRefresh: () => Promise<void>;
}

export default function AdminSlidesSection({ slides, onRefresh }: AdminSlidesSectionProps) {
    const [showModal, setShowModal] = useState(false);
    const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
    const [saving, setSaving] = useState(false);

    const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<SlideFormData>();

    const openCreateModal = () => {
        setEditingSlide(null);
        reset({
            title: '',
            subtitle: '',
            buttonText: 'Ver Colección',
            buttonLink: '#products',
            image: '',
            badge: '',
            isActive: true,
            order: slides.length + 1,
        });
        setShowModal(true);
    };

    const openEditModal = (slide: HeroSlide) => {
        setEditingSlide(slide);
        reset({
            title: slide.title,
            subtitle: slide.subtitle,
            buttonText: slide.buttonText,
            buttonLink: slide.buttonLink,
            image: slide.image,
            badge: slide.badge || '',
            isActive: slide.isActive,
            order: slide.order,
        });
        setShowModal(true);
    };

    const onSubmit = async (data: SlideFormData) => {
        setSaving(true);
        try {
            if (editingSlide) {
                await updateHeroSlide(editingSlide.id, {
                    ...data,
                    badge: data.badge || undefined,
                });
            } else {
                await createHeroSlide({
                    ...data,
                    badge: data.badge || undefined,
                });
            }
            await onRefresh();
            setShowModal(false);
        } catch (error) {
            console.error('Error saving slide:', error);
        }
        setSaving(false);
    };

    const handleDelete = async (id: number) => {
        if (confirm('¿Estás seguro de eliminar este slide?')) {
            await deleteHeroSlide(id);
            await onRefresh();
        }
    };

    const toggleActive = async (slide: HeroSlide) => {
        await updateHeroSlide(slide.id, { isActive: !slide.isActive });
        await onRefresh();
    };

    return (
        <>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-bold text-text-main">Slides del Hero</h3>
                    <p className="text-sm text-text-muted">Gestiona las imágenes y textos del banner principal</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-full font-bold text-sm shadow-lg transition-all"
                >
                    <Plus className="h-4 w-4" />
                    Nuevo Slide
                </button>
            </div>

            {/* Slides Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {slides.map((slide) => (
                    <div
                        key={slide.id}
                        className={`relative group rounded-xl overflow-hidden border-2 transition-all ${slide.isActive ? 'border-primary shadow-lg' : 'border-border opacity-60'
                            }`}
                    >
                        {/* Slide Image */}
                        <div
                            className="h-48 bg-cover bg-center"
                            style={{ backgroundImage: `url('${slide.image}')` }}
                        />

                        {/* Overlay Content */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                        <div className="absolute bottom-0 left-0 right-0 p-4">
                            {slide.badge && (
                                <span className="inline-block mb-2 px-2 py-0.5 bg-primary text-white text-xs font-bold rounded-full">
                                    {slide.badge}
                                </span>
                            )}
                            <h4 className="text-lg font-bold text-white line-clamp-1">{slide.title}</h4>
                            <p className="text-sm text-white/70 line-clamp-1">{slide.subtitle}</p>
                        </div>

                        {/* Status Badge */}
                        <div className="absolute top-3 right-3">
                            {slide.isActive ? (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                                    <Eye className="h-3 w-3" /> Activo
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-500 text-white text-xs font-bold rounded-full">
                                    <EyeOff className="h-3 w-3" /> Oculto
                                </span>
                            )}
                        </div>

                        {/* Order Badge */}
                        <div className="absolute top-3 left-3">
                            <span className="inline-flex items-center justify-center w-6 h-6 bg-white text-text-main text-xs font-bold rounded-full shadow">
                                {slide.order}
                            </span>
                        </div>

                        {/* Actions */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => toggleActive(slide)}
                                className="p-2 bg-white rounded-full shadow-lg hover:scale-110 transition-transform"
                                title={slide.isActive ? 'Desactivar' : 'Activar'}
                            >
                                {slide.isActive ? (
                                    <EyeOff className="h-4 w-4 text-gray-600" />
                                ) : (
                                    <Eye className="h-4 w-4 text-green-600" />
                                )}
                            </button>
                            <button
                                onClick={() => openEditModal(slide)}
                                className="p-2 bg-white rounded-full shadow-lg hover:scale-110 transition-transform"
                                title="Editar"
                            >
                                <Edit className="h-4 w-4 text-primary" />
                            </button>
                            <button
                                onClick={() => handleDelete(slide.id)}
                                className="p-2 bg-white rounded-full shadow-lg hover:scale-110 transition-transform"
                                title="Eliminar"
                            >
                                <Trash2 className="h-4 w-4 text-red-500" />
                            </button>
                        </div>
                    </div>
                ))}

                {/* Empty State */}
                {slides.length === 0 && (
                    <div className="col-span-full py-12 text-center">
                        <ImageIcon className="h-12 w-12 mx-auto text-text-muted/30 mb-4" />
                        <p className="text-text-muted mb-4">No hay slides configurados</p>
                        <button
                            onClick={openCreateModal}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-full text-sm font-medium hover:bg-primary-hover transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                            Crear primer slide
                        </button>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto border border-border">
                        <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md px-8 py-5 border-b border-border flex items-center justify-between">
                            <h3 className="text-xl font-black text-text-main">
                                {editingSlide ? 'Editar Slide' : 'Nuevo Slide'}
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <X className="h-5 w-5 text-text-muted" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-5">
                            {/* Image */}
                            <div>
                                <label className="block text-sm font-bold text-text-main mb-1.5">
                                    Imagen del Slide
                                </label>
                                <ImageUploader
                                    value={watch('image') || ''}
                                    onChange={(url) => setValue('image', url)}
                                />
                                <input type="hidden" {...register('image', { required: 'La imagen es requerida' })} />
                                {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image.message}</p>}
                            </div>

                            {/* Badge */}
                            <div>
                                <label className="block text-sm font-bold text-text-main mb-1.5">
                                    Badge (opcional)
                                </label>
                                <input
                                    {...register('badge')}
                                    placeholder="Ej. Nueva Colección, ¡Ofertas!"
                                    className="w-full px-4 py-3 rounded-xl bg-background border-transparent focus:border-primary focus:bg-white focus:ring-0 transition-colors text-sm"
                                />
                            </div>

                            {/* Title */}
                            <div>
                                <label className="block text-sm font-bold text-text-main mb-1.5">
                                    Título Principal
                                </label>
                                <input
                                    {...register('title', { required: 'El título es requerido' })}
                                    placeholder="Elegancia Sin Esfuerzo"
                                    className="w-full px-4 py-3 rounded-xl bg-background border-transparent focus:border-primary focus:bg-white focus:ring-0 transition-colors text-sm"
                                />
                                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
                            </div>

                            {/* Subtitle */}
                            <div>
                                <label className="block text-sm font-bold text-text-main mb-1.5">
                                    Subtítulo
                                </label>
                                <textarea
                                    {...register('subtitle', { required: 'El subtítulo es requerido' })}
                                    placeholder="Descripción del slide..."
                                    rows={2}
                                    className="w-full px-4 py-3 rounded-xl bg-background border-transparent focus:border-primary focus:bg-white focus:ring-0 transition-colors text-sm resize-none"
                                />
                                {errors.subtitle && <p className="text-red-500 text-xs mt-1">{errors.subtitle.message}</p>}
                            </div>

                            {/* Button Text & Link */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-text-main mb-1.5">
                                        Texto del Botón
                                    </label>
                                    <input
                                        {...register('buttonText', { required: true })}
                                        placeholder="Ver Colección"
                                        className="w-full px-4 py-3 rounded-xl bg-background border-transparent focus:border-primary focus:bg-white focus:ring-0 transition-colors text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-text-main mb-1.5">
                                        Enlace
                                    </label>
                                    <input
                                        {...register('buttonLink', { required: true })}
                                        placeholder="#products"
                                        className="w-full px-4 py-3 rounded-xl bg-background border-transparent focus:border-primary focus:bg-white focus:ring-0 transition-colors text-sm"
                                    />
                                </div>
                            </div>

                            {/* Order & Active */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-text-main mb-1.5">
                                        Orden
                                    </label>
                                    <input
                                        type="number"
                                        {...register('order', { required: true, valueAsNumber: true })}
                                        className="w-full px-4 py-3 rounded-xl bg-background border-transparent focus:border-primary focus:bg-white focus:ring-0 transition-colors text-sm"
                                    />
                                </div>
                                <div className="flex items-center">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            {...register('isActive')}
                                            className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                        <span className="text-sm font-medium text-text-main">Activo</span>
                                    </label>
                                </div>
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
                                    className="flex-1 py-3.5 px-4 rounded-full text-center text-sm font-bold bg-primary text-white hover:bg-primary-hover shadow-lg transition-all disabled:opacity-50 flex items-center justify-center"
                                >
                                    {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Guardar Slide'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
