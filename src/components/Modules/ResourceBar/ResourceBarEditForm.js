import { Grid, TextField, IconButton, Typography, Divider, Button } from "@mui/material";
import { Delete, Add } from "@mui/icons-material";
import "@/components/EditModal/EditModal.css";
import { generateUUID } from "@/components/Dashboard/moduleFactory";

export default function ResourceBarEditForm({ editedModuleData, setEditedModuleData, onEdit }) {

    function numHandler(id, field, clamp, fallback) {
        return {
            onChange: (e) => { const v = e.target.value; const n = v === "" ? "" : e.target.valueAsNumber; if (n === "" || !isNaN(n)) updateBar(id, field, n === "" ? "" : clamp(n)); },
            onBlur: (e) => { if (e.target.value === "") updateBar(id, field, fallback); },
            onKeyDown: (e) => { if (e.key === "Enter") e.target.blur(); }
        };
    }

    function updateBar(barId, field, value) {
        const updatedBars = editedModuleData.bars.map((bar) => {
            if (bar.id !== barId) return bar;
            const updated = { ...bar, [field]: value };
            if (field === "value") updated.valueTouched = true;
            if (field === "defaultValue") updated.defaultValueTouched = true;
            if (field === "max" && typeof value === "number") {
                if (!updated.valueTouched) updated.value = value;
                else if (typeof updated.value === "number" && updated.value > value) updated.value = value;
                if (!updated.defaultValueTouched) updated.defaultValue = value;
                else if (typeof updated.defaultValue === "number" && updated.defaultValue > value) updated.defaultValue = value;
            }
            if (field === "min" && typeof value === "number") {
                if (typeof updated.value === "number" && updated.value < value) updated.value = value;
                if (typeof updated.defaultValue === "number" && updated.defaultValue < value) updated.defaultValue = value;
            }
            return updated;
        });
        setEditedModuleData({ ...editedModuleData, bars: updatedBars });
        onEdit();
    }

    function deleteBar(barId) {
        const updatedBars = editedModuleData.bars.filter((bar) => bar.id !== barId);
        setEditedModuleData({ ...editedModuleData, bars: updatedBars });
        onEdit();
    }

    return (
        <div>
            <Grid container spacing={2}>
                <Grid size={12}>
                    <TextField
                        label="Module Title"
                        value={editedModuleData.title ?? ""}
                        onChange={(e) => {
                            setEditedModuleData({ ...editedModuleData, title: e.target.value });
                            onEdit();
                        }}
                        fullWidth
                    />
                </Grid>
            </Grid>

            {editedModuleData.bars.map((bar, index) => (
                <div key={bar.id} style={{ marginTop: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography variant="subtitle2">Bar {index + 1}</Typography>
                        <IconButton
                            size="small"
                            onClick={() => deleteBar(bar.id)}
                            disabled={editedModuleData.bars.length <= 1}
                        >
                            <Delete fontSize="small" />
                        </IconButton>
                    </div>
                    <Divider sx={{ mb: 1 }} />
                    <Grid container spacing={2}>
                        <Grid size={8}>
                            <TextField
                                label="Label"
                                value={bar.label}
                                onChange={(e) => updateBar(bar.id, "label", e.target.value)}
                                fullWidth
                            />
                        </Grid>
                        <Grid size={4}>
                            <TextField
                                label="Color"
                                type="color"
                                value={bar.color}
                                onChange={(e) => updateBar(bar.id, "color", e.target.value)}
                                fullWidth
                            />
                        </Grid>
                        <Grid size={4}>
                            <TextField
                                label="Min"
                                type="number"
                                value={bar.min}
                                {...numHandler(bar.id, "min", (n) => Math.min(n, bar.max), 0)}
                                inputProps={{ max: bar.max }}
                                fullWidth
                            />
                        </Grid>
                        <Grid size={4}>
                            <TextField
                                label="Max"
                                type="number"
                                value={bar.max}
                                {...numHandler(bar.id, "max", (n) => Math.max(n, bar.min), 0)}
                                inputProps={{ min: bar.min }}
                                fullWidth
                            />
                        </Grid>
                        <Grid size={4}>
                            <TextField
                                label="Step"
                                type="number"
                                value={bar.increment}
                                {...numHandler(bar.id, "increment", (n) => Math.min(Math.max(n, 1), bar.max), 1)}
                                inputProps={{ min: 1, max: bar.max }}
                                fullWidth
                            />
                        </Grid>
                        <Grid size={6}>
                            <TextField
                                label="Current Value"
                                type="number"
                                value={bar.value}
                                {...numHandler(bar.id, "value", (n) => Math.min(Math.max(n, bar.min), bar.max), bar.min)}
                                inputProps={{ min: bar.min, max: bar.max }}
                                fullWidth
                            />
                        </Grid>
                        <Grid size={6}>
                            <TextField
                                label="Default Value"
                                type="number"
                                value={bar.defaultValue ?? bar.max}
                                {...numHandler(bar.id, "defaultValue", (n) => Math.min(Math.max(n, bar.min), bar.max), bar.min)}
                                inputProps={{ min: bar.min, max: bar.max }}
                                fullWidth
                            />
                        </Grid>
                    </Grid>
                </div>
            ))}

            <Button
                className="modal-btn modal-btn--green"
                startIcon={<Add />}
                onClick={() => {
                    const newBar = {
                        id: generateUUID(),
                        label: "New",
                        value: 100,
                        defaultValue: 100,
                        min: 0,
                        max: 100,
                        increment: 1,
                        color: "#8b5cf6",
                    };
                    setEditedModuleData({
                        ...editedModuleData,
                        bars: [...editedModuleData.bars, newBar],
                    });
                    onEdit();
                }}
                fullWidth
                sx={{ mt: 2 }}
            >
                Add Bar
            </Button>
        </div>
    );
}
