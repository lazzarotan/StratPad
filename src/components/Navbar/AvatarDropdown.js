"use client";

import { useRef, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { signOut, useSession } from "@/lib/auth-client";
import AlertModal from "@/components/AlertModal/AlertModal";

const STRATLAB_DIRTY_FLAG_KEY = "stratlab:isDirty";

export default function AvatarDropdown() {
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const router = useRouter();
    const pathname = usePathname();
    const [leaveModal, setLeaveModal] = useState(false);
    const pendingHref = useRef(null);

    function hasUnsavedStratlabChanges() {
        if (typeof window === 'undefined') return false
        return JSON.parse(sessionStorage.getItem(STRATLAB_DIRTY_FLAG_KEY) ?? 'false')
    }

    function handleNavigate(href) {
        setIsOpen(false)
        const isInStratlab = pathname.startsWith('/stratlab')
        if (isInStratlab && hasUnsavedStratlabChanges()) {
            pendingHref.current = href
            setLeaveModal(true)
        } else {
            router.push(href)
        }
    }

    useEffect(() => {
        function handleClickOutside(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const username = session?.user?.username || "";
    const image = session?.user?.image;
    const initial = username
        ? username.charAt(0).toUpperCase()
        : "?";

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
                router.push(pendingHref.current)
            }}
            onCancel={() => setLeaveModal(false)}
        />
        <div className="avatar-dropdown" ref={dropdownRef}>
            <button
                className="navbar-avatar"
                onClick={() => setIsOpen(!isOpen)}
            >
                {image ? (
                    <img
                        src={image}
                        alt="Profile avatar"
                        className="navbar-avatar-image"
                    />
                ) : (
                    initial
                )}
            </button>

            {isOpen && (
                <div className="avatar-menu">
                    <div className="avatar-menu-header">
                        <span className="avatar-menu-name">{session?.user?.username}</span>
                        <span className="avatar-menu-email">{session?.user?.email}</span>
                    </div>
                    <div className="avatar-menu-divider" />
                    <button className="avatar-menu-item" onClick={() => handleNavigate('/account')}>
                        Settings
                    </button>
                    <div className="avatar-menu-divider" />
                    <button
                        className="avatar-menu-item avatar-menu-logout"
                        onClick={() => signOut({
                            fetchOptions: {
                                onSuccess: () => {
                                    router.push("/login");
                                },
                            },
                        })}
                    >
                        Log out
                    </button>
                </div>
            )}
        </div>
        </>
    );
}