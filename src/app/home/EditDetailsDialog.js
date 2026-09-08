import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Switch, FormControlLabel, Autocomplete
} from '@mui/material'

export default function EditDetailsDialog({ open, onClose, editForm, setEditForm, onSave, tags = [] }) {
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Edit Dashboard Details</DialogTitle>
            <DialogContent>
                <TextField
                    label="Title"
                    fullWidth
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    sx={{ mt: 2, mb: 2 }}
                />
                <TextField
                    label="Description"
                    fullWidth
                    multiline
                    rows={3}
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    sx={{ mb: 2 }}
                />
                <Autocomplete
                    multiple
                    options={tags}
                    disableCloseOnSelect
                    filterSelectedOptions
                    getOptionLabel={(option) => option.name}
                    isOptionEqualToValue={(option, value) => option.tagId === value.tagId}
                    value={tags.filter((tag) => (editForm.tagIds || []).includes(tag.tagId))}
                    onChange={(_, newValue) => setEditForm({
                        ...editForm,
                        tagIds: newValue.map((tag) => tag.tagId),
                    })}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Tags"
                            placeholder="Select tags"
                            sx={{ mb: 2 }}
                        />
                    )}
                />
                <FormControlLabel
                    control={
                        <Switch
                            checked={editForm.isPublic}
                            onChange={(e) => setEditForm({ ...editForm, isPublic: e.target.checked })}
                        />
                    }
                    label={editForm.isPublic ? 'Public' : 'Private'}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} sx={{ color: 'white', backgroundColor: 'var(--color-danger)', '&:hover': { backgroundColor: 'var(--color-danger-dark)' } }}>Cancel</Button>
                <Button
                    variant="contained"
                    onClick={onSave}
                    sx={{ background: 'var(--gradient-button)', '&:hover': { background: 'var(--gradient-button)', filter: 'brightness(0.9)' } }}
                >
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    )
}