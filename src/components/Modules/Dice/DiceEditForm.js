import { Grid, TextField } from "@mui/material";
import { DICE_TYPES } from "./Die3DCanvas";

const DEFAULT_COLORS = {
    d4: "#16a34a",
    d6: "#4f46e5",
    d8: "#2563eb",
    d10: "#dc2626",
    d12: "#9333ea",
    d20: "#d97706",
};

export default function DiceEditForm({ editedModuleData, setEditedModuleData, onEdit }) {
    const diceColors = editedModuleData.diceColors ?? DEFAULT_COLORS;

    function handleTitleChange(e) {
        setEditedModuleData(prev => ({ ...prev, title: e.target.value }));
        onEdit();
    }

    function handleColorChange(type, value) {
        setEditedModuleData(prev => ({
            ...prev,
            diceColors: { ...(prev.diceColors ?? DEFAULT_COLORS), [type]: value },
        }));
        onEdit();
    }

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
                <div style={{ marginBottom: 8, fontSize: 13, color: "rgba(0,0,0,0.6)" }}>Dice Colors</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "center" }}>
                    {Object.entries(DICE_TYPES).map(([type, config]) => (
                        <div key={type} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                            <input
                                type="color"
                                value={diceColors[type] ?? config.color}
                                onChange={(e) => handleColorChange(type, e.target.value)}
                                style={{
                                    width: 36,
                                    height: 36,
                                    border: "none",
                                    padding: 0,
                                    cursor: "pointer",
                                    borderRadius: 4,
                                    background: "none",
                                }}
                            />
                            <span style={{ fontWeight: 600, fontSize: 12 }}>{config.label}</span>
                        </div>
                    ))}
                </div>
            </Grid>
        </Grid>
    );
}
