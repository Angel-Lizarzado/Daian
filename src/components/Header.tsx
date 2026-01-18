'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Heart, Menu, LogOut, X } from 'lucide-react';
import { useFavorites } from '@/context/FavoritesContext';

interface Category {
    id: number;
    name: string;
}

interface HeaderProps {
    categories?: Category[];
}

export default function Header({ categories = [] }: HeaderProps) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [scrolled, setScrolled] = useState(false);
    const { count } = useFavorites();

    useEffect(() => {
        const checkAuth = () => {
            const authenticated = document.cookie.includes('admin_session=authenticated');
            setIsAuthenticated(authenticated);
        };
        checkAuth();
        const interval = setInterval(checkAuth, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Cerrar menú móvil al hacer scroll
    useEffect(() => {
        if (showMobileMenu) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [showMobileMenu]);

    const handleLogout = () => {
        document.cookie = 'admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        setIsAuthenticated(false);
        window.location.href = '/';
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            window.location.href = `/?search=${encodeURIComponent(searchTerm.trim())}`;
            setShowMobileMenu(false);
        }
    };

    const handleCategoryClick = (categoryName: string) => {
        window.location.href = `/?category=${encodeURIComponent(categoryName)}`;
        setShowMobileMenu(false);
    };

    return (
        <>
            <header className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${scrolled
                ? 'bg-surface/95 backdrop-blur-md shadow-sm border-b border-border'
                : 'bg-surface border-b border-border'
                }`}>
                <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
                    {/* Mobile Menu Button & Logo */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setShowMobileMenu(true)}
                            className="block lg:hidden text-text-main p-2 -ml-2 hover:bg-background rounded-full transition-colors"
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="flex size-8 items-center justify-center rounded-full bg-primary/20 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                                <span className="text-lg">🌸</span>
                            </div>
                            <h1 className="font-serif-logo text-2xl font-bold tracking-tight text-text-main">Daian</h1>
                        </Link>
                    </div>

                    {/* Desktop Navigation - Categories */}
                    <nav className="hidden lg:flex items-center gap-8">
                        {categories.slice(0, 5).map((category) => (
                            <button
                                key={category.id}
                                onClick={() => handleCategoryClick(category.name)}
                                className="text-sm font-medium text-text-main hover:text-primary transition-colors"
                            >
                                {category.name}
                            </button>
                        ))}
                        {isAuthenticated && (
                            <Link href="/admin" className="flex items-center gap-1.5 text-sm font-bold text-primary hover:text-primary-hover transition-colors">
                                <span>⚙️</span>
                                Admin
                            </Link>
                        )}
                    </nav>

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-2 lg:gap-3">
                        {/* Search */}
                        {showSearch ? (
                            <form onSubmit={handleSearch} className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Buscar..."
                                    autoFocus
                                    className="w-32 lg:w-48 px-4 py-2 rounded-full border border-border text-sm focus:outline-none focus:border-primary"
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

                        {isAuthenticated && (
                            <button
                                onClick={handleLogout}
                                className="hidden lg:flex size-10 items-center justify-center rounded-full bg-background hover:bg-red-100 hover:text-red-500 transition-colors"
                                title="Cerrar sesión"
                            >
                                <LogOut className="h-5 w-5" />
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            {showMobileMenu && (
                <div className="fixed inset-0 z-[60] lg:hidden">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setShowMobileMenu(false)}
                    />

                    {/* Menu Panel */}
                    <div className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-surface shadow-2xl animate-in slide-in-from-left duration-300">
                        {/* Menu Header */}
                        <div className="flex items-center justify-between p-6 border-b border-border">
                            <Link href="/" onClick={() => setShowMobileMenu(false)} className="flex items-center gap-2">
                                <span className="text-2xl">🌸</span>
                                <span className="font-serif-logo text-2xl font-bold text-text-main">Daian</span>
                            </Link>
                            <button
                                onClick={() => setShowMobileMenu(false)}
                                className="p-2 rounded-full hover:bg-background transition-colors"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Search in Mobile */}
                        <div className="p-4 border-b border-border">
                            <form onSubmit={handleSearch} className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Buscar productos..."
                                    className="w-full pl-12 pr-4 py-3 rounded-full bg-background border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </form>
                        </div>

                        {/* Categories */}
                        <nav className="p-4">
                            <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3 px-2">Categorías</p>
                            <div className="space-y-1">
                                {categories.map((category) => (
                                    <button
                                        key={category.id}
                                        onClick={() => handleCategoryClick(category.name)}
                                        className="w-full px-4 py-3 text-left text-text-main font-medium rounded-xl hover:bg-primary/10 hover:text-primary transition-colors"
                                    >
                                        {category.name}
                                    </button>
                                ))}
                            </div>

                            {/* Admin Link */}
                            {isAuthenticated && (
                                <div className="mt-4 pt-4 border-t border-border">
                                    <Link
                                        href="/admin"
                                        onClick={() => setShowMobileMenu(false)}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-primary font-bold rounded-xl hover:bg-primary/10 transition-colors"
                                    >
                                        <span className="text-lg">⚙️</span>
                                        Panel de Admin
                                    </Link>
                                </div>
                            )}
                        </nav>

                        {/* Bottom Actions */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-surface">
                            <div className="flex gap-3">
                                <Link
                                    href="/favoritos"
                                    onClick={() => setShowMobileMenu(false)}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full bg-background text-text-main font-medium hover:bg-primary/10 transition-colors"
                                >
                                    <Heart className="h-5 w-5" />
                                    Favoritos
                                    {count > 0 && <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full">{count}</span>}
                                </Link>
                                {isAuthenticated && (
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center justify-center gap-2 px-4 py-3 rounded-full text-red-500 hover:bg-red-50 transition-colors"
                                    >
                                        <LogOut className="h-5 w-5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
