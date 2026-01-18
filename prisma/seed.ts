import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Create categories
    const categories = await Promise.all([
        prisma.category.upsert({
            where: { name: 'Ropa' },
            update: {},
            create: { name: 'Ropa' },
        }),
        prisma.category.upsert({
            where: { name: 'Accesorios' },
            update: {},
            create: { name: 'Accesorios' },
        }),
        prisma.category.upsert({
            where: { name: 'Calzado' },
            update: {},
            create: { name: 'Calzado' },
        }),
        prisma.category.upsert({
            where: { name: 'Joyería' },
            update: {},
            create: { name: 'Joyería' },
        }),
    ]);

    console.log(`✅ Created ${categories.length} categories`);

    // Create sample products
    const products = [
        {
            name: 'Vestido Floral de Verano',
            description: 'Vestido ligero con estampado floral, perfecto para días cálidos. Tela 100% algodón.',
            priceUsd: 45.00,
            oldPriceUsd: null,
            isOffer: false,
            stock: 15,
            image: 'https://images.unsplash.com/photo-1572804013427-4d7ca7268217?w=800&q=80',
            categoryId: categories[0].id,
        },
        {
            name: 'Blusa de Seda',
            description: 'Blusa elegante de seda orgánica. Corte clásico con caída perfecta.',
            priceUsd: 85.00,
            oldPriceUsd: null,
            isOffer: false,
            stock: 8,
            image: 'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=800&q=80',
            categoryId: categories[0].id,
        },
        {
            name: 'Pantalón Lino',
            description: 'Pantalón de tiro alto en lino premium. Fresco y cómodo.',
            priceUsd: 55.00,
            oldPriceUsd: 75.00,
            isOffer: true,
            stock: 20,
            image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80',
            categoryId: categories[0].id,
        },
        {
            name: 'Bolso de Cuero',
            description: 'Bolso artesanal de cuero genuino. Diseño minimalista y elegante.',
            priceUsd: 120.00,
            oldPriceUsd: null,
            isOffer: false,
            stock: 5,
            image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80',
            categoryId: categories[1].id,
        },
        {
            name: 'Sombrero de Paja',
            description: 'Sombrero tejido a mano en paja natural. Protección UV.',
            priceUsd: 32.00,
            oldPriceUsd: 40.00,
            isOffer: true,
            stock: 12,
            image: 'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=800&q=80',
            categoryId: categories[1].id,
        },
        {
            name: 'Sandalias Artesanales',
            description: 'Sandalias de cuero con diseño artesanal. Cómodas para todo el día.',
            priceUsd: 65.00,
            oldPriceUsd: null,
            isOffer: false,
            stock: 0,
            image: 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=800&q=80',
            categoryId: categories[2].id,
        },
        {
            name: 'Collar Minimalista',
            description: 'Collar delicado en oro de 18k. Cadena ajustable.',
            priceUsd: 28.00,
            oldPriceUsd: null,
            isOffer: false,
            stock: 25,
            image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80',
            categoryId: categories[3].id,
        },
        {
            name: 'Aretes de Perla',
            description: 'Aretes con perlas cultivadas de agua dulce. Elegancia clásica.',
            priceUsd: 42.00,
            oldPriceUsd: 55.00,
            isOffer: true,
            stock: 10,
            image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80',
            categoryId: categories[3].id,
        },
    ];

    for (const product of products) {
        await prisma.product.create({
            data: product,
        });
    }

    console.log(`✅ Created ${products.length} products`);
    console.log('🌸 Seeding completed!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
