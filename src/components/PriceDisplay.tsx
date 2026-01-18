'use client';

import { useExchangeRate } from '@/context/ExchangeRateContext';
import { convertUsdToVes, formatVes, formatUsd } from '@/lib/exchange-rate';

interface PriceDisplayProps {
    priceUsd: number;
    oldPriceUsd?: number | null;
    isOffer?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

export default function PriceDisplay({ priceUsd, oldPriceUsd, isOffer, size = 'md' }: PriceDisplayProps) {
    const { rate } = useExchangeRate();
    const priceVes = convertUsdToVes(priceUsd, rate);
    const oldPriceVes = oldPriceUsd ? convertUsdToVes(oldPriceUsd, rate) : null;

    const sizeClasses = {
        sm: {
            usd: 'text-base',
            ves: 'text-xs',
            oldUsd: 'text-xs',
        },
        md: {
            usd: 'text-lg',
            ves: 'text-sm',
            oldUsd: 'text-sm',
        },
        lg: {
            usd: 'text-4xl',
            ves: 'text-2xl',
            oldUsd: 'text-lg',
        },
    };

    const classes = sizeClasses[size];

    return (
        <div className="flex flex-col gap-1">
            {/* Current Price */}
            <div className="flex flex-wrap items-baseline gap-x-2">
                <span className={`${classes.usd} font-bold ${isOffer ? 'text-primary' : 'text-text-main'}`}>
                    {formatUsd(priceUsd)}
                </span>
                <span className={`${classes.ves} ${isOffer ? 'text-primary/80' : 'text-text-muted'}`}>
                    / {formatVes(priceVes)} Bs
                </span>
            </div>

            {/* Old Price (if on sale) */}
            {isOffer && oldPriceUsd && oldPriceVes && (
                <div className="flex flex-wrap items-baseline gap-x-1 text-text-muted line-through opacity-70">
                    <span className={classes.oldUsd}>{formatUsd(oldPriceUsd)}</span>
                    <span className="text-xs">/ {formatVes(oldPriceVes)} Bs</span>
                </div>
            )}
        </div>
    );
}
