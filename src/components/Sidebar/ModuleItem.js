"use client";

export default function ModuleItem({ moduleId, label, icon, onModuleDragStart, onModuleDragEnd, isDragEnabled = true }) {
    function handleDragStart(e) {
        e.dataTransfer.setData("text/plain", moduleId);
        e.dataTransfer.effectAllowed = "move";
        onModuleDragStart?.(moduleId);
    }

    function handleDragEnd() {
        onModuleDragEnd?.();
    }

    return (
        <div className="module-item" draggable={isDragEnabled}
            onDragStart={(e) => {
                if (!isDragEnabled) return;
                handleDragStart(e);
            }}
            onDragEnd={(e) => {
                if (!isDragEnabled) return;
                handleDragEnd(e);
            }}>
            <img className="module-icon" src={icon} alt={label} />
            <div className="module-label">{label}</div>
        </div>
    );
}
