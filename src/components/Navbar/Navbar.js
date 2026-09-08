'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSession } from '@/lib/auth-client'
import { useEffect, useState, useRef } from 'react'
import AvatarDropdown from './AvatarDropdown'
import './Navbar.css'
import { clearSessionStorage } from "@/client_API_calls/session_storage/session_storage_utils";
import AlertModal from '@/components/AlertModal/AlertModal';

const STRATLAB_DIRTY_FLAG_KEY = "stratlab:isDirty";

export default function Navbar() {
    const pathname = usePathname()
    const router = useRouter()
    const { data: session, isPending } = useSession()
    const [isMounted, setIsMounted] = useState(false)
    const [authHint, setAuthHint] = useState(null)
    const [menuOpen, setMenuOpen] = useState(false)
    const menuRef = useRef(null)
    const [leaveModal, setLeaveModal] = useState(false)
    const [toolbarCollapsed, setToolbarCollapsed] = useState(false)
    const pendingHref = useRef(null)

    useEffect(() => {
        setIsMounted(true)
        setAuthHint(localStorage.getItem('navbar_auth_hint'))
    }, [])

    useEffect(() => {
        if (!isPending) {
            const hint = session ? 'loggedIn' : 'loggedOut'
            localStorage.setItem('navbar_auth_hint', hint)
            setAuthHint(hint)
        }
    }, [session, isPending])

    // Close menu on route change & reset toolbar collapse
    useEffect(() => {
        setMenuOpen(false)
        setToolbarCollapsed(false)
    }, [pathname])

    // Listen for toolbar collapse events from DashboardFooter
    useEffect(() => {
        function handleToolbarCollapse(e) {
            setToolbarCollapsed(e.detail.collapsed)
        }
        window.addEventListener("stratlab:toolbar-collapse", handleToolbarCollapse)
        return () => window.removeEventListener("stratlab:toolbar-collapse", handleToolbarCollapse)
    }, [])

    // Close menu on outside click
    useEffect(() => {
        function handleClickOutside(e) {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false)
            }
        }
        if (menuOpen) {
            document.addEventListener('mousedown', handleClickOutside)
            return () => document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [menuOpen])

    function isLeavingStratlab(nextHref) {
        const isCurrentlyInStratlab = pathname.startsWith('/stratlab')
        const isStayingInStratlab = nextHref.startsWith('/stratlab')
        return isCurrentlyInStratlab && !isStayingInStratlab
    }

    function hasUnsavedStratlabChanges() {
        if (typeof window === 'undefined') return false
        return JSON.parse(sessionStorage.getItem(STRATLAB_DIRTY_FLAG_KEY) ?? 'false')
    }

    function handleStratlabLeave(e, href) {
        if (!isLeavingStratlab(href)) return

        if (hasUnsavedStratlabChanges()) {
            e.preventDefault()
            pendingHref.current = href
            setLeaveModal(true)
            return
        }

        clearSessionStorage()
    }

    return (
        <>
        <AlertModal
            open={leaveModal}
            title="Unsaved Changes"
            message="Changes you made may not be saved."
            confirmText="Leave"
            confirmVariant="danger"
            cancelText="Stay"
            cancelVariant="primary"
            onConfirm={() => {
                setLeaveModal(false)
                clearSessionStorage()
                router.push(pendingHref.current)
            }}
            onCancel={() => setLeaveModal(false)}
        />
        <nav className={`navbar ${pathname.startsWith('/stratlab') ? 'navbar--stratlab' : ''} ${toolbarCollapsed ? 'navbar--collapsed' : ''}`} ref={menuRef}>
            <div className='navbar-brand'>
                <Link href="/" onClick={(e) => handleStratlabLeave(e, "/")}>StratPad</Link>
            </div>

            <button
                className={`navbar-hamburger ${menuOpen ? 'navbar-hamburger--open' : ''}`}
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle menu"
            >
                <span />
                <span />
                <span />
            </button>

            <div className={`navbar-links ${menuOpen ? 'navbar-links--open' : ''}`}>
                {isMounted && session && <Link href="/home" onClick={(e) => handleStratlabLeave(e, "/home")} className={pathname === '/home' ? 'navbar-active' : ''}>Home</Link>}
                {isMounted && !session && <Link href="/stratlab" className={pathname === '/stratlab' ? 'navbar-active' : ''}>StratLab</Link>}
                <Link href="/community" onClick={(e) => handleStratlabLeave(e, "/community")} className={pathname === '/community' ? 'navbar-active' : ''}>Community</Link>
                <Link href="/about" onClick={(e) => handleStratlabLeave(e, "/about")} className={pathname === '/about' ? 'navbar-active' : ''}>About</Link>
                {!isMounted || isPending ? (
                    authHint === 'loggedIn'
                        ? <div className='navbar-skeleton navbar-skeleton--avatar' />
                        : <div className='navbar-skeleton navbar-skeleton--auth' />
                ) : session ? (
                    <AvatarDropdown />
                ) : (
                    <>
                        <Link href="/login" onClick={(e) => handleStratlabLeave(e, "/login")} className={`navbar-login ${pathname === '/login' ? 'navbar-active' : ''}`}>Login</Link>
                        <Link href="/signup" onClick={(e) => handleStratlabLeave(e, "/signup")} className={`navbar-signup ${pathname === '/signup' ? 'navbar-active' : ''}`}>Sign Up</Link>
                    </>
                )}
            </div>
        </nav>
        </>
    )
}