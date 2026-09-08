import { Grid, TextField } from "@mui/material";

export default function NotesEditForm({ editedModuleData, setEditedModuleData, onEdit }){


    const handleTitleChange = (e) => {
        setEditedModuleData({ ...editedModuleData, title: e.target.value });
        onEdit();
    }

    return (
        <Grid container spacing={2}>
            <Grid size={12}>
                <TextField
                    label="Title"
                    value={editedModuleData.title}
                    onChange={handleTitleChange}
                />
            </Grid>
        </Grid>
    )
}
