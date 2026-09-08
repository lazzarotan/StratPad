import { Box, Skeleton } from '@mui/material'

export default function CommunitySkeletonCard() {
    return (
        <Box sx={{
            bgcolor: 'white',
            borderRadius: '12px',
            border: '1px solid var(--color-border)',
            p: '16px 20px 20px',
        }}>
            <Skeleton variant="text" width="60%" height={28} />
            <Skeleton variant="text" width="40%" height={16} sx={{ mt: 0.5 }} />
            <Skeleton variant="text" width="100%" height={18} sx={{ mt: 1 }} />
            <Skeleton variant="text" width="80%" height={18} />
            <Box sx={{ display: 'flex', gap: 0.5, mt: 1.5 }}>
                <Skeleton variant="rounded" width={50} height={22} sx={{ borderRadius: '20px' }} />
                <Skeleton variant="rounded" width={60} height={22} sx={{ borderRadius: '20px' }} />
            </Box>
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mt: 2, pt: 1.75,
                borderTop: '1px solid #f3f4f6',
            }}>
                <Skeleton variant="text" width={80} height={16} />
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Skeleton variant="rounded" width={60} height={30} sx={{ borderRadius: '8px' }} />
                    <Skeleton variant="rounded" width={60} height={30} sx={{ borderRadius: '8px' }} />
                </Box>
            </Box>
        </Box>
    )
}
