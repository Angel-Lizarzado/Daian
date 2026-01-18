'use client';

import { useState } from 'react';
import { MessageCircle, Loader2 } from 'lucide-react';
import { useExchangeRate } from '@/context/ExchangeRateContext';
import { logSaleAndGetWhatsAppUrl } from '@/actions/sale';

interface WhatsAppButtonProps {
    productId: number;
    productName: string;
    priceUsd: number;
    disabled?: boolean;
    fullWidth?: boolean;
}

export default function WhatsAppButton({
    productId,
    productName,
    priceUsd,
    disabled = false,
    fullWidth = true,
}: WhatsAppButtonProps) {
    const [loading, setLoading] = useState(false);
    const { rate } = useExchangeRate();

    const handleClick = async () => {
        if (disabled || loading) return;

        setLoading(true);
        try {
            const whatsappUrl = await logSaleAndGetWhatsAppUrl({
                productId,
                productName,
                priceUsd,
                exchangeRate: rate,
            });

            // Open WhatsApp in a new tab
            window.open(whatsappUrl, '_blank');
        } catch (error) {
            console.error('Error logging sale:', error);
            // Still open WhatsApp even if logging fails
            const priceVes = (priceUsd * rate).toFixed(2);
            const message = encodeURIComponent(
                `Hola Daian, quiero ${productName}. Precio: $${priceUsd.toFixed(2)} (Bs. ${priceVes}).`
            );
            window.open(`https://wa.me/584164974877?text=${message}`, '_blank');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleClick}
            disabled={disabled || loading}
            className={`
        ${fullWidth ? 'w-full' : ''}
        mt-auto flex items-center justify-center gap-2 rounded-full 
        bg-[#25D366] px-4 py-3 text-sm font-bold text-white 
        transition-all hover:bg-[#20bd5a] hover:shadow-lg hover:shadow-[#25d366]/20
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none
      `}
        >
            {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
                <MessageCircle className="h-5 w-5" />
            )}
            {disabled ? 'Agotado' : 'Pedir por WhatsApp'}
        </button>
    );
}
