import { Grid, TextField, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { useState } from "react";

export default function ScoreTableEditForm({ editedModuleData, setEditedModuleData, onEdit }) {
    const [errors, setErrors] = useState({});

    function handleTitleChange(e) {
        setEditedModuleData(prev => ({ ...prev, title: e.target.value }));
        onEdit();
    }

    function handleToggle(field) {
        return (_, newValue) => {
            if (newValue === null) return;
            setEditedModuleData(prev => ({ ...prev, [field]: newValue === "true" }));
            onEdit();
        };
    }

    function handleRoundCountChange(e) {
        const raw = parseInt(e.target.value);
        if (isNaN(raw) || raw < 1) {
            setErrors(prev => ({ ...prev, roundCount: "Must be at least 1" }));
            return;
        }
        if (raw > 20) {
            setErrors(prev => ({ ...prev, roundCount: "Maximum 20 rounds" }));
            return;
        }
        setErrors(prev => ({ ...prev, roundCount: "" }));

        const currentCount = editedModuleData.roundNames.length;
        let newRoundNames = [...editedModuleData.roundNames];
        let newScores = editedModuleData.scores.map(ps => [...ps]);

        if (raw > currentCount) {
            for (let i = currentCount; i < raw; i++) {
                newRoundNames.push(`Round ${i + 1}`);
                newScores = newScores.map(ps => [...ps, null]);
            }
        } else if (raw < currentCount) {
            newRoundNames = newRoundNames.slice(0, raw);
            newScores = newScores.map(ps => ps.slice(0, raw));
        }

        setEditedModuleData(prev => ({ ...prev, roundNames: newRoundNames, scores: newScores }));
        onEdit();
    }

    const lowestScoreWins = editedModuleData.lowestScoreWins ?? false;
    const showTotals = editedModuleData.showTotals ?? true;
    const showHighlights = editedModuleData.showHighlights ?? true;

    return (
        <Grid container columns={12} spacing={2}>
            <Grid size={12}>
                <TextField
                    label="Title"
                    value={editedModuleData.title ?? ""}
                    onChange={handleTitleChange}
                    fullWidth
                />
            </Grid>

            <Grid size={12}>
                <div style={{ marginBottom: 4, fontSize: 13, color: "rgba(0,0,0,0.6)" }}>Round Winner</div>
                <ToggleButtonGroup
                    value={lowestScoreWins ? "true" : "false"}
                    exclusive
                    onChange={handleToggle("lowestScoreWins")}
                    fullWidth
                    size="small"
                >
                    <ToggleButton value="false">Highest Score</ToggleButton>
                    <ToggleButton value="true">Lowest Score</ToggleButton>
                </ToggleButtonGroup>
            </Grid>

            <Grid size={12}>
                <div style={{ marginBottom: 4, fontSize: 13, color: "rgba(0,0,0,0.6)" }}>Show Totals Row</div>
                <ToggleButtonGroup
                    value={showTotals ? "true" : "false"}
                    exclusive
                    onChange={handleToggle("showTotals")}
                    fullWidth
                    size="small"
                >
                    <ToggleButton value="true">On</ToggleButton>
                    <ToggleButton value="false">Off</ToggleButton>
                </ToggleButtonGroup>
            </Grid>

            <Grid size={12}>
                <div style={{ marginBottom: 4, fontSize: 13, color: "rgba(0,0,0,0.6)" }}>Show Highlights</div>
                <ToggleButtonGroup
                    value={showHighlights ? "true" : "false"}
                    exclusive
                    onChange={handleToggle("showHighlights")}
                    fullWidth
                    size="small"
                >
                    <ToggleButton value="true">On</ToggleButton>
                    <ToggleButton value="false">Off</ToggleButton>
                </ToggleButtonGroup>
            </Grid>

            <Grid size={12}>
                <TextField
                    label="Number of Rounds"
                    type="number"
                    value={editedModuleData.roundNames?.length ?? 3}
                    onChange={handleRoundCountChange}
                    fullWidth
                    slotProps={{ htmlInput: { min: 1, max: 20 } }}
                    error={!!errors.roundCount}
                    helperText={errors.roundCount}
                />
            </Grid>
        </Grid>
    );
}
