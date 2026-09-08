import { useState } from 'react'
import { Box, Typography, IconButton, Button, Chip, Popover } from '@mui/material'
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined'

function formatTimeAgo(dateString) {
    const seconds = Math.floor((Date.now() - new Date(dateString)) / 1000)
    if (seconds < 60) return 'Just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`
    return new Date(dateString).toLocaleDateString()
}

const cardSx = {
    bgcolor: 'white',
    borderRadius: '12px',
    border: '1px solid var(--color-border)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.25s ease, box-shadow 0.25s ease',
    '&:hover': {
        transform: 'translateY(-6px)',
        boxShadow: '0 12px 32px rgba(139, 92, 246, 0.15)',
    },
}

const playBtnSx = {
    background: 'var(--gradient-button)',
    color: '#ffffff',
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '13px',
    borderRadius: '8px',
    px: 2,
    '&:hover': { background: 'var(--gradient-button)', filter: 'brightness(0.9)' },
}

const editBtnSx = {
    backgroundColor: 'transparent',
    color: 'var(--color-text-secondary)',
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '13px',
    borderRadius: '8px',
    px: 2,
    border: '1px solid var(--color-border)',
    '&:hover': { backgroundColor: 'var(--color-bg-hover)' },
}

export default function DashboardCard({ dashboard, onPlay, onEdit, onMenuOpen }) {
    const [tagAnchorEl, setTagAnchorEl] = useState(null)

    const visibleTags = dashboard.tags?.slice(0, 3) || []; //limiting how many tags are shown
    const hiddenTags = dashboard.tags?.slice(3) || [];
    const remainingTagCount = hiddenTags.length;

    return (
        <Box sx={cardSx}>
            <Box sx={{ p: '16px 20px 20px', display: 'flex', flexDirection: 'column', flex: 1 }}>

                {/* Title + menu button */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
                    <Typography sx={{
                        fontFamily: "'Righteous', sans-serif",
                        fontSize: '17px',
                        color: 'var(--color-text-primary)',
                        lineHeight: 1.3,
                    }}>
                        {dashboard.title}
                    </Typography>
                    <IconButton
                        size="small"
                        onClick={(e) => onMenuOpen(e, dashboard.dashboardId)}
                        sx={{ color: 'var(--color-text-secondary)', flexShrink: 0, '&:hover': { bgcolor: 'var(--color-bg-hover)' } }}
                    >
                        <MoreVertIcon fontSize="small" />
                    </IconButton>
                </Box>

                {/* Description */}
                <Typography sx={{
                    fontSize: '13px',
                    color: 'var(--color-text-secondary)',
                    lineHeight: 1.5,
                    mt: 1,
                    mb: 1.75,
                    flex: 1,
                }}>
                    {dashboard.description || 'No description'}
                </Typography>

                {/* Tags */}
                {dashboard.tags?.length > 0 && (
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1.75 }}>
                        {visibleTags.map((tag) => (
                            <Chip
                                key={tag.tagId}
                                label={tag.name}
                                size="small"
                                sx={{
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    height: '22px',
                                    bgcolor: '#ede9fe',
                                    color: 'var(--color-primary-hover)',
                                }}
                            />
                        ))}

                        {remainingTagCount > 0 && (
                            <>
                                <Chip
                                    label={`+${remainingTagCount}`}
                                    size="small"
                                    onClick={(e) => setTagAnchorEl(e.currentTarget)}
                                    sx={{
                                        fontSize: '11px',
                                        fontWeight: 600,
                                        height: '22px',
                                        bgcolor: '#f3f4f6',
                                        color: 'var(--color-text-secondary)',
                                        cursor: 'pointer',
                                    }}
                                />

                                <Popover
                                    open={Boolean(tagAnchorEl)}
                                    anchorEl={tagAnchorEl}
                                    onClose={() => setTagAnchorEl(null)}
                                    anchorOrigin={{
                                        vertical: 'bottom',
                                        horizontal: 'left',
                                    }}
                                    transformOrigin={{
                                        vertical: 'top',
                                        horizontal: 'left',
                                    }}
                                    slotProps={{
                                        paper: {
                                            sx: {
                                                p: 1.5,
                                                maxWidth: 240,
                                                borderRadius: '10px',
                                            },
                                        },
                                    }}
                                >
                                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                        {hiddenTags.map((tag) => (
                                            <Chip
                                                key={tag.tagId}
                                                label={tag.name}
                                                size="small"
                                                sx={{
                                                    fontSize: '11px',
                                                    fontWeight: 600,
                                                    height: '22px',
                                                    bgcolor: '#ede9fe',
                                                    color: 'var(--color-primary-hover)',
                                                }}
                                            />
                                        ))}
                                    </Box>
                                </Popover>
                            </>
                        )}
                    </Box>
                )}

                {/* Visibility badge */}
                <Box sx={{ mb: 1.75 }}>
                    <Chip
                        icon={dashboard.isPublic
                            ? <PublicOutlinedIcon sx={{ fontSize: 14 }} />
                            : <LockOutlinedIcon sx={{ fontSize: 14 }} />
                        }
                        label={dashboard.isPublic ? 'Public' : 'Private'}
                        size="small"
                        onClick={() => onTogglePublic(dashboard.dashboardId, dashboard.isPublic)}
                        sx={{
                            fontSize: '11px',
                            fontWeight: 600,
                            height: '24px',
                            cursor: 'pointer',
                            bgcolor: dashboard.isPublic ? '#ede9fe' : '#f3f4f6',
                            color: dashboard.isPublic ? 'var(--color-primary-hover)' : 'var(--color-text-secondary)',
                            '& .MuiChip-icon': { color: 'inherit' },
                            '&:hover': { filter: 'brightness(0.95)' },
                        }}
                    />
                </Box>

                {/* Footer */}
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderTop: '1px solid #f3f4f6',
                    pt: 1.75,
                }}>
                    <Typography sx={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                        Updated {formatTimeAgo(dashboard.updatedAt)}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                            size="small"
                            onClick={() => onEdit(dashboard.dashboardId)}
                            sx={{ ...editBtnSx, minWidth: 0, p: '6px' }}
                        >
                            <EditRoundedIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                            size="small"
                            onClick={() => onPlay(dashboard.dashboardId)}
                            sx={{ ...playBtnSx, minWidth: 0, p: '6px' }}
                        >
                            <PlayArrowRoundedIcon fontSize="small" />
                        </IconButton>
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}