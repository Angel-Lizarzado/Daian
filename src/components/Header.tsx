'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Heart, Menu, LogOut, X } from 'lucide-react';
import { useFavorites } from '@/context/FavoritesContext';

export default function Header() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [scrolled, setScrolled] = useState(false);
    const { count } = useFavorites();

    useEffect(() => {
        // Check authentication on client side
        const checkAuth = () => {
            const authenticated = document.cookie.includes('admin_session=authenticated');
            setIsAuthenticated(authenticated);
        };
        checkAuth();

        // Listen for cookie changes
        const interval = setInterval(checkAuth, 1000);
        return () => clearInterval(interval);
    }, []);

    // Detectar scroll para efecto visual
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        document.cookie = 'admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        setIsAuthenticated(false);
        window.location.href = '/';
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            window.location.href = `/?search=${encodeURIComponent(searchTerm.trim())}`;
        }
    };

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${scrolled
                ? 'bg-surface/95 backdrop-blur-md shadow-sm border-b border-border'
                : 'bg-surface border-b border-border'
            }`}>
            <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="flex size-8 items-center justify-center rounded-full bg-primary/20 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                        <span className="text-lg">🌸</span>
                    </div>
                    <h1 className="font-serif-logo text-2xl font-bold tracking-tight text-text-main">Daian</h1>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden lg:flex items-center gap-10">
                    <Link href="/#products" className="text-sm font-medium text-text-main hover:text-primary transition-colors">
                        Tienda
                    </Link>
                    {isAuthenticated && (
                        <Link href="/admin" className="text-sm font-medium text-primary hover:text-primary-hover transition-colors">
                            Admin
                        </Link>
                    )}
                </nav>

                {/* Right Side Actions */}
                <div className="flex items-center gap-3">
                    {/* Search */}
                    {showSearch ? (
                        <form onSubmit={handleSearch} className="flex items-center gap-2">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Buscar productos..."
                                autoFocus
                                className="w-40 lg:w-60 px-4 py-2 rounded-full border border-border text-sm focus:outline-none focus:border-primary"
                            />
                            <button
                                type="button"
                                onClick={() => { setShowSearch(false); setSearchTerm(''); }}
                                className="p-2 hover:text-primary"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </form>
                    ) : (
                        <button
                            onClick={() => setShowSearch(true)}
                            className="flex size-10 items-center justify-center rounded-full bg-background hover:bg-primary/20 hover:text-primary transition-colors"
                        >
                            <Search className="h-5 w-5" />
                        </button>
                    )}

                    {/* Favorites */}
                    <Link
                        href="/favoritos"
                        className="relative flex size-10 items-center justify-center rounded-full bg-background hover:bg-primary/20 hover:text-primary transition-colors"
                    >
                        <Heart className="h-5 w-5" />
                        {count > 0 && (
                            <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                                {count > 9 ? '9+' : count}
                            </span>
                        )}
                    </Link>

                    {/* Logout button */}
                    {isAuthenticated && (
                        <button
                            onClick={handleLogout}
                            className="flex size-10 items-center justify-center rounded-full bg-background hover:bg-red-100 hover:text-red-500 transition-colors"
                            title="Cerrar sesión"
                        >
                            <LogOut className="h-5 w-5" />
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}
