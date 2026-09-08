'use client';

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import CommunityHeader from "./CommunityHeader";
import CommunitySkeletonCard from "./CommunitySkeletonCard";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Chip,
  Button,
  Pagination,
  Autocomplete,
  Popover,
  Select,
  MenuItem,
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import { useSession } from "@/lib/auth-client";
import { generateUUID } from "@/components/Dashboard/moduleFactory";
import { useAppSnackbar } from "@/components/SnackbarProvider/SnackbarProvider";
import LoginDialog from "@/components/LoginDialog/LoginDialog";

function useDebounced(value, delay = 300) { //delays fetch after keystroke
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  return debounced;
}

//had to change the card to a component so it can have state for its popover tag list
function CommunityDashboardCard({ dashboard, router, ownerLabel, isLoggedIn, onClone }) {
  const [tagAnchorEl, setTagAnchorEl] = useState(null);
  const [descExpanded, setDescExpanded] = useState(false);
  const [descClamped, setDescClamped] = useState(false);
  const descRef = useRef(null);

  useEffect(() => {
    const el = descRef.current;
    if (el) setDescClamped(el.scrollHeight > el.clientHeight);
  }, [dashboard.description]);

  const descriptionText = dashboard.description || '(No description)';
  const visibleTags = dashboard.tags?.slice(0, 3) || [];
  const hiddenTags = dashboard.tags?.slice(3) || [];
  const remainingTagCount = hiddenTags.length;

  return (
    <Box
      sx={{
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
      }}
    >
      <Box sx={{ p: '16px 20px 20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <Typography sx={{
          fontFamily: "'Righteous', sans-serif",
          fontSize: '17px',
          color: 'var(--color-text-primary)',
          lineHeight: 1.3,
        }}>
          {dashboard.title}
        </Typography>

        <Typography sx={{ fontSize: '12px', color: 'var(--color-text-secondary)', mt: 0.5 }}>
          by {ownerLabel(dashboard.owner)}
        </Typography>

        <Typography
          ref={descRef}
          sx={{
            fontSize: '13px',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.5,
            mt: 1,
            mb: 0.5,
            ...(!descExpanded && {
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }),
          }}
        >
          {descriptionText}
        </Typography>
        {descClamped ? (
          <Typography
            component="button"
            onClick={() => setDescExpanded(!descExpanded)}
            sx={{
              fontSize: '12px',
              color: 'var(--color-primary)',
              fontWeight: 600,
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              mb: 1,
              textAlign: 'left',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            {descExpanded ? 'Show less' : 'Read more'}
          </Typography>
        ) : (
          <Box sx={{ mb: 1 }} />
        )}

        {dashboard.tags?.length > 0 && (
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1.5 }}>
            {visibleTags.map((t) => (
              <Chip
                key={t.tagId}
                label={t.name}
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

        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid #f3f4f6',
          pt: 1.75,
        }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
            <Typography sx={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
              {new Date(dashboard.createdAt).toLocaleDateString()}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <DownloadIcon sx={{ fontSize: 14, color: 'var(--color-text-secondary)' }} />
              <Typography sx={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                {dashboard.cloneCount > 100 ? '100+' : dashboard.cloneCount}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size="small"
              onClick={() => onClone(dashboard)}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '12px',
                borderRadius: '8px',
                backgroundColor: 'transparent',
                color: 'var(--color-text-secondary)',
                border: '1px solid var(--color-border)',
                '&:hover': { backgroundColor: 'var(--color-bg-hover)' },
              }}
            >
              Clone
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={() => router.push(`/stratlab/view/${dashboard.dashboardId}`)}
              sx={{
                background: 'var(--gradient-button)',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '12px',
                borderRadius: '8px',
                '&:hover': { background: 'var(--gradient-button)', filter: 'brightness(0.9)' },
              }}
            >
              Play
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default function CommunityPage() {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  const dtitle = useDebounced(title, 300);
  const dauthor = useDebounced(author, 300);

  const [dashboards, setDashboards] = useState([]);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(15);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const [tags, setTags] = useState([]);
  const [tagsErr, setTagsErr] = useState(null);

  const [loginOpen, setLoginOpen] = useState(false);
  const [pendingCloneDashboard, setPendingCloneDashboard] = useState(null);

  const router = useRouter();
  const { showSnackbar } = useAppSnackbar();

  async function cloneDashboard(dashboard) {
    try {
      const response = await fetch(`/api/dashboards/${dashboard.dashboardId}/clone`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dashboardId: generateUUID(),
          newTitle: `copy-${dashboard.title ?? "dashboard"}`,
          newDescription: dashboard.description ?? null,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        showSnackbar(errorText || "Failed to clone dashboard", "error");
        return;
      }

      const data = await response.json();
      showSnackbar("Dashboard cloned successfully.", "success");
      router.push(`/stratlab/${data.dashboardId}`);
    } catch (err) {
      console.error("Clone failed:", err);
      showSnackbar("Failed to clone dashboard.", "error");
    }
  }

  function handleClone(dashboard) {
    if (!session) {
      setPendingCloneDashboard(dashboard);
      setLoginOpen(true);
      return;
    }
    cloneDashboard(dashboard);
  }

  // Reset to page 1 when filters change
  const filterKey = useMemo(
    () => `${dtitle}||${dauthor}||${selectedTagIds.join(",")}||${sort}`,
    [dtitle, dauthor, selectedTagIds, sort]
  );

  useEffect(() => {
    setPage(1);
  }, [filterKey]);

  const queryKey = `${filterKey}||${page}`;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setErr(null);
      setLoading(true);

      try {
        const params = new URLSearchParams();

        if (dtitle) params.set("title", dtitle);
        if (dauthor) params.set("author", dauthor);
        if (selectedTagIds.length) params.set("tagIds", selectedTagIds.join(","));
        params.set("sort", sort);
        params.set("page", String(page));

        const res = await fetch(`/api/community?${params.toString()}`, {
          method: "GET",
          cache: "no-store",
        });

        if (!res.ok) throw new Error("Request failed");

        const data = await res.json();

        if (cancelled) return;

        setDashboards(data.dashboards || []);
        setTotal(data.total || 0);
        setPageSize(data.pageSize || 15);
      } catch (e) {
        if (!cancelled) setErr("Could not load public dashboards.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => { cancelled = true; };
  }, [queryKey]);

  useEffect(() => {
    let cancelled = false;

    async function loadTags() {
      setTagsErr(null);

      try {
        const res = await fetch("/api/tags", {
          method: "GET",
          cache: "no-store",
        });

        if (!res.ok) throw new Error("Request failed");

        const data = await res.json();

        if (!cancelled) setTags(data.tags || []);
      } catch (e) {
        if (!cancelled) setTagsErr("Could not load tags.");
      }
    }

    loadTags();

    return () => { cancelled = true; };
  }, []);

  function ownerLabel(owner) {
    return owner?.username || "Unknown";
  }

  const totalPages = Math.ceil(total / pageSize);

  let dashboardContent;

  if (loading) {
    dashboardContent = (
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 3,
      }}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <CommunitySkeletonCard key={i} />
        ))}
      </Box>
    );
  } else if (err) {
    dashboardContent = <Typography sx={{ color: 'var(--color-danger)' }}>{err}</Typography>;
  } else if (dashboards.length === 0) {
    dashboardContent = <Typography sx={{ color: 'var(--color-text-secondary)' }}>No matches</Typography>;
  } else {
    dashboardContent = (
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 3,
      }}>
        {dashboards.map((d) => (
          <CommunityDashboardCard
            key={d.dashboardId}
            dashboard={d}
            router={router}
            ownerLabel={ownerLabel}
            isLoggedIn={isLoggedIn}
            onClone={handleClone}
          /> 
        ))}
      </Box>
    );
  }

  let tagFilterContent;


  
  if (tagsErr ) {
    tagFilterContent = <Typography sx={{ fontSize: '13px', color: 'var(--color-danger)' }}>{tagsErr}</Typography>;
  } else if (tags.length === 0) {
    tagFilterContent = <Typography sx={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>No tags available</Typography>;
  } else {
    tagFilterContent = (
      <Autocomplete
        multiple
        options={tags}
        disableCloseOnSelect
        filterSelectedOptions
        getOptionLabel={(option) => option.name}
        isOptionEqualToValue={(option, value) => option.tagId === value.tagId}
        value={tags.filter((tag) => selectedTagIds.includes(tag.tagId))}
        onChange={(_, newValue) => {
          setSelectedTagIds(newValue.map((tag) => tag.tagId));
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            size="small"
            label="Tags"
            placeholder="Select tags"
            sx={{
              width: 280,
              bgcolor: 'white',
              borderRadius: '8px',
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
                fontSize: '14px',
              },
            }}
          />
        )}
        sx={{ minWidth: 280 }}
      />
    );
  }

  return (
    <Box sx={{ minHeight: 'calc(100vh - 64px)', bgcolor: 'var(--color-bg-page)' }}>
      <LoginDialog
        open={loginOpen}
        onClose={() => { setLoginOpen(false); setPendingCloneDashboard(null); }}
        onSuccess={() => {
          setLoginOpen(false);
          if (pendingCloneDashboard) {
            cloneDashboard(pendingCloneDashboard);
            setPendingCloneDashboard(null);
          }
        }}
        title="Login to clone"
        subtitle="Sign in to your account to clone this dashboard."
      />
      <CommunityHeader />

      <Box sx={{ maxWidth: '1200px', mx: 'auto', px: 5, pt: 3, pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Search by title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'var(--color-text-secondary)', fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
            sx={{
              width: 240,
              bgcolor: 'white',
              borderRadius: '8px',
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px', fontSize: '14px',
              },
            }}
          />

          <TextField
            size="small"
            placeholder="Filter by author..."
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'var(--color-text-secondary)', fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
            sx={{
              width: 240,
              bgcolor: 'white',
              borderRadius: '8px',
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px', fontSize: '14px',
              },
            }}
          />

          {tagFilterContent}
        </Box>
      </Box>

      <Box sx={{ maxWidth: '1200px', mx: 'auto', px: 5, py: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <Typography sx={{
            fontFamily: "'Righteous', sans-serif",
            fontSize: '20px',
            color: 'var(--color-text-primary)',
          }}>
            Public Dashboards
          </Typography>
          <Typography sx={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
            {total} result{total !== 1 ? 's' : ''}
          </Typography>

          <Select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            size="small"
            sx={{
              ml: 'auto',
              minWidth: 150,
              fontSize: '13px',
              fontWeight: 600,
              bgcolor: 'white',
              borderRadius: '8px',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--color-border)' },
            }}
          >
            <MenuItem value="newest">Newest</MenuItem>
            <MenuItem value="oldest">Oldest</MenuItem>
            <MenuItem value="mostCloned">Most Cloned</MenuItem>
          </Select>
        </Box>

        {dashboardContent}

        {!loading && !err && totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, value) => {
                setPage(value);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              sx={{
                '& .MuiPaginationItem-root': {
                  color: 'var(--color-text-secondary)',
                },
                '& .MuiPaginationItem-root.Mui-selected': {
                  background: 'var(--gradient-button)',
                  color: 'white',
                },
              }}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
}
