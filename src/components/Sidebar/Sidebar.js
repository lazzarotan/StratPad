"use client";
import "./Sidebar.css"
import ModuleItem from "./ModuleItem";
import { useDashboardMode } from "@/components/Dashboard/DashboardMode/DashboardModeContext";
import { ModuleType } from "@/module_definitions/module_definitions";
import { useState, useRef } from "react";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";


export default function Sidebar({ dashboardMetadata, setDashboardMetadata, onModuleDragStart, onModuleDragEnd }) {

    const { showSidebar, canRenameDashboard, canDragModules } = useDashboardMode();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isEditingName, setIsEditingName] = useState(false);
    const nameInputRef = useRef(null);

    if (!dashboardMetadata) return null;
    if (!showSidebar) return null;

    function handleNameChange(newName) {
        setDashboardMetadata({ ...dashboardMetadata, title: newName });
    }

    return (
        <div className="sidebar-shell">
            {isCollapsed && (
                <div className="sidebar-shell__toggle">
                    <IconButton
                        size="small"
                        className="sidebar-shell__toggle-btn"
                        aria-label="Expand sidebar"
                        onClick={() => setIsCollapsed(false)}
                    >
                        <ChevronRightIcon fontSize="small" />
                    </IconButton>
                </div>
            )}

            <Collapse
                orientation="horizontal"
                in={!isCollapsed}
                collapsedSize={0}
                sx={{
                    height: '100%',
                    '& .MuiCollapse-wrapper, & .MuiCollapse-wrapperInner': {
                        height: '100%',
                    },
                }}
            >
                <div className="sidebar">
                    <div className="sidebar__header">
                        <div className="sidebar__name-row">
                            <input
                                ref={nameInputRef}
                                className={`sidebar__name-input${isEditingName ? ' sidebar__name-input--editing' : ''}`}
                                type="text"
                                value={dashboardMetadata.title}
                                onChange={(e) => handleNameChange(e.target.value)}
                                readOnly={!isEditingName}
                                onKeyDown={(e) => { if (e.key === 'Enter') setIsEditingName(false); }}
                            />
                            {canRenameDashboard && (
                                <IconButton
                                    size="small"
                                    className="sidebar__name-edit-btn"
                                    aria-label={isEditingName ? "Confirm name" : "Edit name"}
                                    onClick={() => {
                                        if (!isEditingName) {
                                            setIsEditingName(true);
                                            setTimeout(() => nameInputRef.current?.focus(), 0);
                                        } else {
                                            setIsEditingName(false);
                                        }
                                    }}
                                >
                                    {isEditingName
                                        ? <CheckIcon sx={{ fontSize: 14 }} />
                                        : <EditIcon sx={{ fontSize: 14 }} />
                                    }
                                </IconButton>
                            )}
                        </div>
                        <div className="sidebar__collapse-row">
                            <IconButton
                                size="small"
                                className="sidebar__collapse-btn"
                                aria-label="Collapse sidebar"
                                onClick={() => setIsCollapsed(true)}
                            >
                                <ChevronLeftIcon fontSize="small" />
                            </IconButton>
                        </div>
                    </div>

                    <div className="sidebar__modules">
                        <ModuleItem moduleId={ModuleType.scoreTable}    label="Score Table" icon="/icons/score.svg" onModuleDragStart={onModuleDragStart} onModuleDragEnd={onModuleDragEnd} isDragEnabled={canDragModules}/>
                        <ModuleItem moduleId={ModuleType.stopwatch}     label="Stopwatch" icon="/icons/timer.svg" onModuleDragStart={onModuleDragStart} onModuleDragEnd={onModuleDragEnd} isDragEnabled={canDragModules}/>
                        <ModuleItem moduleId={ModuleType.notes}         label="Notes" icon="/icons/notes.svg" onModuleDragStart={onModuleDragStart} onModuleDragEnd={onModuleDragEnd} isDragEnabled={canDragModules}/>
                        <ModuleItem moduleId={ModuleType.nestedDictionary} label="Nested Dictionary" icon="/icons/nestedDictionary.svg" onModuleDragStart={onModuleDragStart} onModuleDragEnd={onModuleDragEnd} isDragEnabled={canDragModules}/>
                        <ModuleItem moduleId={ModuleType.list}          label="List" icon="/icons/list.svg" onModuleDragStart={onModuleDragStart} onModuleDragEnd={onModuleDragEnd} isDragEnabled={canDragModules}/>
                        <ModuleItem moduleId={ModuleType.counter}       label="Counter" icon="/icons/counter.svg" onModuleDragStart={onModuleDragStart} onModuleDragEnd={onModuleDragEnd} isDragEnabled={canDragModules}/>
                        <ModuleItem moduleId={ModuleType.resourceBar}   label="Resource Bar" icon="/icons/resourceBar.svg" onModuleDragStart={onModuleDragStart} onModuleDragEnd={onModuleDragEnd} isDragEnabled={canDragModules}/>
                        <ModuleItem moduleId={ModuleType.singleImage}   label="Image" icon="/icons/singleImage.svg" onModuleDragStart={onModuleDragStart} onModuleDragEnd={onModuleDragEnd} isDragEnabled={canDragModules}/>
                        <ModuleItem moduleId={ModuleType.dice}          label="Dice" icon="/icons/dice.svg" onModuleDragStart={onModuleDragStart} onModuleDragEnd={onModuleDragEnd} isDragEnabled={canDragModules}/>
                        <ModuleItem moduleId={ModuleType.coinToss}      label="Coin Toss" icon="/icons/coinToss.svg" onModuleDragStart={onModuleDragStart} onModuleDragEnd={onModuleDragEnd} isDragEnabled={canDragModules}/>
                        <ModuleItem moduleId={ModuleType.spinWheel}     label="Spin Wheel" icon="/icons/spinWheel.svg" onModuleDragStart={onModuleDragStart} onModuleDragEnd={onModuleDragEnd} isDragEnabled={canDragModules}/>
                    </div>
                </div>
            </Collapse>
        </div>
    );
}