import { Grid, TextField, Button } from "@mui/material";

export default function SingleImageEditForm({ editedModuleData, setEditedModuleData, onEdit }) {

    const handleDeleteImage = () => {
        setEditedModuleData({ ...editedModuleData, imageAssetId: null });
        onEdit();
    };

    return (
        <Grid container spacing={2}>
            <Grid size={12}>
                <TextField
                    label="Module Title"
                    value={editedModuleData.title ?? ""}
                    onChange={(e) => {
                        setEditedModuleData({ ...editedModuleData, title: e.target.value });
                        onEdit();
                    }}
                    fullWidth
                />
            </Grid>
            {editedModuleData.imageAssetId && (
                <Grid size={12}>
                    <Button
                        variant="contained"
                        sx={{
                            backgroundColor: 'var(--color-danger)',
                            '&:hover': { backgroundColor: 'var(--color-danger-dark)' },
                        }}
                        onClick={handleDeleteImage}
                        fullWidth
                    >
                        Delete Image
                    </Button>
                </Grid>
            )}
        </Grid>
    );
}
