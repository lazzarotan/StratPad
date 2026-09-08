import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material'

export default function DeleteDialog({ open, onClose, onConfirm }) {
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Delete Dashboard</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Are you sure you want to delete this dashboard? This action cannot be undone.
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} sx={{ background: 'var(--gradient-button)', color: '#ffffff', '&:hover': { background: 'var(--gradient-button)', filter: 'brightness(0.9)' } }}>Cancel</Button>
                <Button onClick={onConfirm} sx={{ backgroundColor: 'var(--color-danger)', color: '#ffffff', '&:hover': { backgroundColor: 'var(--color-danger-dark)' } }}>Delete</Button>
            </DialogActions>
        </Dialog>
    )
}