import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌟 Adding hero slides...');

    await prisma.heroSlide.createMany({
        data: [
            {
                title: 'Elegancia Sin Esfuerzo',
                subtitle: 'Descubre nuestra nueva colección de piezas minimalistas diseñadas para la mujer moderna. Telas suaves, tonos neutros y cortes atemporales.',
                buttonText: 'Ver Colección',
                buttonLink: '#products',
                image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=1200&q=80',
                badge: 'Nueva Colección',
                order: 1,
            },
            {
                title: 'Temporada de Ofertas',
                subtitle: 'Aprovecha descuentos increíbles en artículos seleccionados. ¡Ofertas por tiempo limitado!',
                buttonText: 'Ver Ofertas',
                buttonLink: '#products',
                image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200&q=80',
                badge: '¡Ofertas!',
                order: 2,
            },
        ],
    });

    console.log('✅ Slides created!');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
