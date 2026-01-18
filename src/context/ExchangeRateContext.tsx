'use client';

import { createContext, useContext, ReactNode } from 'react';

interface ExchangeRateContextType {
    rate: number;
    fechaActualizacion: string;
}

const ExchangeRateContext = createContext<ExchangeRateContextType | undefined>(undefined);

interface ExchangeRateProviderProps {
    children: ReactNode;
    rate: number;
    fechaActualizacion: string;
}

export function ExchangeRateProvider({ children, rate, fechaActualizacion }: ExchangeRateProviderProps) {
    return (
        <ExchangeRateContext.Provider value={{ rate, fechaActualizacion }}>
            {children}
        </ExchangeRateContext.Provider>
    );
}

export function useExchangeRate() {
    const context = useContext(ExchangeRateContext);
    if (context === undefined) {
        throw new Error('useExchangeRate must be used within an ExchangeRateProvider');
    }
    return context;
}
