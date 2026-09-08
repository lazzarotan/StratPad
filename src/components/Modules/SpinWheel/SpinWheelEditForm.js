import { Grid, TextField, MenuItem } from "@mui/material";

export default function SpinWheelEditForm({ editedModuleData, setEditedModuleData, onEdit }) {

    const segments = editedModuleData?.segments ?? [];

    function handleTitleChange(e) {
        setEditedModuleData((prev) => ({ ...prev, title: e.target.value }));
        onEdit();
    }

    function handleCountChange(e) {
        const count = parseInt(e.target.value);
        let newSegments = [...segments];

        if (count > newSegments.length) {
            for (let i = newSegments.length + 1; i <= count; i++) {
                newSegments.push(`${i}`);
            }
        } else {
            newSegments = newSegments.slice(0, count);
        }

        setEditedModuleData((prev) => ({ ...prev, segments: newSegments }));
        onEdit();
    }

    function handleSegmentChange(index, value) {
        const newSegments = [...segments];
        newSegments[index] = value;
        setEditedModuleData((prev) => ({ ...prev, segments: newSegments }));
        onEdit();
    }

    return (
        <Grid container columns={{ xs: 6, sm: 6, md: 12 }} spacing={2}>
            <Grid size={{ xs: 6, sm: 6, md: 12 }}>
                <TextField
                    label="Title"
                    value={editedModuleData?.title ?? ""}
                    onChange={handleTitleChange}
                    fullWidth
                />
            </Grid>

            <Grid size={{ xs: 6, sm: 6, md: 12 }}>
                <TextField
                    select
                    label="Number of segments"
                    value={segments.length}
                    onChange={handleCountChange}
                    fullWidth
                >
                    {Array.from({ length: 19 }, (_, i) => i + 2).map((n) => (
                        <MenuItem key={n} value={n}>{n}</MenuItem>
                    ))}
                </TextField>
            </Grid>

            {segments.map((seg, i) => (
                <Grid key={i} size={{ xs: 6, sm: 6, md: 6 }}>
                    <TextField
                        label={`Segment ${i + 1}`}
                        value={seg}
                        onChange={(e) => handleSegmentChange(i, e.target.value)}
                        fullWidth
                    />
                </Grid>
            ))}
        </Grid>
    );
}
