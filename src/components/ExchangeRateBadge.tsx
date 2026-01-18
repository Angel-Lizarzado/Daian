'use client';

import { useExchangeRate } from '@/context/ExchangeRateContext';
import { RefreshCw } from 'lucide-react';

export default function ExchangeRateBadge() {
    const { rate, fechaActualizacion } = useExchangeRate();

    const formattedDate = new Date(fechaActualizacion).toLocaleDateString('es-VE', {
        day: 'numeric',
        month: 'short',
    });

    return (
        <div className="fixed bottom-6 left-6 z-50 hidden sm:flex items-center justify-center rounded-2xl bg-primary/95 backdrop-blur-sm px-5 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:scale-105 border border-white/20 cursor-help group">
            <RefreshCw className="mr-2 h-4 w-4 group-hover:animate-spin" />
            <div className="flex flex-col">
                <span className="text-xs opacity-80">Tasa BCV</span>
                <span>{rate.toFixed(2)} Bs/$</span>
            </div>
            <span className="ml-2 text-[10px] opacity-60 hidden lg:block">{formattedDate}</span>
        </div>
    );
}
