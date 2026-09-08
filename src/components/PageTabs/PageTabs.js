"use client";

import { useEffect, useState } from "react";
import { Tabs } from "antd";
import "./PageTabs.css";
import { useDashboardMode } from "@/components/Dashboard/DashboardMode/DashboardModeContext";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import IconButton from "@mui/material/IconButton";
import { generateUUID } from "@/components/Dashboard/moduleFactory";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import AlertModal from "@/components/AlertModal/AlertModal";


export default function PageTabs({ activePage, setActivePage, pages, setPages }) {

    const { canAddPages } = useDashboardMode();

    //Prevents Next hydration mismatch by rendering Tabs only on client after mount
    const [isMounted, setIsMounted] = useState(false);

    // const [editingPageId, setEditingPageId] = useState(null); //Tracks which tab is being renamed (pageId)
    // const [draftName, setDraftName] = useState(""); //Temporary name while user is typing (max 15 chars)

    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editPageTabId, setEditPageTabId] = useState(null);
    const [editPageName, setEditPageName] = useState("");
    const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
    const [deletePageTabId, setDeletePageTabId] = useState(null);


    const MAX_PAGES = 7;

    useEffect(() => {
        setIsMounted(true);
    }, []);

    //While not mounted, render a small placeholder bar (no Tabs yet)
    if (!isMounted) {
        return (
            <div className="page-tabs page-tabs--placeholder" />
        );
    }

    const items = pages.map((p) => ({
        key: p.pageId,                //AntD needs a string key
        label: <span>{p.name}</span>,
        // Use the close-control as an "edit tab" trigger in edit mode.
        closable: canAddPages,
        closeIcon: canAddPages ? <EditIcon fontSize="extra-small" /> : null,
    }));

    //When user switches the tab
    function handleChange(activeKey) {
        const index = pages.findIndex((p) => p.pageId === activeKey);
        if (index >= 0) setActivePage(index);
    }

    //Add new tab
    function handleAdd() {

        if (!canAddPages) {
            return;
        }

        if (pages.length >= MAX_PAGES)
        {
            return;
        }

        const newPage = {
        modules: [],
        index: pages.length,
        pageId: generateUUID(),
        name: "New Tab",
        };

        const updated = [...pages, newPage];
        setPages(updated);
        setActivePage(updated.length - 1);
    }

    function removeTab(targetKey) {
        setPages((previousPages) => {
            //never allow deleting the final page.
            if (previousPages.length <= 1) return previousPages;

            const removedIndex = previousPages.findIndex((p) => p.pageId === targetKey);
            if (removedIndex < 0) return previousPages;

            const filtered = previousPages.filter((p) => p.pageId !== targetKey);

            setActivePage((previousActivePage) => {
                if (filtered.length === 0) return 0;
                if (typeof previousActivePage !== "number") return 0;

                if (removedIndex < previousActivePage) {
                    return previousActivePage - 1;
                }

                if (removedIndex === previousActivePage) {
                    return Math.min(previousActivePage, filtered.length - 1);
                }

                return Math.min(previousActivePage, filtered.length - 1);
            });

            return filtered;
        });
    }

    //
    function handleEdit(targetKey){
        const page = pages.find((p) => p.pageId === targetKey);
        if (!page) return;

        //Open the edit modal for this page tab.
        setEditModalOpen(true);
        setEditPageTabId(targetKey);
        setEditPageName(page.name);
    }


    function handleCloseEditModal() {
        setEditModalOpen(false);
        setEditPageTabId(null);
        setEditPageName("");
    }

    function handleSaveEdit() {
        const cleanedName = editPageName.trim().slice(0, 15);
        if (!cleanedName || !editPageTabId) return;

        const updatedPages = pages.map((p) => {
            if (p.pageId === editPageTabId) return { ...p, name: cleanedName };
            return p;
        });

        setPages(updatedPages);
        handleCloseEditModal();
    }

    function handleDeleteFromModal() {
        if (!editPageTabId) return;

        handleCloseEditModal();
        setDeletePageTabId(editPageTabId);
        setDeleteAlertOpen(true);
    }

    function handleConfirmDelete() {
        if (!deletePageTabId) return;
        removeTab(deletePageTabId);
        setDeleteAlertOpen(false);
        setDeletePageTabId(null);
    }

    function handleCloseDeleteAlert() {
        setDeleteAlertOpen(false);
        setDeletePageTabId(null);
    }

    return (
        <div className="page-tabs">
            <Tabs
                type="editable-card"
                hideAdd={true}
                activeKey={pages[activePage]?.pageId}
                onChange={handleChange}
                onEdit={(targetKey, action) => { if (action === "remove") handleEdit(targetKey); }}
                items={items}
                style={{ margin: 0 }}
            />
            <IconButton
                className="page-tabs-custom-add"
                onClick={handleAdd}
                disabled={!canAddPages || pages.length >= MAX_PAGES}
                aria-label="Add tab"
            >
                <AddIcon fontSize="small" />
            </IconButton>

            <Modal open={editModalOpen} onClose={handleCloseEditModal}>
                <div className="page-tabs-modal-container">
                    <h3>Edit tab</h3>
                    <TextField
                        label="Tab name"
                        size="small"
                        fullWidth
                        inputProps={{ maxLength: 15 }}
                        value={editPageName}
                        onChange={(e) => setEditPageName(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveEdit();
                        }}
                    />
                    <div className="page-tabs-modal-actions">
                        {pages.length > 1 && (
                            <Button
                                className="modal-btn modal-btn--red"
                                color="error"
                                onClick={handleDeleteFromModal}
                        
                            >
                            Delete
                            </Button>
                        )}
                        <Button className="modal-btn modal-btn--warn" onClick={handleCloseEditModal}>Cancel</Button>
                        <Button className="modal-btn" variant="contained" onClick={handleSaveEdit}>Save</Button>
                    </div>
                </div>
            </Modal>

            <AlertModal
                open={deleteAlertOpen}
                title="Delete this page?"
                message={`Delete "${pages.find((p) => p.pageId === deletePageTabId)?.name ?? "this page"}"? This action cannot be undone.`}
                onConfirm={handleConfirmDelete}
                onCancel={handleCloseDeleteAlert}
                confirmText="Delete"
                cancelText="Cancel"
                confirmVariant="danger"
            />
        </div>
    );
}