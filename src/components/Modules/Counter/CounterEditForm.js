import { Grid, TextField } from "@mui/material";
import { useState, useMemo } from "react";

//Helper functions for validation and conversion
const isBlank = (v) => (v ?? "").toString().trim() === "";
const toNumberOrNull = (v) => {
    if(v === "" || v === null || v === undefined) return null;
    const num = Number(v);
    return Number.isFinite(num) ? num : null;
};


export default function CounterEditForm({ editedModuleData, setEditedModuleData, onEdit }){
    const [errors, setErrors] = useState({});

    const validators = useMemo(
        () => ({
          title: (v) => (isBlank(v) ? "Title is required" : ""),
          increment: (v) => (toNumberOrNull(v) === null ? "Increment must be a number" : ""),
          min: (v) => (toNumberOrNull(v) === null ? "Min must be a number" : ""),
          max: (v) => (toNumberOrNull(v) === null ? "Max must be a number" : ""),
          defaultValue: (v) => (toNumberOrNull(v) === null ? "Default value must be a number" : ""),
          prefix: (v) => (v && v.length > 3 ? "Max 3 characters" : ""),
          suffix: (v) => (v && v.length > 3 ? "Max 3 characters" : ""),
        }),
        []
      );


    const validateField = (name, raw) => {
        const validator = validators[name];
        if(!validator){
            console.error(`No validator found for field: ${name}`);
            return null;
        }
        return validator(raw);
    }
      
    const handleFieldChange = (name) => (e) => {
        const raw = e.target.value;

        //Validate incoming field change
        const errMsg = validateField(name, raw) || "";
        setErrors((prev) => ({ ...prev, [name]: errMsg }));

        const isNumberField = e.target.type === "number";

        //For number fields, convert to number
        if (isNumberField) {
        const num = toNumberOrNull(raw);
        setEditedModuleData((prev) => ({ ...prev, [name]: num }));
        //For title, store it as a string
        } else {
        setEditedModuleData((prev) => ({ ...prev, [name]: raw }));
        }

        onEdit();
      };

    return (
    <Grid container columns={{xs: 6, sm: 6, md: 12}} spacing={2}>
        <Grid size={{xs: 6, sm: 6, md: 12}}>
            <TextField
                label="Title" 
                value={editedModuleData.title ?? ""}
                onChange={handleFieldChange("title")}
                fullWidth
                required
                error={errors.title ? true : false}
                helperText={errors.title}
                />
        </Grid>
        <Grid size={6}>
            <TextField
                label="Increment"
                value={editedModuleData.increment ?? ""}
                onChange={handleFieldChange("increment")}
                type="number"
                fullWidth
                error={errors.increment ? true : false}
                helperText={errors.increment}
                />
        </Grid>
        <Grid size={6}>
            <TextField
                label="Min"
                value={editedModuleData.min ?? ""}
                onChange={handleFieldChange("min")}
                type="number"
                fullWidth
                error={errors.min ? true : false}
                helperText={errors.min}
                />
        </Grid>
        <Grid size={6}>
            <TextField
                label="Max"
                value={editedModuleData.max ?? ""}
                onChange={handleFieldChange("max")}
                type="number"
                fullWidth
                error={errors.max ? true : false}
                helperText={errors.max}
                />
        </Grid>
        <Grid size={6}>
            <TextField
                label="Default value"
                value={editedModuleData.defaultValue ?? ""}
                onChange={handleFieldChange("defaultValue")}
                type="number"
                fullWidth
                error={errors.defaultValue ? true : false}
                helperText={errors.defaultValue}
                />
        </Grid>
        <Grid size={6}>
            <TextField
                label="Prefix"
                value={editedModuleData.prefix ?? ""}
                onChange={handleFieldChange("prefix")}
                fullWidth
                placeholder="e.g. $"
                slotProps={{ htmlInput: { maxLength: 3 } }}
                helperText={`${(editedModuleData.prefix ?? "").length}/3`}
                />
        </Grid>
        <Grid size={6}>
            <TextField
                label="Suffix"
                value={editedModuleData.suffix ?? ""}
                onChange={handleFieldChange("suffix")}
                fullWidth
                placeholder="e.g. pts"
                slotProps={{ htmlInput: { maxLength: 3 } }}
                helperText={`${(editedModuleData.suffix ?? "").length}/3`}
                />
        </Grid>
    </Grid>
    );
}