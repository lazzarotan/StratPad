import { Box, Typography } from '@mui/material'

export default function CommunityHeader() {
    return (
        <Box sx={{
            background: 'var(--gradient-brand)',
            px: 5, py: 6,
            position: 'relative',
            overflow: 'hidden',
        }}>
    
            <Box
                component="img"
                src="/globe-community.svg"
                alt=""
                sx={{
                    position: 'absolute',
                    bottom: '-110%',
                    right: '-5%',
                    width: '350px',
                    height: '350px',
                    opacity: 0.12,
                    pointerEvents: 'none',
                    filter: 'brightness(0) invert(1)',
                }}
            />

            <Box sx={{ maxWidth: '1200px', mx: 'auto', position: 'relative' }}>
                <Typography sx={{
                    fontFamily: "'Righteous', sans-serif",
                    fontSize: '32px', color: 'white',
                }}>
                    Community Dashboards
                </Typography>
                <Typography sx={{
                    fontSize: '15px',
                    color: 'rgba(255,255,255,0.75)',
                    mt: 0.5,
                }}>
                    Browse and discover public dashboards
                </Typography>
            </Box>
        </Box>
    )
}
