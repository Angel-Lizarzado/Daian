import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="border-t border-border bg-surface">
            <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
                <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
                    {/* Logo & Copyright */}
                    <div className="flex flex-col items-center md:items-start">
                        <Link href="/" className="flex items-center gap-2 mb-2">
                            <span className="text-xl">🌸</span>
                            <span className="font-serif-logo text-xl font-bold text-text-main">Daian</span>
                        </Link>
                        <p className="text-sm text-text-muted">
                            © {new Date().getFullYear()} Daian Venezuela. Todos los derechos reservados.
                        </p>
                    </div>

                    {/* Social Links */}
                    <div className="flex gap-6">
                        <a
                            href="https://instagram.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-text-muted hover:text-primary transition-colors"
                        >
                            Instagram
                        </a>
                        <a
                            href="https://facebook.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-text-muted hover:text-primary transition-colors"
                        >
                            Facebook
                        </a>
                        <a
                            href="https://wa.me/573003344963"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-text-muted hover:text-primary transition-colors"
                        >
                            WhatsApp
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
