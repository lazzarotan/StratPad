"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation";
import { updateUser, changeEmail, changePassword, isUsernameAvailable, deleteUser, signOut } from "@/lib/auth-client";
import { useAppSnackbar } from "@/components/SnackbarProvider/SnackbarProvider";
import "./AccountForm.css"

export default function AccountForm({ name, username, email, image }) {

    const [usernameValue, setUsernameValue] = useState("");
    const [usernameStatus, setUsernameStatus] = useState(null); // null | "checking" | "available" | "taken" | "invalid"
    const [emailValue, setEmailValue] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [activeTab, setActiveTab] = useState("profile");
    const [saving, setSaving] = useState(false);
    const { showSnackbar } = useAppSnackbar();
    const router = useRouter();
    const [deleteConfirm, setDeleteConfirm] = useState("");
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        if (username) setUsernameValue(username);
        if (email) setEmailValue(email);
    }, [username, email]);

    const initial = usernameValue
        ? usernameValue.charAt(0).toUpperCase()
        : "?";

    // Check username availability when it changes
    useEffect(() => {
        // Don't check if it's the same as the current username
        if (!usernameValue || usernameValue === username) {
            setUsernameStatus(null);
            return;
        }

        if (usernameValue.length < 5) {
            setUsernameStatus("invalid");
            return;
        }

        setUsernameStatus("checking");
        const timer = setTimeout(async () => {
            try {
                const { data } = await isUsernameAvailable({ username: usernameValue });
                setUsernameStatus(data?.available ? "available" : "taken");
            } catch {
                setUsernameStatus(null);
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [usernameValue, username]);

    const handleSave = async (label) => {
        if (usernameStatus === "taken") {
            showSnackbar("That username is already taken.", "error");
            return;
        }
        if (usernameValue && usernameValue.length < 5) {
            showSnackbar("Username must be at least 5 characters.", "error");
            return;
        }
        setSaving(true);
        try {
            await updateUser({ username: usernameValue });
            await changeEmail({ newEmail: emailValue });
            showSnackbar(`${label} updated successfully.`, "success");
        } catch (err) {
            showSnackbar("Something went wrong. Please try again.", "error");
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordSave = async () => {
        if (newPassword !== confirmPassword) {
            showSnackbar("New passwords don't match.", "error");
            return;
        }
        if (newPassword.length < 8) {
            showSnackbar("Password must be at least 8 characters.", "error");
            return;
        }
        setSaving(true);
        try {
            const { error } = await changePassword({ currentPassword, newPassword });
            if (error) {
                showSnackbar("Current password is incorrect.", "error");
                return;
            }
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            showSnackbar("Password changed successfully.", "success");
        } catch (err) {
            showSnackbar("Something went wrong. Please try again.", "error");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="account-page">

            {/* ── Page header strip ── */}
            <div className="account-header">
                <img
                    src="/icons/default-avatar.svg"
                    alt=""
                    className="account-header-decoration"
                />
                <div className="account-header-inner">
                    <h1 className="account-header-title">Account Settings</h1>
                    <p className="account-header-sub">
                        Manage your profile, security, and account preferences.
                    </p>
                </div>
            </div>

            {/* ── Card (sidebar + content pane) ── */}
            <div className="account-card-wrapper">
                <div className="account-card">

                    {/* ── Sidebar ── */}
                    <aside className="account-sidebar">

                        {/* Avatar block */}
                        <div className="account-sidebar-avatar-block">
                            {image ? (
                                <img
                                    src={image}
                                    alt="Profile avatar"
                                    className="account-sidebar-avatar account-sidebar-avatar--image"
                                />
                            ) : (
                                <div className="account-sidebar-avatar">
                                    {initial}
                                </div>
                            )}
                            <p className="account-sidebar-name">{usernameValue}</p>
                            <p className="account-sidebar-email">{emailValue}</p>
                        </div>

                        {/* Nav buttons */}
                        <nav className="account-sidebar-nav">
                            <button
                                className={`account-nav-btn ${activeTab === "profile" ? "account-nav-btn--active" : ""}`}
                                onClick={() => setActiveTab("profile")}
                            >
                                Profile
                            </button>
                            <button
                                className={`account-nav-btn ${activeTab === "security" ? "account-nav-btn--active" : ""}`}
                                onClick={() => setActiveTab("security")}
                            >
                                Security
                            </button>
                            <button
                                className={`account-nav-btn account-nav-btn--danger ${activeTab === "danger" ? "account-nav-btn--danger-active" : ""}`}
                                onClick={() => setActiveTab("danger")}
                            >
                                Danger Zone
                            </button>
                        </nav>

                    </aside>

                    {/* ── Content pane ── */}
                    <div className="account-content">

                        {/* PROFILE TAB */}
                        {activeTab === "profile" && (
                            <div className="account-tab">

                                <div className="account-section-title">
                                    <h3>Profile</h3>
                                    <p>Update how you appear across StratPad.</p>
                                </div>

                                {/* Avatar upload row */}
                                <div className="account-avatar-row">
                                    {image ? (
                                        <img
                                            src={image}
                                            alt="Profile avatar"
                                            className="account-avatar-preview account-avatar-preview--image"
                                        />
                                    ) : (
                                        <div className="account-avatar-preview">
                                            {initial}
                                        </div>
                                    )}
                                    <div>
                                        <p className="account-field-hint">Profile photo. JPG or PNG, max 2MB.</p>
                                        {/* TODO: needs file input, upload endpoint, and saving returned URL to user record */}
                                        {/* coordinate with backend */}
                                        <button
                                            className="account-btn-secondary"
                                            onClick={() => showSnackbar("Avatar upload coming soon!", "info")}
                                        >
                                            Upload Photo
                                        </button>
                                    </div>
                                </div>

                                <div className="account-divider" />

                                {/* Username */}
                                <div className="account-field">
                                    <label className="account-label">Username</label>
                                    <input
                                        className="account-input"
                                        type="text"
                                        value={usernameValue}
                                        onChange={(e) => setUsernameValue(e.target.value.replace(/\s/g, ""))}
                                        placeholder="your_username"
                                    />
                                    {usernameStatus === "checking" && (
                                        <p className="account-field-hint">Checking availability...</p>
                                    )}
                                    {usernameStatus === "available" && (
                                        <p className="account-field-hint account-field-hint--success">
                                            ✓ Username is available.
                                        </p>
                                    )}
                                    {usernameStatus === "taken" && (
                                        <p className="account-field-hint account-field-hint--error">
                                            Username is already taken.
                                        </p>
                                    )}
                                    {usernameStatus === "invalid" && (
                                        <p className="account-field-hint account-field-hint--error">
                                            Username must be at least 5 characters.
                                        </p>
                                    )}
                                    {usernameStatus === null && (
                                        <p className="account-field-hint">
                                            This is your unique name shown on the Community page. Min 5 characters.
                                        </p>
                                    )}
                                </div>

                                <div className="account-divider" />

                                {/* Email */}
                                <div className="account-field">
                                    <label className="account-label">Email Address</label>
                                    <input
                                        className="account-input"
                                        type="email"
                                        value={emailValue}
                                        onChange={(e) => setEmailValue(e.target.value)}
                                    />
                                    <p className="account-field-hint">
                                        Used for login and account notifications.
                                    </p>
                                </div>

                                <button
                                    className={`account-btn-primary ${saving ? "account-btn-primary--loading" : ""}`}
                                    onClick={() => handleSave("Profile")}
                                    disabled={saving || usernameStatus === "invalid"}
                                >
                                    {saving ? "Saving…" : "Save Changes"}
                                </button>

                            </div>
                        )}

                        {/* SECURITY TAB */}
                        {activeTab === "security" && (
                            <div className="account-tab">

                                <div className="account-section-title">
                                    <h3>Security</h3>
                                    <p>Update your password to keep your account secure.</p>
                                </div>

                                <div className="account-field">
                                    <label className="account-label">Current Password</label>
                                    <input
                                        className="account-input"
                                        type="password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        placeholder="Enter current password"
                                    />
                                </div>

                                <div className="account-divider" />

                                <div className="account-field">
                                    <label className="account-label">New Password</label>
                                    <input
                                        className="account-input"
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Enter new password"
                                    />
                                </div>

                                <div className="account-field">
                                    <label className="account-label">Confirm New Password</label>
                                    <input
                                        className="account-input"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Repeat new password"
                                    />
                                    {confirmPassword && newPassword !== confirmPassword && (
                                        <p className="account-field-hint account-field-hint--error">
                                            Passwords don't match.
                                        </p>
                                    )}
                                    {confirmPassword && newPassword === confirmPassword && (
                                        <p className="account-field-hint account-field-hint--success">
                                            ✓ Passwords match.
                                        </p>
                                    )}
                                </div>

                                <button
                                    className={`account-btn-primary ${saving ? "account-btn-primary--loading" : ""}`}
                                    onClick={handlePasswordSave}
                                    disabled={saving}
                                >
                                    {saving ? "Saving…" : "Update Password"}
                                </button>

                                <div className="account-divider" />

                            </div>
                        )}

                        {/* DANGER ZONE TAB */}
                        {activeTab === "danger" && (
                            <div className="account-tab">

                                <div className="account-section-title">
                                    <h3>Danger Zone</h3>
                                    <p>Irreversible actions that affect your account permanently.</p>
                                </div>

                                <div className="account-danger-box">

                                    {/* Delete row */}
                                    <div className="account-danger-row account-danger-row--delete">
                                        <p className="account-danger-delete-title">Delete Account</p>
                                        <p className="account-danger-delete-sub">
                                            This will permanently delete your account, all your dashboards, and remove you from the community. This cannot be undone.
                                        </p>
                                        <div className="account-field">
                                            <label className="account-label">
                                                Type <strong>DELETE</strong> to confirm
                                            </label>
                                            <input
                                                className="account-input"
                                                type="text"
                                                value={deleteConfirm}
                                                onChange={(e) => setDeleteConfirm(e.target.value)}
                                                placeholder="DELETE"
                                            />
                                        </div>
                                        <button
                                            className="account-btn-delete"
                                            disabled={deleteConfirm !== "DELETE" || deleting}
                                            onClick={async () => {
                                                setDeleting(true);
                                                const { error } = await deleteUser({
                                                    callbackURL: "/login",
                                                });
                                                if (error) {
                                                    showSnackbar(error.message || "Failed to delete account. Please try again.", "error");
                                                    setDeleting(false);
                                                    return;
                                                }
                                                await signOut();
                                                router.push("/login");
                                            }}
                                        >
                                            {deleting ? "Deleting…" : "Delete My Account"}
                                        </button>
                                    </div>

                                </div>

                            </div>
                        )}

                    </div>

                </div>
            </div>

        </div>
    )
}
