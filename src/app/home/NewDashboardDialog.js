import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Switch, FormControlLabel, Autocomplete
} from '@mui/material'

export default function NewDashboardDialog({ open, onClose, newDashboardForm, setNewDashboardForm, onSave, tags = [] }) {
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Create New Dashboard</DialogTitle>
            <DialogContent>
                <TextField
                    label="Title"
                    fullWidth
                    value={newDashboardForm.title}
                    onChange={(e) => setNewDashboardForm({ ...newDashboardForm, title: e.target.value })}
                    sx={{ mt: 2, mb: 2 }}
                />
                <TextField
                    label="Description"
                    fullWidth
                    multiline
                    rows={3}
                    value={newDashboardForm.description}
                    onChange={(e) => setNewDashboardForm({ ...newDashboardForm, description: e.target.value })}
                    sx={{ mb: 2 }}
                />
                <Autocomplete
                    multiple
                    options={tags}
                    disableCloseOnSelect
                    filterSelectedOptions
                    getOptionLabel={(option) => option.name}
                    isOptionEqualToValue={(option, value) => option.tagId === value.tagId}
                    value={tags.filter((tag) => (newDashboardForm.tagIds || []).includes(tag.tagId))}
                    onChange={(_, newValue) => setNewDashboardForm({
                        ...newDashboardForm,
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
                            checked={newDashboardForm.isPublic}
                            onChange={(e) => setNewDashboardForm({ ...newDashboardForm, isPublic: e.target.checked })}
                        />
                    }
                    label={newDashboardForm.isPublic ? 'Public' : 'Private'}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} sx={{ backgroundColor: 'var(--color-danger)', color: '#ffffff', '&:hover': { backgroundColor: 'var(--color-danger-dark)' } }}>Cancel</Button>
                <Button
                    variant="contained"
                    onClick={onSave}
                    sx={{ background: 'var(--gradient-button)', '&:hover': { background: 'var(--gradient-button)', filter: 'brightness(0.9)' } }}
                >
                    Create
                </Button>
            </DialogActions>
        </Dialog>
    )
}