import { Box, Skeleton } from '@mui/material'

export default function SkeletonCard() {
    return (
        <Box sx={{
            bgcolor: 'white',
            borderRadius: '12px',
            border: '1px solid var(--color-border)',
            p: '16px 20px 20px',
        }}>
            <Skeleton variant="text" width="60%" height={28} />
            <Skeleton variant="text" width="100%" height={18} sx={{ mt: 1 }} />
            <Skeleton variant="text" width="80%" height={18} />
            <Skeleton variant="rounded" width={70} height={24} sx={{ mt: 2, borderRadius: '20px' }} />
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mt: 2, pt: 1.75,
                borderTop: '1px solid #f3f4f6',
            }}>
                <Skeleton variant="text" width={80} height={16} />
                <Skeleton variant="rounded" width={80} height={34} sx={{ borderRadius: '8px' }} />
            </Box>
        </Box>
    )
}