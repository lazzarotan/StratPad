import { Box, Typography } from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'

export default function NewDashboardCard({ onClick }) {
    return (
        <Box
            onClick={onClick}
            sx={{
                border: '2px dashed #d8b4fe',
                borderRadius: '12px',
                bgcolor: '#fdfcff',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 8,
                px: 3,
                cursor: 'pointer',
                minHeight: '230px',
                transition: 'all 0.25s ease',
                '&:hover': {
                    borderColor: 'var(--color-primary)',
                    bgcolor: '#faf5ff',
                    transform: 'translateY(-6px)',
                    boxShadow: '0 12px 32px rgba(139, 92, 246, 0.15)',
                },
            }}
        >
            <Box sx={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                bgcolor: 'var(--color-bg-hover)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
            }}>
                <AddRoundedIcon sx={{ fontSize: 32, color: 'var(--color-primary)' }} />
            </Box>

            <Typography sx={{
                fontFamily: "'Righteous', sans-serif",
                fontSize: '17px',
                color: 'var(--color-text-primary)',
            }}>
                Create New Dashboard
            </Typography>

            <Typography sx={{
                fontSize: '13px',
                color: 'var(--color-text-secondary)',
                mt: 0.5,
            }}>
                Head to StratLab to start building
            </Typography>
        </Box>
    )
}