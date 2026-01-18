'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Lock, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function AdminLoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Credenciales: Usuario "Daian", Password "daian2026"
        if (username === 'Daian' && password === 'daian2026') {
            // Set a simple session cookie
            document.cookie = 'admin_session=authenticated; path=/; max-age=86400';
            router.push('/admin');
        } else {
            setError('Usuario o contraseña incorrectos');
        }
        setLoading(false);
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col justify-center items-center p-6 bg-background">
            {/* Abstract decorative elements */}
            <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl pointer-events-none opacity-60" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none opacity-60" />

            {/* Main Card */}
            <main className="relative z-10 w-full max-w-[440px] bg-surface rounded-xl shadow-lg p-10 md:p-12 border border-border">
                {/* Logo */}
                <div className="flex flex-col items-center justify-center mb-10">
                    <h1 className="font-serif-logo text-4xl md:text-5xl text-text-main font-bold tracking-tight mb-2">
                        Daian
                    </h1>
                    <p className="text-text-muted text-sm font-medium tracking-wide uppercase">
                        Admin Dashboard
                    </p>
                </div>

                {/* Welcome Text */}
                <div className="text-center mb-6">
                    <p className="text-text-main text-lg font-medium">Bienvenido de nuevo</p>
                    <p className="text-text-muted text-sm">Ingresa tus credenciales para acceder</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    {/* Username Input */}
                    <label className="flex flex-col gap-2">
                        <span className="text-text-main text-sm font-medium ml-1">Usuario</span>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-text-muted">
                                <User className="h-5 w-5" />
                            </span>
                            <input
                                type="text"
                                name="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Daian"
                                required
                                className="flex w-full rounded-lg text-text-main border border-border bg-white h-12 pl-12 pr-4 text-base focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none placeholder:text-text-muted/50 transition-all"
                            />
                        </div>
                    </label>

                    {/* Password Input */}
                    <label className="flex flex-col gap-2">
                        <span className="text-text-main text-sm font-medium ml-1">Contraseña</span>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-text-muted">
                                <Lock className="h-5 w-5" />
                            </span>
                            <input
                                type="password"
                                name="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="flex w-full rounded-lg text-text-main border border-border bg-white h-12 pl-12 pr-4 text-base focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none placeholder:text-text-muted/50 transition-all"
                            />
                        </div>
                    </label>

                    {/* Error Message */}
                    {error && (
                        <p className="text-red-500 text-sm text-center">{error}</p>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-4 flex w-full cursor-pointer items-center justify-center rounded-lg h-12 px-6 bg-primary hover:bg-primary-hover text-white text-base font-bold tracking-wide shadow-sm hover:shadow-md transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
                    >
                        {loading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            'Iniciar Sesión'
                        )}
                    </button>
                </form>

                {/* Footer Link */}
                <div className="mt-6 flex justify-center border-t border-border pt-6">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-text-muted hover:text-primary transition-colors group"
                    >
                        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-medium">Volver a la tienda</span>
                    </Link>
                </div>
            </main>

            {/* Footer */}
            <footer className="absolute bottom-6 text-center w-full">
                <p className="text-xs text-text-muted/40">
                    © 2026 Daian Inc. Todos los derechos reservados.
                </p>
            </footer>
        </div>
    );
}
