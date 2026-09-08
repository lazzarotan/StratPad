'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSession } from '@/lib/auth-client';
import './Footer.css';

export default function Footer({ variant } = {}) {
    const year = new Date().getFullYear();
    const { data: session } = useSession();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <footer className={`footer${variant === 'auth' ? ' footer--auth' : ''}`}>
            <div className="footer__inner">

                <div className="footer__brand">
                    <span className="footer__logo">StratPad</span>
                    <p className="footer__tagline">The board game dashboard builder.</p>
                </div>

                <nav className="footer__nav">
                    {mounted && session && <Link href="/home">Home</Link>}
                    <Link href="/community">Community</Link>
                    <Link href="/about">About</Link>
                    {mounted && !session && <Link href="/login">Login</Link>}
                    {mounted && !session && <Link href="/signup">Sign Up</Link>}
                </nav>

            </div>
            <div className="footer__bottom">
                <p>&copy; {year} StratPad. Built for tabletop gamers.</p>
            </div>
        </footer>
    );
}
