"use client"
import { useState, useRef, useEffect } from "react";
import {useSession, MODULE_SESSION_PREFIX } from "@/client_API_calls/session_storage/useSession";
import { MODULE_DEFINITIONS } from "@/module_definitions/module_definitions";
import ModuleHeader from "../ModuleHeader.js/ModuleHeader";
import { useDashboardMode } from "@/components/Dashboard/DashboardMode/DashboardModeContext";
import "./ResourceBar.css";
import { generateUUID } from "@/components/Dashboard/moduleFactory";

export default function ResourceBar({ id, onRemove, onSettings}) {
    const [data, setData] = useSession(
        MODULE_SESSION_PREFIX + id,
        MODULE_DEFINITIONS.resourceBar.defaultData
    );

    const { isEditMode } = useDashboardMode();

    const containerRef = useRef(null);
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const observer = new ResizeObserver(([entry]) => {
            const { width, height } = entry.contentRect;
            const scale = Math.min(width / 200, height / 140);
            el.style.setProperty('--rb-scale', Math.max(0.5, Math.min(scale, 2.5)));
        });
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const [editingBarId, setEditingBarId] = useState(null);
    const [inputValue, setInputValue] = useState("");
    const [editingLabelBarId, setEditingLabelBarId] = useState(null);
    const [labelValue, setLabelValue] = useState("");
    const [draggingBarId, setDraggingBarId] = useState(null);

    function updateBarValue(barId, newValue) {
        const updatedBars = data.bars.map((bar) => {
            if (bar.id !== barId) return bar;
            const clamped = Math.max(bar.min, Math.min(bar.max, newValue));
            return { ...bar, value: clamped };
        });
        setData({ ...data, bars: updatedBars });
    }

    function getValueFromMouseX(clientX, trackElement, bar) {
        const rect = trackElement.getBoundingClientRect();
        const clickX = Math.max(0, Math.min(rect.width, clientX - rect.left));
        const percent = clickX / rect.width;
        return Math.round(bar.min + percent * (bar.max - bar.min));
    }

    function handleTrackPointerDown(event, bar) {
        const track = event.currentTarget;
        track.setPointerCapture(event.pointerId);

        setDraggingBarId(bar.id);
        updateBarValue(bar.id, getValueFromMouseX(event.clientX, track, bar));

        function onPointerMove(e) {
            updateBarValue(bar.id, getValueFromMouseX(e.clientX, track, bar));
        }

        function onPointerUp() {
            setDraggingBarId(null);
            track.removeEventListener("pointermove", onPointerMove);
            track.removeEventListener("pointerup", onPointerUp);
        }

        track.addEventListener("pointermove", onPointerMove);
        track.addEventListener("pointerup", onPointerUp);
    }

    function startEditing(bar) {
        setEditingBarId(bar.id);
        setInputValue(String(bar.value));
    }

    function commitEdit(bar) {
        const parsed = parseInt(inputValue, 10);
        if (!isNaN(parsed)) {
            updateBarValue(bar.id, parsed);
        }
        setEditingBarId(null);
    }

    function startEditingLabel(bar) {
        setEditingLabelBarId(bar.id);
        setLabelValue(bar.label);
    }

    function commitLabelEdit(bar) {
        const updatedBars = data.bars.map((b) => {
            if (b.id !== bar.id) return b;
            return { ...b, label: labelValue.trim() };
        });
        setData({ ...data, bars: updatedBars });
        setEditingLabelBarId(null);
    }

    const BAR_COLORS = [
        "#ef4444", "#2563eb", "#16a34a", "#d97706",
        "#06b6d4", "#65a30d", "#ea580c", "#ec4899",
        "#c026d3", "#8b5cf6",
    ];

    function handleAddBar() {
        const colorIndex = data.bars.length % BAR_COLORS.length;
        const newBar = {
            id: generateUUID(),
            label: "",
            value: 100,
            defaultValue: 100,
            min: 0,
            max: 100,
            increment: 1,
            color: BAR_COLORS[colorIndex],
        };
        setData({ ...data, bars: [...data.bars, newBar] });
    }

    function handleReset() {
        const updatedBars = data.bars.map((bar) => ({
            ...bar,
            value: bar.defaultValue ?? bar.max,
        }));
        setData({ ...data, bars: updatedBars });
    }

    return (
        <div className="resource-bar-module" ref={containerRef}>
            <ModuleHeader
                title={data.title}
                onTitleChange={(newTitle) => setData({ ...data, title: newTitle})}
                onRemove={() => onRemove(id)}
                onSettings={() => onSettings(id)}
                onReset={handleReset}
            />
            <div className="resource-bar-module__body">
                {data.bars.map((bar) => {
                    const range = bar.max - bar.min;
                    const percent = range > 0
                        ? Math.max(0, Math.min(100, ((bar.value - bar.min) / range) * 100))
                        : 0;

                    return (
                        <div key={bar.id} className="resource-bar">
                            <div className="resource-bar__label-row">
                                {editingLabelBarId === bar.id ? (
                                    <input
                                        className="resource-bar__label-input"
                                        type="text"
                                        value={labelValue}
                                        placeholder="Label"
                                        onChange={(e) => setLabelValue(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") commitLabelEdit(bar);
                                            if (e.key === "Escape") setEditingLabelBarId(null);
                                        }}
                                        onBlur={() => commitLabelEdit(bar)}
                                        autoFocus
                                    />
                                ) : (
                                    <span
                                        className="resource-bar__label"
                                        onClick={() => startEditingLabel(bar)}
                                        style={{ cursor: "pointer" }}
                                    >
                                        {bar.label || <span style={{ opacity: 0.4, fontStyle: "italic" }}>Label</span>}
                                    </span>
                                )}
                                {editingBarId === bar.id ? (
                                    <input
                                        className="resource-bar__value-input"
                                        type="number"
                                        min={bar.min}
                                        max={bar.max}
                                        value={inputValue}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value, 10);
                                            if (isNaN(val)) {
                                                setInputValue(e.target.value);
                                            } else {
                                                setInputValue(String(Math.max(bar.min, Math.min(bar.max, val))));
                                            }
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") commitEdit(bar);
                                            if (e.key === "Escape") setEditingBarId(null);
                                        }}
                                        onBlur={() => commitEdit(bar)}
                                        autoFocus
                                    />
                                ) : (
                                    <span
                                        className="resource-bar__value-text"
                                        onClick={() => startEditing(bar)}
                                        style={{ cursor: "pointer" }}
                                    >
                                        {bar.value} / {bar.max}
                                    </span>
                                )}
                            </div>
                            <div className="resource-bar__controls">
                                <button
                                    className="resource-bar__btn"
                                    onClick={() => updateBarValue(bar.id, bar.value - bar.increment)}
                                >
                                    −
                                </button>
                                <div
                                    className="resource-bar__track"
                                    onPointerDown={(e) => handleTrackPointerDown(e, bar)}
                                    style={{ cursor: "pointer", touchAction: "none" }}
                                >
                                    <div
                                        className="resource-bar__fill"
                                        style={{
                                            width: `${percent}%`,
                                            background: bar.color,
                                            '--bar-color': bar.color,
                                        }}
                                    >
                                        {draggingBarId === bar.id && <div className="resource-bar__wave" />}
                                    </div>
                                </div>
                                <button
                                    className="resource-bar__btn"
                                    onClick={() => updateBarValue(bar.id, bar.value + bar.increment)}
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    );
                })}
                {isEditMode && (
                    <button
                        className="resource-bar__add-btn"
                        onClick={handleAddBar}
                    >
                        + Add Bar
                    </button>
                )}
            </div>
        </div>
    );
}