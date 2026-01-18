// Función para obtener la tasa de cambio del BCV desde DolarApi
export interface ExchangeRateData {
    compra: number;
    venta: number;
    promedio: number;
    fechaActualizacion: string;
}

export async function getExchangeRate(): Promise<ExchangeRateData> {
    try {
        const response = await fetch('https://ve.dolarapi.com/v1/dolares/oficial', {
            next: { revalidate: 3600 } // Revalidar cada hora
        });

        if (!response.ok) {
            throw new Error('Error fetching exchange rate');
        }

        const data = await response.json();

        return {
            compra: data.compra || 0,
            venta: data.venta || 0,
            promedio: data.promedio || data.venta || 0,
            fechaActualizacion: data.fechaActualizacion || new Date().toISOString()
        };
    } catch (error) {
        console.error('Error fetching exchange rate:', error);
        // Valor de respaldo en caso de error
        return {
            compra: 50,
            venta: 50,
            promedio: 50,
            fechaActualizacion: new Date().toISOString()
        };
    }
}

// Función para convertir USD a VES
export function convertUsdToVes(usd: number, rate: number): number {
    return usd * rate;
}

// Función para formatear precio en VES
export function formatVes(amount: number): string {
    return new Intl.NumberFormat('es-VE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

// Función para formatear precio en USD
export function formatUsd(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}
