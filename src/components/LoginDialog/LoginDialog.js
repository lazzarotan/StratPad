"use client";

import { useState } from "react";
import {
    Dialog, DialogTitle, DialogContent,
    TextField, Button, Typography, Box, Link, IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { signIn } from "@/lib/auth-client";
import { useAppSnackbar } from "@/components/SnackbarProvider/SnackbarProvider";

export default function LoginDialog({ open, onClose, onSuccess, title = "Log in to save", subtitle = "Sign in to your account to save your dashboard." }) {
    const { showSnackbar } = useAppSnackbar();
    const [usernameOrEmail, setUsernameOrEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    function validate() {
        const newErrors = {};
        if (!usernameOrEmail.trim()) newErrors.usernameOrEmail = "Username or email is required";
        if (!password) newErrors.password = "Password is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);

        const value = usernameOrEmail.trim();
        const isEmail = value.includes("@") && value.includes(".");

        const callbacks = {
            onResponse: () => setIsSubmitting(false),
            onSuccess: () => {
                setUsernameOrEmail("");
                setPassword("");
                setErrors({});
                onSuccess?.();
            },
            onError: (ctx) => {
                setIsSubmitting(false);
                const message = ctx?.error?.message?.trim() || "Login failed";
                setErrors((prev) => ({ ...prev, form: message }));
                showSnackbar(message, "error");
            },
        };

        if (isEmail) {
            await signIn.email({ email: value, password }, callbacks);
        } else {
            await signIn.username({ username: value, password }, callbacks);
        }
    }

    function handleClose() {
        setUsernameOrEmail("");
        setPassword("");
        setErrors({});
        onClose();
    }

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
            <DialogTitle sx={{ fontFamily: "'Righteous', sans-serif", fontSize: '22px', pb: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {title}
                <IconButton size="small" onClick={handleClose} sx={{ color: 'var(--color-text-secondary)' }}>
                    <CloseIcon fontSize="small" />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <Typography sx={{ fontSize: '13px', color: 'var(--color-text-secondary)', mb: 2, mt: 0.5 }}>
                    {subtitle}
                </Typography>
                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        label="Username or Email"
                        size="small"
                        fullWidth
                        value={usernameOrEmail}
                        onChange={(e) => setUsernameOrEmail(e.target.value)}
                        error={!!errors.usernameOrEmail}
                        helperText={errors.usernameOrEmail}
                        autoComplete="username"
                        autoFocus
                    />
                    <TextField
                        label="Password"
                        type="password"
                        size="small"
                        fullWidth
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        error={!!errors.password || !!errors.form}
                        helperText={errors.password || errors.form}
                        autoComplete="current-password"
                    />
                    <Button
                        type="submit"
                        fullWidth
                        disabled={isSubmitting}
                        sx={{
                            background: 'var(--gradient-button)',
                            color: 'white',
                            textTransform: 'none',
                            fontWeight: 600,
                            borderRadius: '8px',
                            '&:hover': { background: 'var(--gradient-button)', filter: 'brightness(0.9)' },
                            '&.Mui-disabled': { opacity: 0.6, color: 'white' },
                        }}
                    >
                        {isSubmitting ? "Logging in..." : "Login"}
                    </Button>
                    <Typography sx={{ fontSize: '13px', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
                        Not a member?{' '}
                        <Link href="/signup" sx={{ color: 'var(--color-primary)', fontWeight: 600 }}>
                            Join here
                        </Link>
                    </Typography>
                </Box>
            </DialogContent>
        </Dialog>
    );
}
