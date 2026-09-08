"use client";

import { createContext, useContext, useMemo, useState } from "react";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

const SnackbarContext = createContext(null);

export default function SnackbarProvider({ children }) {
    const [snackbarState, setSnackbarState] = useState({
        open: false,
        message: "",
        severity: "success",
    });

    function showSnackbar(message, severity = "success") {
        setSnackbarState({
            open: true,
            message,
            severity,
        });
    }

    function handleClose(_, reason) {
        if (reason === "clickaway") return;

        setSnackbarState((prev) => ({
            ...prev,
            open: false,
        }));
    }

    const value = useMemo(() => ({
        showSnackbar,
    }), []);

    return (
        <SnackbarContext.Provider value={value}>
            {children}

            <Snackbar
                open={snackbarState.open}
                autoHideDuration={2500}
                onClose={handleClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
                <Alert
                    onClose={handleClose}
                    severity={snackbarState.severity}
                    variant="filled"
                    sx={{ width: "100%" }}
                >
                    {snackbarState.message}
                </Alert>
            </Snackbar>
        </SnackbarContext.Provider>
    );
}

export function useAppSnackbar() {
    const context = useContext(SnackbarContext);

    if (!context) {
        throw new Error("useAppSnackbar must be used within SnackbarProvider.");
    }

    return context;
}