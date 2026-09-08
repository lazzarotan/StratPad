import { Grid, TextField, Switch, FormControlLabel, Button, Snackbar, Alert, Stack } from "@mui/material";
import { Upload, Download } from "@mui/icons-material";
import { useRef, useState } from "react";
import type { DictNode } from "@/components/Modules/NestedDictionary/NestedDictionary";

// Recursively validates the DictNode[] structure.
// Returns an error string on failure, or null if valid.
function validateDictNodes(nodes: unknown, seenKeys: Set<string> = new Set()): string | null {
    if (!Array.isArray(nodes)) return "Expected an array of nodes.";

    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (typeof node !== "object" || node === null) return `Node at index ${i} is not an object.`;

        if (typeof node.key !== "string" || !node.key)
            return `Node at index ${i} is missing a valid 'key' (must be a non-empty string).`;
        if (seenKeys.has(node.key))
            return `Duplicate key found: "${node.key}". All keys must be unique.`;
        seenKeys.add(node.key);

        if (typeof node.label !== "string")
            return `Node "${node.key}" is missing a valid 'label' (must be a string).`;
        if (node.onClick !== "expand" && node.onClick !== "navigate")
            return `Node "${node.key}" has invalid 'onClick' value "${node.onClick}" (must be "expand" or "navigate").`;
        if (!Array.isArray(node.children))
            return `Node "${node.key}" is missing a 'children' array.`;

        const childError = validateDictNodes(node.children, seenKeys);
        if (childError) return childError;
    }
    return null;
}

type SnackbarState = { open: boolean; message: string; severity: "success" | "error" };

export default function NestedDictionaryEditForm({ editedModuleData, setEditedModuleData, onEdit }) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [snackbar, setSnackbar] = useState<SnackbarState>({ open: false, message: "", severity: "success" });

    const showSnackbar = (message: string, severity: "success" | "error") => {
        setSnackbar({ open: true, message, severity });
    };

    const handleTitleChange = (e) => {
        setEditedModuleData({ ...editedModuleData, title: e.target.value });
        onEdit();
    };

    const handleLinksOnlyInDropdownChange = (e) => {
        setEditedModuleData({ ...editedModuleData, linksOnlyInDropdown: e.target.checked });
        onEdit();
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        e.target.value = ""; // Allow re-selecting the same file

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const parsed = JSON.parse(event.target?.result as string);

                if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.dictionary)) {
                    showSnackbar('Invalid JSON: expected an object with a "dictionary" array at the top level.', "error");
                    return;
                }

                const validationError = validateDictNodes(parsed.dictionary);
                if (validationError) {
                    showSnackbar(`Validation error: ${validationError}`, "error");
                    return;
                }

                const rootCount = (parsed.dictionary as DictNode[]).length;
                setEditedModuleData({ ...editedModuleData, dictionary: parsed.dictionary as DictNode[] });
                onEdit();
                showSnackbar(`Dictionary imported successfully (${rootCount} root node${rootCount !== 1 ? "s" : ""}).`, "success");
            } catch {
                showSnackbar("Failed to parse file — make sure it is valid JSON.", "error");
            }
        };
        reader.readAsText(file);
    };

    const handleExport = () => {
        const payload = { dictionary: editedModuleData.dictionary ?? [] };
        const json = JSON.stringify(payload, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${editedModuleData.title ?? "nested-dictionary"}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <>
            <Grid container spacing={2}>
                <Grid size={12}>
                    <TextField
                        label="Title"
                        value={editedModuleData.title}
                        onChange={handleTitleChange}
                    />
                </Grid>
                <Grid size={12}>
                    <FormControlLabel
                        control={<Switch checked={editedModuleData.linksOnlyInDropdown} onChange={handleLinksOnlyInDropdownChange} />}
                        label="Links Only in Dropdown"
                    />
                </Grid>
                <Grid size={12}>
                    <Stack direction="row" spacing={1}>
                        <Button variant="outlined" startIcon={<Upload />} onClick={handleImportClick}>
                            Import from JSON
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<Download />}
                            onClick={handleExport}
                            disabled={!editedModuleData.dictionary?.length}
                        >
                            Export as JSON
                        </Button>
                    </Stack>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json,application/json"
                        style={{ display: "none" }}
                        onChange={handleFileChange}
                    />
                </Grid>
            </Grid>
            <Snackbar
                open={snackbar.open}
                autoHideDuration={5000}
                onClose={() => setSnackbar(s => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert
                    severity={snackbar.severity}
                    onClose={() => setSnackbar(s => ({ ...s, open: false }))}
                    sx={{ width: "100%" }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
}
