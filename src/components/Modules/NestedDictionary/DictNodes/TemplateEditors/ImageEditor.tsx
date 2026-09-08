import { styled } from "@mui/material/styles";
import {useEffect, useState } from "react";
import "./ImageEditor.css";
import { Button, Snackbar } from "@mui/material";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Alert from '@mui/material/Alert';

interface ImageEditorProps {
    imageAssetId: number | null;
    onChange: (imageAssetId: number | null) => void;
}

export default function ImageEditor({ imageAssetId, onChange }: ImageEditorProps) {


    const [editedImageAssetId, setEditedImageAssetId] = useState(imageAssetId);

    useEffect(() => {
        console.log("ImageEditor: editedImageAssetId: ", editedImageAssetId);
    }, [editedImageAssetId]);

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

        const { imageAssetId: newImageAssetId } = await response.json();
        setEditedImageAssetId(newImageAssetId);
        onChange(newImageAssetId);
    }


    const handleImageDelete = async () => {
        const response = await fetch(`/api/images/${imageAssetId}`, {
            method: "DELETE",
        });
        if (!response.ok) {
            setSnackbarState({
                open: true,
                message: "Failed to delete image",
                severity: "error",
            });
            return;
        }
        setEditedImageAssetId(null);
        onChange(null);
    }

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

    return (
        <div className="image-editor">
            {editedImageAssetId ? (
                <div className="image-preview">
                    <img
                        className="image-preview-image"
                        src={`/api/images/${editedImageAssetId}`}
                        alt="Uploaded Image"
                    />
                </div>
            ) : null}
            <Button
                component="label"
                role={undefined}
                variant="contained"
                tabIndex={-1}
                startIcon={<CloudUploadIcon />}
            >
                Upload Image
                <VisuallyHiddenInput
                    type="file"
                    onChange={(event) => handleImageUpload(event)}
                />
            </Button>
        </div>
    );

}
