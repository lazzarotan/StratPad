"use client"

import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { styled } from '@mui/material/styles';
import React, { useState } from 'react';
import { useSession, MODULE_SESSION_PREFIX } from '@/client_API_calls/session_storage/useSession';
import './SingleImage.css';
import ModuleHeader from '../ModuleHeader.js/ModuleHeader';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import { MODULE_DEFINITIONS } from '@/module_definitions/module_definitions';

    
export default function SingleImage({ id, onRemove, onSettings }) {

    const [data, setData] = useSession(
        `${MODULE_SESSION_PREFIX}${id}`,
        MODULE_DEFINITIONS.singleImage.defaultData
    )

    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showResetConfirm, setShowResetConfirm] = useState(false);

    //Snackbar used to display error messages.
        //Success is quiet, user can see if image is present/deleted in the UI.
    const [snackbarState, setSnackbarState] = useState({
        open: false,
        message: '',
        severity: 'success',
    });

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarState((prev) => ({ ...prev, open: false }));
    };

    
    const handleImageUpload = async (event) => {
        const file = event.target.files[0];

        //If file extension is not .jpg, .jpeg, or .png, show error.
        if (!file.name.match(/\.(jpg|jpeg|png|webp)$/)) {
            setSnackbarState({
                open: true,
                message: "Please upload a valid image file (jpg, jpeg, png, or webp)",
                severity: "error",
            });
            return;
        }

        //If file size is greater than 10MB, show error.
        if (file.size > 10 * 1024 * 1024) {
            setSnackbarState({
                open: true,
                message: "Please upload an image smaller than 10MB",
                severity: "error",
            });
            return;
        }

        //Create a new FormData object to send the file to the server.
        const formData = new FormData();
        formData.append("image", file);

        //Send the file to the server.
        const response = await fetch("/api/images/", {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            let errorMessage = "Failed to upload image";
            try {
                const errorBody = await response.json();
                if (errorBody?.error) {
                    errorMessage = errorBody.error;
                }
            } catch {
                // ignore JSON parse errors and fall back to default message
            }
            setSnackbarState({
                open: true,
                message: errorMessage,
                severity: "error",
            });
            return;
        }

        const { imageAssetId } = await response.json();
        setData({ ...data, imageAssetId });
    }


    console.log("isFullscreen: ", isFullscreen);

    const VisuallyHiddenInput = styled('input')({
        clip: 'rect(0 0 0 0)',
        clipPath: 'inset(50%)',
        height: 1,
        overflow: 'hidden',
        position: 'absolute',
        bottom: 0,
        left: 0,
        whiteSpace: 'nowrap',
        width: 1,
    });



    const handleReset = () => {
        if (data.imageAssetId) {
            setShowResetConfirm(true);
        } else {
            setData({ ...data, imageAssetId: null });
        }
    };

    const handleConfirmReset = () => {
        setShowResetConfirm(false);
        setData({ ...data, imageAssetId: null });
    };

    return (
        <div className="single-image-container">
            <ModuleHeader
                title={data.title}
                onTitleChange={(newTitle) => setData({ ...data, title: newTitle })}
                onSettings={() => onSettings(id)}
                onRemove={() => onRemove(id)}
                onReset={handleReset}
            />
            <div className="single-image-body">
                {data.imageAssetId ? (
                    <div
                        className="single-image-click-target"
                        onClick={() => setIsFullscreen(!isFullscreen)}
                    >
                        <img 
                            src={`/api/images/${data.imageAssetId}`} 
                            alt="Uploaded Image" 
                            className="single-image-preview"
                        />
                    </div>
                ) : (
                    <Button
                        component="label"
                        role={undefined}
                        variant="contained"
                        tabIndex={-1}
                        startIcon={<CloudUploadIcon />}
                        sx={{ background: 'var(--gradient-button)', '&:hover': { background: 'var(--gradient-button)', filter: 'brightness(0.9)' } }}
                    >
                        Upload Image
                        <VisuallyHiddenInput
                            type="file"
                            onChange={(event) => handleImageUpload(event)}
                        />
                    </Button>
                )}
            </div>
            <Modal open={isFullscreen} onClose={() => setIsFullscreen(false)}>
                <Box className="single-image-fullscreen-container">
                    <img src={`/api/images/${data.imageAssetId}`} 
                    alt="Uploaded Image" className="single-image-fullscreen"
                    onClick={() => setIsFullscreen(false)}
                    />
                </Box>
            </Modal>

            <Modal open={showResetConfirm} onClose={() => setShowResetConfirm(false)}>
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: 'var(--color-bg-module)',
                    padding: '2rem',
                    borderRadius: '0.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '1rem',
                }}>
                    <span style={{ color: 'var(--color-text)', fontSize: '1rem' }}>
                        Are you sure you want to reset? This will remove the current image.
                    </span>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <Button
                            variant="contained"
                            sx={{ backgroundColor: 'var(--color-danger)', '&:hover': { backgroundColor: 'var(--color-danger-dark)' } }}
                            onClick={handleConfirmReset}
                        >
                            Reset
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={() => setShowResetConfirm(false)}
                        >
                            Cancel
                        </Button>
                    </div>
                </Box>
            </Modal>

            <Snackbar
                open={snackbarState.open}
                autoHideDuration={2500}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            >
                <Alert
                    onClose={handleSnackbarClose}
                    severity={snackbarState.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbarState.message}
                </Alert>
            </Snackbar>
        </div>
    );
}
