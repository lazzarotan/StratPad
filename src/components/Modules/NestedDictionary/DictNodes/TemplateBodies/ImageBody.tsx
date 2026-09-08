import { Box, Modal } from "@mui/material";
import { useEffect, useState } from "react";
import "./ImageBody.css";


interface ImageBodyProps {
    imageAssetId: number;
}

export default function ImageBody({ imageAssetId }: ImageBodyProps) {

    const [isFullscreen, setIsFullscreen] = useState(false);
    const [fallbackMessage, setFallbackMessage] = useState<string | null>(null);
    

    useEffect(() => {
        if (imageAssetId) {
            setFallbackMessage(null);
        } else {
            setFallbackMessage("No image selected");
        }
    }, [imageAssetId]);
    

    
 
 
    return (
        <>
        {fallbackMessage
            ? <div>{fallbackMessage}</div>
            : (
                <>
                    <div className="image-body" onClick={() => setIsFullscreen(true)}>
                        <img
                            className="image-body-preview"
                            src={`/api/images/${imageAssetId}`}
                            alt="Uploaded Image"
                        />
                    </div>
                    <Modal open={isFullscreen} onClose={() => setIsFullscreen(false)}>
                        <Box
                            className="image-body-fullscreen-container"
                            onClick={() => setIsFullscreen(false)}
                        >
                            <img
                                src={`/api/images/${imageAssetId}`}
                                alt="Uploaded Image"
                                className="image-body-fullscreen"
                            />
                        </Box>
                    </Modal>
                </>
            )}
        </>
    )
}