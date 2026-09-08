import { Button } from "@mui/material";


type CloneButtonProps = {
    onClick: () => void;
};

export default function CloneButton({ onClick }: CloneButtonProps) {
    return (
        <Button variant="contained" color="primary" onClick={onClick} sx={{ background: 'var(--gradient-button)', '&:hover': { background: 'var(--gradient-button)', filter: 'brightness(0.9)' } }}>
            Clone
        </Button>
    )
}