import type { DictNode } from "../NestedDictionary";
import { Modal, Grid, Box, Button, Stack, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { useEffect, useState } from "react";
import SingleColumnEditor from "./TemplateEditors/SingleColumnEditor";
import { TextField } from "@mui/material";
import TableEditor from "./TemplateEditors/TableEditor";
import ImageEditor from "./TemplateEditors/ImageEditor";

interface DictNodeEditorProps {
    nodeDef: DictNode | null;
    isOpen: boolean;
    onSave: (nodeDef: DictNode) => void;
    onDelete: () => void;
    onCancel: () => void;
}

/** MUI Modal must have a single child that forwards a ref to a DOM node (not a Fragment). */
export default function DictNodeEditor({
    nodeDef,
    isOpen,
    onSave,
    onDelete,
    onCancel,
}: DictNodeEditorProps) {
    const [editedNodeDef, setEditedNodeDef] = useState<DictNode | null>(null);

    console.log("nodeDef: ", nodeDef);
    console.log("editedNodeDef: ", editedNodeDef);

    useEffect(() => {
        console.log("DictNodeEditor: editedNodeDef: ", editedNodeDef);
    }, [editedNodeDef]);

    useEffect(() => {
        if (isOpen && nodeDef) {
            setEditedNodeDef(nodeDef);
        }
        if (!isOpen) {
            setEditedNodeDef(null);
        }
    }, [isOpen, nodeDef]);

    function handleSave() {
        if (editedNodeDef) {
            onSave(editedNodeDef);
        }
    }

    function renderTemplateEditor() {
        if (!editedNodeDef) {
            return null;
        }
        const contentType = editedNodeDef.content?.type;
        if (contentType === "text") {
            return (
                <SingleColumnEditor
                    text={editedNodeDef.content.text}
                    onChange={(text) =>
                        setEditedNodeDef((prev) =>
                            prev ? { ...prev, content: { type: "text", text }, } : null
                        )
                    }
                />
            );
        }
        // else if (contentType === "table") {
        //     return (
        //         <TableEditor
        //             tableRows={editedNodeDef.content.tableRows}
        //             columnCount={editedNodeDef.content.columnCount}
        //             rowCount={editedNodeDef.content.rowCount}
        //             onChange={(tableRows, columnCount, rowCount) =>
        //                 setEditedNodeDef((prev) =>
        //                     prev ? { ...prev, content: { type: "table", tableRows, columnCount, rowCount }, } : null
        //                 )
        //             }
        //         />
        //     );
        // }
        else if (contentType === "image") {
            return (
                <ImageEditor
                    imageAssetId={editedNodeDef.content.imageAssetId}
                    onChange={(imageAssetId) => setEditedNodeDef((prev) => prev ? { ...prev, content: { type: "image", imageAssetId: imageAssetId ?? null }, } : null)}
                />
            );
        }
        return null;
    }

    function handleContentTypeChange(e, newContentType: "text" | "image") {
        if (newContentType === "text") {
            setEditedNodeDef((prev) =>
                prev ? { ...prev, content: { type: "text", text: "" }, } : null
            );
        }
        else if (newContentType === "image") {
            setEditedNodeDef((prev) =>
                prev ? { ...prev, content: { type: "image", imageAssetId: null } } : null
            );
        } 
        // else if (newContentType === "table") {
        //     setEditedNodeDef((prev) =>
        //         prev ? { ...prev, content: { type: "table", tableRows: [], columnCount: 5, rowCount: 5 } } : null
        //     );
        // }
    }


    function maybeRenderContentSelector() {
        if (!editedNodeDef) return <></>;
        if (editedNodeDef.onClick === "navigate") return <></>;
        return (
            <Grid size={12}>
                <ToggleButtonGroup
                    value={editedNodeDef.content?.type ?? "text"}
                    exclusive
                    onChange={handleContentTypeChange}
                    fullWidth
                    size="small"
                    sx={{ marginBottom: 2}}
                >
                    <ToggleButton value="text">Text</ToggleButton>
                    <ToggleButton value="image">Image</ToggleButton>
                    {/* <ToggleButton value="table">Table</ToggleButton> */}
                </ToggleButtonGroup>
            </Grid>);
    }


    return (
        <Modal open={isOpen} onClose={onCancel}>
            <Box
                sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: { xs: "90%", sm: 480 },
                    maxHeight: "90vh",
                    overflow: "auto",
                    bgcolor: "background.paper",
                    borderRadius: 1,
                    boxShadow: 24,
                    p: 2,
                }}
            >

                {/* If null (none selected), don't render anything. */}
                {editedNodeDef && (
                    <>

                        <Grid container rowSpacing={2} columnSpacing={2} size={12}>
                            <Grid size={6}>
                                <TextField label="Label" value={editedNodeDef.label} onChange={(e) => setEditedNodeDef((prev) => prev ? { ...prev, label: e.target.value } : null)} />
                            </Grid>

                            {/* For "Expand" nodes, render the content selector (text | image | table)*/}
                            {maybeRenderContentSelector()}
                        </Grid>

                        {/* Render the editor for the selected content type (text | image | table) */}
                        {renderTemplateEditor()}


                        {/* Render the save/cancel/delete buttons */}
                        <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 2 }}>
                            <Button onClick={onCancel}>Cancel</Button>
                            <Button color="error" onClick={onDelete}>
                                Delete
                            </Button>
                            <Button variant="contained" onClick={handleSave}>
                                Save
                            </Button>
                        </Stack>

                    </>
                )}
            </Box>
        </Modal>
    );
}
