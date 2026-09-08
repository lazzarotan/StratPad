import { Grid, TextField } from "@mui/material";

export default function CoinTossEditForm({ editedModuleData, setEditedModuleData, onEdit }) {
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
        </Grid>
    );
}
