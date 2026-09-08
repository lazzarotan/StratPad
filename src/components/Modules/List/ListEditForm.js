import { Grid, TextField, IconButton, Typography, Divider, Button, Switch, FormControlLabel } from "@mui/material";
import { Delete, Add } from "@mui/icons-material";
import "@/components/EditModal/EditModal.css";
import { generateUUID } from "@/components/Dashboard/moduleFactory";

export default function ListEditForm({ editedModuleData, setEditedModuleData, onEdit }) {

    function numHandler(id, field, clamp, fallback) {
        return {
            onChange: (e) => { const v = e.target.value; const n = v === "" ? "" : e.target.valueAsNumber; if (n === "" || !isNaN(n)) updateItem(id, field, n === "" ? "" : clamp(n)); },
            onBlur: (e) => { if (e.target.value === "") updateItem(id, field, fallback); },
            onKeyDown: (e) => { if (e.key === "Enter") e.target.blur(); }
        };
    }

    function updateItem(itemId, field, value) {
        const updatedItems = editedModuleData.items.map((item) => {
            if (item.id !== itemId) return item;
            return { ...item, [field]: value };
        });
        setEditedModuleData({ ...editedModuleData, items: updatedItems });
        onEdit();
    }

    function deleteItem(itemId) {
        const updatedItems = editedModuleData.items.filter((item) => item.id !== itemId);
        setEditedModuleData({ ...editedModuleData, items: updatedItems });
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

            <Grid size={12} sx={{ display: "flex", gap: 2 }}>
                <FormControlLabel
                    control={
                        <Switch
                            checked={editedModuleData.showCheckbox ?? true}
                            onChange={(e) => {
                                setEditedModuleData({ ...editedModuleData, showCheckbox: e.target.checked });
                                onEdit();
                            }}
                        />
                    }
                    label="Show Checkbox"
                />
                <FormControlLabel
                    control={
                        <Switch
                            checked={editedModuleData.showQuantity ?? true}
                            onChange={(e) => {
                                setEditedModuleData({ ...editedModuleData, showQuantity: e.target.checked });
                                onEdit();
                            }}
                        />
                    }
                    label="Show Quantity"
                />
            </Grid>

            {editedModuleData.items.map((item, index) => (
                <div key={item.id} style={{ marginTop: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography variant="subtitle2">Item {index + 1}</Typography>
                        <IconButton
                            size="small"
                            onClick={() => deleteItem(item.id)}
                            disabled={editedModuleData.items.length <= 1}
                        >
                            <Delete fontSize="small" />
                        </IconButton>
                    </div>
                    <Divider sx={{ mb: 1 }} />
                    <Grid container spacing={2}>
                        <Grid size={8}>
                            <TextField
                                label="Name"
                                value={item.name}
                                onChange={(e) => updateItem(item.id, "name", e.target.value)}
                                fullWidth
                            />
                        </Grid>
                        <Grid size={4}>
                            <TextField
                                label="Quantity"
                                type="number"
                                value={item.quantity}
                                {...numHandler(item.id, "quantity", (n) => Math.max(0, n), 0)}
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
                    const newItem = {
                        id: generateUUID(),
                        name: "New Item",
                        quantity: 1,
                        checked: false,
                    };
                    setEditedModuleData({
                        ...editedModuleData,
                        items: [...editedModuleData.items, newItem],
                    });
                    onEdit();
                }}
                fullWidth
                sx={{ mt: 2 }}
            >
                Add Item
            </Button>
        </div>
    );
}