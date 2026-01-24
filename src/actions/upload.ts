'use server';

import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(formData: FormData): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
        const file = formData.get('file') as File;

        if (!file) {
            return { success: false, error: 'No se recibió ningún archivo' };
        }

        // Validate file type
        const imageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        const videoTypes = ['video/mp4', 'video/webm'];
        const validTypes = [...imageTypes, ...videoTypes];

        if (!validTypes.includes(file.type)) {
            return { success: false, error: 'Tipo de archivo no válido. Use JPG, PNG, WebP, GIF, MP4 o WebM' };
        }

        // Validate file size
        // Images: 10MB (Cloudinary handles large images well), Videos: 100MB
        // Note: Cloudinary Free plan has limits, but single file limits are generous. 
        // Vercel Server Actions limit (60MB) is the main bottleneck for now.
        const isVideo = videoTypes.includes(file.type);
        const maxSize = isVideo ? 60 * 1024 * 1024 : 10 * 1024 * 1024;

        if (file.size > maxSize) {
            return { success: false, error: `El archivo es muy grande. Máximo ${isVideo ? '60MB' : '10MB'}` };
        }

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to Cloudinary using a promise wrapper over the stream
        const result = await new Promise<any>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'daian-store', // Keep organized
                    resource_type: isVideo ? 'video' : 'image',
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );

            uploadStream.end(buffer);
        });

        // Return the secure Cloudinary URL
        return { success: true, url: result.secure_url };
    } catch (error) {
        console.error('Error uploading file to Cloudinary:', error);
        return { success: false, error: 'Error al subir el archivo a la nube' };
    }
}
