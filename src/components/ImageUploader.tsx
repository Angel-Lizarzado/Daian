'use client';

import { useState, useRef } from 'react';
import { Upload, X, Loader2, Link as LinkIcon } from 'lucide-react';
import { uploadImage } from '@/actions/upload';

interface ImageUploaderProps {
    value: string;
    onChange: (url: string) => void;
    placeholder?: string;
}

export default function ImageUploader({ value, onChange, placeholder = 'URL de imagen o sube un archivo' }: ImageUploaderProps) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mode, setMode] = useState<'url' | 'upload'>('url');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const result = await uploadImage(formData);

            if (result.success && result.url) {
                onChange(result.url);
            } else {
                setError(result.error || 'Error al subir imagen');
            }
        } catch (err) {
            setError('Error al subir imagen');
        } finally {
            setUploading(false);
        }
    };

    const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
    };

    return (
        <div className="space-y-3">
            {/* Mode Toggle */}
            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={() => setMode('url')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${mode === 'url'
                            ? 'bg-primary text-white'
                            : 'bg-background text-text-muted hover:bg-gray-100'
                        }`}
                >
                    <LinkIcon className="h-4 w-4" />
                    URL
                </button>
                <button
                    type="button"
                    onClick={() => setMode('upload')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${mode === 'upload'
                            ? 'bg-primary text-white'
                            : 'bg-background text-text-muted hover:bg-gray-100'
                        }`}
                >
                    <Upload className="h-4 w-4" />
                    Subir
                </button>
            </div>

            {/* URL Input */}
            {mode === 'url' && (
                <input
                    type="text"
                    value={value}
                    onChange={handleUrlChange}
                    placeholder={placeholder}
                    className="w-full px-4 py-3 rounded-xl bg-background border-transparent focus:border-primary focus:bg-white focus:ring-0 transition-colors text-sm"
                />
            )}

            {/* File Upload */}
            {mode === 'upload' && (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${uploading
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary hover:bg-primary/5'
                        }`}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={handleFileChange}
                        className="hidden"
                    />

                    {uploading ? (
                        <div className="flex flex-col items-center gap-2">
                            <Loader2 className="h-8 w-8 text-primary animate-spin" />
                            <p className="text-sm text-text-muted">Subiendo...</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2">
                            <Upload className="h-8 w-8 text-text-muted" />
                            <p className="text-sm text-text-muted">
                                Clic para seleccionar imagen
                            </p>
                            <p className="text-xs text-text-muted/60">
                                JPG, PNG, WebP o GIF (máx. 5MB)
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Error Message */}
            {error && (
                <p className="text-red-500 text-xs">{error}</p>
            )}

            {/* Preview */}
            {value && (
                <div className="relative">
                    <div
                        className="h-32 w-full rounded-xl bg-cover bg-center border border-border"
                        style={{ backgroundImage: `url('${value}')` }}
                    />
                    <button
                        type="button"
                        onClick={() => onChange('')}
                        className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                    >
                        <X className="h-4 w-4 text-text-muted" />
                    </button>
                </div>
            )}
        </div>
    );
}
