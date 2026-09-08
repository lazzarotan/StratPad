"use client"
import { useState, useRef, useEffect } from "react";
import { useSession, MODULE_SESSION_PREFIX } from "@/client_API_calls/session_storage/useSession";
import { MODULE_DEFINITIONS } from "@/module_definitions/module_definitions";
import ModuleHeader from "../ModuleHeader.js/ModuleHeader";
import { useDashboardMode } from "@/components/Dashboard/DashboardMode/DashboardModeContext";
import { generateUUID } from "@/components/Dashboard/moduleFactory";
import "./List.css";

export default function List({ id, onRemove, onSettings }) {
    const [data, setData] = useSession(
        MODULE_SESSION_PREFIX + id,
        MODULE_DEFINITIONS.list.defaultData
    );

    const { isEditMode } = useDashboardMode();

    const containerRef = useRef(null);
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const observer = new ResizeObserver(([entry]) => {
            const { width, height } = entry.contentRect;
            const scale = Math.min(width / 300, height / 220);
            el.style.setProperty('--list-scale', Math.max(0.5, Math.min(scale, 1.8)));
        });
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const [editingNameId, setEditingNameId] = useState(null);
    const [nameValue, setNameValue] = useState("");
    const [editingQtyId, setEditingQtyId] = useState(null);
    const [qtyValue, setQtyValue] = useState("");
    const [dragItemId, setDragItemId] = useState(null);
    const [dragOverItemId, setDragOverItemId] = useState(null);

    function handleAddItem() {
        const newItem = {
            id: generateUUID(),
            name: "",
            quantity: 1,
            checked: false,
        };
        setData({ ...data, items: [...data.items, newItem] });
    }

    function handleRemoveItem(itemId) {
        const updatedItems = data.items.filter((item) => item.id !== itemId);
        setData({ ...data, items: updatedItems });
    }

    function startEditingName(item) {
        setEditingNameId(item.id);
        setNameValue(item.name);
    }

    function commitNameEdit(item) {
        const updatedItems = data.items.map((i) => {
            if (i.id !== item.id) return i;
            return { ...i, name: nameValue.trim() };
        });
        setData({ ...data, items: updatedItems });
        setEditingNameId(null);
    }

    function startEditingQty(item) {
        setEditingQtyId(item.id);
        setQtyValue(String(item.quantity));
    }

    function commitQtyEdit(item) {
        const parsed = parseInt(qtyValue, 10);
        if (!isNaN(parsed) && parsed >= 0) {
            const updatedItems = data.items.map((i) => {
                if (i.id !== item.id) return i;
                return { ...i, quantity: parsed };
            });
            setData({ ...data, items: updatedItems });
        }
        setEditingQtyId(null);
    }

    function handleClearChecked() {
        const updatedItems = data.items.filter((item) => !item.checked);
        setData({ ...data, items: updatedItems });
    }

    function handleDrop() {
        if (dragItemId === null || dragOverItemId === null || dragItemId === dragOverItemId) {
            setDragItemId(null);
            setDragOverItemId(null);
            return;
        }

        const items = [...data.items];
        const dragIndex = items.findIndex((i) => i.id === dragItemId);
        const dropIndex = items.findIndex((i) => i.id === dragOverItemId);

        const [draggedItem] = items.splice(dragIndex, 1);
        items.splice(dropIndex, 0, draggedItem);

        setData({ ...data, items });
        setDragItemId(null);
        setDragOverItemId(null);
    }

    const sortedItems = [...data.items].sort((a, b) => {
        if (a.checked === b.checked) return 0;
        return a.checked ? 1 : -1;
    });

    return (
        <div className="list-module" ref={containerRef}>
            <ModuleHeader
                title={data.title}
                onTitleChange={(newTitle) => setData({ ...data, title: newTitle })}
                onRemove={() => onRemove(id)}
                onSettings={() => onSettings(id)}
            />
            <div className="list-module__body">
{data.items.some((i) => i.checked) && (
                    <button
                        className="list-module__clear-btn"
                        onClick={handleClearChecked}
                    >
                        Clear checked
                    </button>
                )}
                {data.items.length === 0 && (
                    <div className="list-module__empty">No items yet</div>
                )}
                {sortedItems.map((item) => (
                    <div
                        key={item.id}
                        className={`list-item ${item.checked ? "list-item--checked" : ""} ${dragOverItemId === item.id ? "list-item--drag-over" : ""}`}
                        onDragOver={(e) => {
                            e.preventDefault();
                            setDragOverItemId(item.id);
                        }}
                        onDrop={handleDrop}
                    >
                        {isEditMode && (
                            <span
                                className="list-item__drag-handle"
                                draggable
                                onDragStart={(e) => {
                                    e.dataTransfer.setData("text/plain", item.id);
                                    setDragItemId(item.id);
                                }}
                                onDragEnd={() => {
                                    setDragItemId(null);
                                    setDragOverItemId(null);
                                }}
                            >⠿</span>
                        )}
                        {(data.showCheckbox ?? true) && (
                            <input
                                type="checkbox"
                                className="list-item__checkbox"
                                checked={item.checked}
                                onChange={() => {
                                    const updatedItems = data.items.map((i) => {
                                        if (i.id !== item.id) return i;
                                        return { ...i, checked: !i.checked };
                                    });
                                    setData({ ...data, items: updatedItems });
                                }}
                            />
                        )}
                        {editingNameId === item.id ? (
                            <input
                                className="list-item__name-input"
                                type="text"
                                value={nameValue}
                                placeholder="New Item"
                                onChange={(e) => setNameValue(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") commitNameEdit(item);
                                    if (e.key === "Escape") setEditingNameId(null);
                                }}
                                onBlur={() => commitNameEdit(item)}
                                autoFocus
                            />
                        ) : (
                            <span
                                className="list-item__name"
                                onClick={() => startEditingName(item)}
                                style={{ cursor: "pointer" }}
                            >
                                {item.name || <span style={{ opacity: 0.4, fontStyle: "italic" }}>New Item</span>}
                            </span>
                        )}
                        {(data.showQuantity ?? true) && (editingQtyId === item.id ? (
                            <input
                                className="list-item__qty-input"
                                type="number"
                                min={0}
                                value={qtyValue}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value, 10);
                                    if (isNaN(val)) {
                                        setQtyValue(e.target.value);
                                    } else {
                                        setQtyValue(String(Math.max(0, val)));
                                    }
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") commitQtyEdit(item);
                                    if (e.key === "Escape") setEditingQtyId(null);
                                }}
                                onBlur={() => commitQtyEdit(item)}
                                autoFocus
                            />
                        ) : (
                            <span
                                className="list-item__quantity"
                                onClick={() => startEditingQty(item)}
                                style={{ cursor: "pointer" }}
                            >
                                x{item.quantity}
                            </span>
                        ))}
                        {isEditMode && (
                            <button
                                className="list-item__delete-btn"
                                onClick={() => handleRemoveItem(item.id)}
                            >
                                ×
                            </button>
                        )}
                    </div>
                ))}
                <button
                    className="list-module__add-btn"
                    onClick={handleAddItem}
                >
                    + Add Item
                </button>
            </div>
        </div>
    );
}