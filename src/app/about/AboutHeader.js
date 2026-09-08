import { Box, Typography } from '@mui/material'
import FloatingIconsBackground from '@/components/FloatingIconsBackground/FloatingIconsBackground'

export default function AboutHeader() {
    return (
        <Box sx={{
            background: 'var(--gradient-brand)',
            px: 5, py: 6,
            position: 'relative',
            overflow: 'hidden',
        }}>
            <FloatingIconsBackground />
            <Box sx={{ maxWidth: '1200px', mx: 'auto', position: 'relative' }}>
                <Typography sx={{
                    fontFamily: "'Righteous', sans-serif",
                    fontSize: '32px', color: 'white',
                }}>
                    About
                </Typography>
                <Typography sx={{
                    fontSize: '15px',
                    color: 'rgba(255,255,255,0.75)',
                    mt: 0.5,
                }}>
                    Learn more about StratPad and the team behind it
                </Typography>
            </Box>
        </Box>
    )
}
