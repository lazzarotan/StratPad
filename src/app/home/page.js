'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from '@/lib/auth-client'
import {
    Box, Typography, Menu, MenuItem, ListItemIcon, ListItemText, Divider
} from '@mui/material'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import HomeHeader from './HomeHeader'
import DashboardCard from './DashboardCard'
import NewDashboardCard from './NewDashboardCard'
import SkeletonCard from './SkeletonCard'
import DeleteDialog from './DeleteDialog'
import EditDetailsDialog from './EditDetailsDialog'
import NewDashboardDialog from './NewDashboardDialog'
import { clearSessionStorage } from "@/client_API_calls/session_storage/session_storage_utils"
import { useAppSnackbar } from "@/components/SnackbarProvider/SnackbarProvider"


export default function HomePage() {
    const router = useRouter()
    const [dashboards, setDashboards] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(true)

    // Dropdown menu state
    const [menuAnchor, setMenuAnchor] = useState(null)
    const [menuDashboardId, setMenuDashboardId] = useState(null)

    // Dialog state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [newDashboardDialogOpen, setNewDashboardDialogOpen] = useState(false)

    //Form state for New/Edit Dashboard Dialogs
    const [newDashboardForm, setNewDashboardForm] = useState({ title: '', description: '', isPublic: false, tagIds: [] })
    const [editForm, setEditForm] = useState({ title: '', description: '', isPublic: false, tagIds: [] })

    const [tags, setTags] = useState([])

    const { data: session, isPending } = useSession()
    const { showSnackbar } = useAppSnackbar()

    useEffect(() => {
        if (!isPending && !session) router.push('/login')
    }, [session, isPending, router])

    useEffect(() => {
        fetch('/api/tags')
            .then(res => res.json())
            .then(data => {
                setTags(data.tags || [])
            })
            .catch(err => {
                console.error(err)
            })
    }, [])


    //Load dashboards
        //Occurs on load, and reloads every time edit dialog is closed.
    useEffect(() => {
        if (editDialogOpen || deleteDialogOpen) return
        fetch('/api/dashboards?mine=true')
            .then(res => res.json())
            .then(data => {
                if (data.success) setDashboards(data.dashboards)
                else setError(data.error ?? 'Failed to load dashboards')
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false))
    }, [editDialogOpen, deleteDialogOpen])

    //Filter dashboard list
    const filteredDashboards = dashboards.filter(db => {
        const term = searchTerm.toLowerCase()
        return db.title.toLowerCase().includes(term)
            || (db.description && db.description.toLowerCase().includes(term))
    })

    function handleMenuOpen(event, dashboardId) {
        setMenuAnchor(event.currentTarget)
        setMenuDashboardId(dashboardId)
    }

    function handleMenuClose() {
        setMenuAnchor(null)
        setMenuDashboardId(null)
    }


    //Handles edit to dashboard metadata
        //Triggers reload of dashboards
    function handleDashboardUpdate() {
        fetch(`/api/dashboards/${menuDashboardId}`, {
            method: 'PUT',
            body: JSON.stringify({
                title: editForm.title,
                description: editForm.description,
                isPublic: editForm.isPublic,
                tagIds: editForm.tagIds,
            }),
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                setEditDialogOpen(false)
                setMenuDashboardId(null)
            } else {
                console.error(data.message)
                setError("Failed to update dashboard")
            }
        })   
        .catch(err => {
            console.error(err)
            setError("Failed to update dashboard")
        })
    }

    //When New Dashboard Dialog is saved
        //Triggers redirect to the new dashboard
    function handleDashboardCreation() {
        setNewDashboardDialogOpen(false)
        
        fetch('/api/dashboards', {
            method: 'POST',
            body: JSON.stringify({
                title: newDashboardForm.title,
                description: newDashboardForm.description,
                isPublic: newDashboardForm.isPublic,
                tagIds: newDashboardForm.tagIds,
            }),
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                router.push(`/stratlab/${data.dashboardId}`)
            } else {
                console.error(data.message)
                setError("Failed to create dashboard")
            }
        })
        .catch(err => {
            console.error(err)
            setError("Failed to create dashboard")
        })
    }

    function handleTogglePublic(id, currentIsPublic) {
        const newIsPublic = !currentIsPublic
        // Optimistic update
        setDashboards(prev => prev.map(d => d.dashboardId === id ? { ...d, isPublic: newIsPublic } : d))
        fetch(`/api/dashboards/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ isPublic: newIsPublic }),
        })
        .then(res => res.json())
        .then(data => {
            if (!data.success) {
                // Revert on failure
                setDashboards(prev => prev.map(d => d.dashboardId === id ? { ...d, isPublic: currentIsPublic } : d))
                showSnackbar("Failed to update visibility.", "error")
            }
        })
        .catch(() => {
            setDashboards(prev => prev.map(d => d.dashboardId === id ? { ...d, isPublic: currentIsPublic } : d))
            showSnackbar("Failed to update visibility.", "error")
        })
    }

    //Handle Delete Dialog
        //Triggers reload of dashboards
    function handleDashboardDelete(id) {
        fetch(`/api/dashboards/${id}`, {
            method: 'DELETE',
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                setDeleteDialogOpen(false)
                setMenuDashboardId(null)
                showSnackbar("Dashboard deleted.", "success")
            } else {
                console.error(data.message)
                showSnackbar("Failed to delete dashboard.", "error")
            }
        })
        .catch(err => {
            console.error(err)
            showSnackbar("Failed to delete dashboard.", "error")
        })
    }


    if (error) {
        return (
            <Box sx={{ p: 4 }}>
                <Typography color="error">{error}</Typography>
            </Box>
        )
    }

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'var(--color-bg-page)' }}>

            <HomeHeader
                count={dashboards.length}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onNewDashboard={() => setNewDashboardDialogOpen(true)}
            />

            {/* Dashboard Grid */}
            <Box sx={{ maxWidth: '1200px', mx: 'auto', px: 5, py: 4 }}>
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: 3,
                }}>
                    {loading && [1, 2, 3].map(i => <SkeletonCard key={i} />)}

                    {!loading && filteredDashboards.map(db => (
                        <DashboardCard
                            key={db.dashboardId}
                            dashboard={db}
                            onPlay={(id) => router.push(`/stratlab/${id}?mode=play`)}
                            onEdit={(id) => router.push(`/stratlab/${id}`)}
                            onMenuOpen={handleMenuOpen}
                            onTogglePublic={handleTogglePublic}
                        />
                    ))}

                    {!loading && <NewDashboardCard onClick={() => {
                        setNewDashboardForm({ title: '', description: '', isPublic: false, tagIds: [] })
                        setNewDashboardDialogOpen(true)
                    }} />}
                </Box>
            </Box>

            {/* Dropdown Menu */}
            <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={handleMenuClose}
                PaperProps={{
                    sx: {
                        borderRadius: '10px',
                        boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                        minWidth: 180,
                    }
                }}
            >
                <MenuItem onClick={() => {
                    const db = dashboards.find(d => d.dashboardId === menuDashboardId)
                    if (db) {
                        setEditForm({
                            title: db.title,
                            description: db.description || '',
                            isPublic: db.isPublic,
                            tagIds: db.tags ? db.tags.map(tag => tag.tagId) : [],
                        })
                    }
                    setMenuAnchor(null)
                    setEditDialogOpen(true)
                }}>
                    <ListItemIcon><EditOutlinedIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>Edit Details</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => {
                    const db = dashboards.find(d => d.dashboardId === menuDashboardId)
                    if (db) handleTogglePublic(db.dashboardId, db.isPublic)
                    handleMenuClose()
                }}>
                    <ListItemIcon><ShareOutlinedIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>
                        {dashboards.find(d => d.dashboardId === menuDashboardId)?.isPublic ? 'Make Private' : 'Make Public'}
                    </ListItemText>
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => {
                    setMenuAnchor(null)
                    setDeleteDialogOpen(true)
                }}>
                    <ListItemIcon><DeleteOutlineIcon fontSize="small" sx={{ color: 'var(--color-danger)' }} /></ListItemIcon>
                    <ListItemText sx={{ '& .MuiTypography-root': { color: 'var(--color-danger)' } }}>Delete</ListItemText>
                </MenuItem>
            </Menu>

            <DeleteDialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={() => {
                    handleDashboardDelete(menuDashboardId)
            }}
            />

            <EditDetailsDialog
                open={editDialogOpen}
                onClose={() => setEditDialogOpen(false)}
                editForm={editForm}
                setEditForm={setEditForm}
                onSave={handleDashboardUpdate}
                tags={tags}
            />

            <NewDashboardDialog
                open={newDashboardDialogOpen}
                onClose={() => setNewDashboardDialogOpen(false)}
                newDashboardForm={newDashboardForm}
                setNewDashboardForm={setNewDashboardForm}
                onSave={() => {
                    handleDashboardCreation();
                }}
                tags={tags}
                />
        </Box>
    )
}