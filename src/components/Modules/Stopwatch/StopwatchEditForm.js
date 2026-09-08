import { Grid, TextField, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { useState, useMemo } from "react";

const isBlank = (v) => (v ?? "").toString().trim() === "";
const toNumberOrNull = (v) => {
    if (v === "" || v === null || v === undefined) return null;
    const num = Number(v);
    return Number.isFinite(num) ? num : null;
}

export default function StopwatchEditForm({ editedModuleData, setEditedModuleData, onEdit }) {
    const [errors, setErrors] = useState({});

    const validators = useMemo(() => ({
        title: (v) => (isBlank(v) ? "Title is required" : ""),
        mode: () => "",
        timerMinutes: (v) => {
            const n = toNumberOrNull(v);
            if (n === null) return "Must be a number";
            if (n < 0) return "Cannot be negative";
            return "";
        },
        timerSeconds: (v) => {
            const n = toNumberOrNull(v);
            if (n === null) return "Must be a number";
            if (n < 0 || n > 59) return "Must be 0–59";
            return "";
        },
    }), []);

    const handleFieldChange = (name) => (e) => {
        const raw = e.target.value;
        const validator = validators[name];
        const errMsg = validator ? validator(raw) : "";
        setErrors((prev) => ({ ...prev, [name]: errMsg }));

        const isTimerDuration = name === "timerMinutes" || name === "timerSeconds";
        const isNumberField = e.target.type === "number";
        if (isNumberField) {
            const num = toNumberOrNull(raw);
            setEditedModuleData((prev) => ({ ...prev, [name]: num, ...(isTimerDuration && { elapsedSeconds: 0, startedAt: null }) }));
        } else {
            setEditedModuleData((prev) => ({ ...prev, [name]: raw }));
        }
        onEdit();
    };

    const handleModeChange = (_, newMode) => {
        if (!newMode) return;
        setEditedModuleData((prev) => {
            const defaultTitles = ["Stopwatch", "Timer"];
            const titleIsDefault = defaultTitles.includes(prev.title);
            const newTitle = titleIsDefault ? (newMode === "timer" ? "Timer" : "Stopwatch") : prev.title;
            return { ...prev, mode: newMode, title: newTitle, elapsedSeconds: 0, startedAt: null };
        });
        onEdit();
    };

    const isTimer = editedModuleData.mode === "timer";

    return (
        <Grid container columns={{ xs: 6, sm: 6, md: 12 }} spacing={2}>
            <Grid size={{ xs: 6, sm: 6, md: 12 }}>
                <TextField
                    label="Title"
                    value={editedModuleData.title ?? ""}
                    onChange={handleFieldChange("title")}
                    fullWidth
                    required
                    error={!!errors.title}
                    helperText={errors.title}
                />
            </Grid>
            <Grid size={{ xs: 6, sm: 6, md: 12 }}>
                <ToggleButtonGroup
                    value={editedModuleData.mode ?? "stopwatch"}
                    exclusive
                    onChange={handleModeChange}
                    fullWidth
                    size="small"
                >
                    <ToggleButton value="stopwatch">Stopwatch</ToggleButton>
                    <ToggleButton value="timer">Timer</ToggleButton>
                </ToggleButtonGroup>
            </Grid>
            {isTimer && (
                <>
                    <Grid size={6}>
                        <TextField
                            label="Minutes"
                            value={editedModuleData.timerMinutes ?? ""}
                            onChange={handleFieldChange("timerMinutes")}
                            type="number"
                            fullWidth
                            error={!!errors.timerMinutes}
                            helperText={errors.timerMinutes}
                        />
                    </Grid>
                    <Grid size={6}>
                        <TextField
                            label="Seconds"
                            value={editedModuleData.timerSeconds ?? ""}
                            onChange={handleFieldChange("timerSeconds")}
                            type="number"
                            fullWidth
                            error={!!errors.timerSeconds}
                            helperText={errors.timerSeconds}
                        />
                    </Grid>
                </>
            )}
        </Grid>
    );
}
