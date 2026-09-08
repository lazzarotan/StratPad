import { Box, Typography, TextField, InputAdornment, Button } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import AddIcon from '@mui/icons-material/Add'

export default function HomeHeader({ count, searchTerm, onSearchChange, onNewDashboard }) {
    return (
        <Box sx={{
            background: 'var(--gradient-brand)',
            px: 5, py: 6,
        }}>
            <Box sx={{
                maxWidth: '1200px', mx: 'auto',
                display: 'flex', alignItems: 'flex-end',
                justifyContent: 'space-between',
                flexWrap: 'wrap', gap: 2,
            }}>
                <Box>
                    <Typography sx={{
                        fontFamily: "'Righteous', sans-serif",
                        fontSize: '32px', color: 'white',
                    }}>
                        My Dashboards
                    </Typography>
                    <Typography sx={{
                        fontSize: '15px',
                        color: 'rgba(255,255,255,0.75)',
                        mt: 0.5,
                    }}>
                        {count} dashboard{count !== 1 ? 's' : ''} created
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Button
                        startIcon={<AddIcon />}
                        onClick={onNewDashboard}
                        sx={{
                            bgcolor: 'rgba(255,255,255,0.15)',
                            color: 'white',
                            textTransform: 'none',
                            fontWeight: 600,
                            borderRadius: '8px',
                            border: '1px solid rgba(255,255,255,0.3)',
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' },
                        }}
                    >
                        New Dashboard
                    </Button>

                <TextField
                    size="small"
                    placeholder="Search dashboards..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ color: 'var(--color-text-secondary)', fontSize: 20 }} />
                            </InputAdornment>
                        ),
                    }}
                    sx={{
                        width: 260,
                        bgcolor: 'rgba(255,255,255,0.95)',
                        borderRadius: '8px',
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '8px', fontSize: '14px',
                        },
                    }}
                />
                </Box>
            </Box>
        </Box>
    )
}