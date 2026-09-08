'use client';

import { usePathname } from 'next/navigation';
import Footer from '@/components/Footer/Footer';

const HIDDEN_PREFIXES = ['/stratlab', '/play'];
const AUTH_PAGES = ['/login', '/signup'];

export default function ConditionalFooter() {
    const pathname = usePathname();

    if (HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
        return null;
    }

    const variant = AUTH_PAGES.some((p) => pathname.startsWith(p)) ? 'auth' : undefined;

    return <Footer variant={variant} />;
}
