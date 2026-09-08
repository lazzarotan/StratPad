"use client"

import './ModuleHeader.css';
import { useState, useRef, useEffect } from 'react';
import { useDashboardMode } from "@/components/Dashboard/DashboardMode/DashboardModeContext";
import { IconButton, Icon } from '@mui/material';
import { RestartAlt, Settings, Clear } from '@mui/icons-material';

export default function ModuleHeader({ title, onTitleChange, onRemove, onSettings, onReset, children}) {

    const { canDeleteModules, canRenameDashboard, canDragModules, canOpenSettings } = useDashboardMode();
    const [editing, setEditing] = useState(false);
    const inputRef = useRef(null);
    const headerRef = useRef(null);

    useEffect(() => {
        if (!editing) return;

        inputRef.current?.select();

        function handleClickOutside(e) {
            if (!headerRef.current?.contains(e.target)) {
                setEditing(false);
                inputRef.current?.blur();
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [editing]);

    function handleDoubleClick() {
        if (!canRenameDashboard) return;
        setEditing(true);
    }

    function handleFinishEditing() {
        setEditing(false);
    }

    function handleSettingsClick(e) {
        console.log('handleSettingsClick', e);
        e.stopPropagation();
        onSettings();
    }
    function handleResetClick(e) {
        console.log('handleResetClick', e);
        e.stopPropagation();
        onReset();
    }
    function handleRemoveClick(e) {
        console.log('handleRemoveClick', e);
        e.stopPropagation();
        onRemove();
    }



    return (
        <div className={`module-header ${canDragModules ? 'module-header__drag-handle' : 'module-header--play'}`}>
            {canOpenSettings && (
                <IconButton size="x-small" onClick={handleSettingsClick} onTouchStart={handleSettingsClick} title="Settings">
                    <img src='/icons/gear.svg' alt='Settings' width={25} height={25} />
                </IconButton>
            )}
            {/* <button className='module-header__btn' onClick={handleSettingsClick} onTouchStart={handleSettingsClick}>
                    <img src='/icons/gear.svg' alt='Settings' />
            </button> */}

            {editing ? (
                <input
                    ref={inputRef}
                    className='module-header__title module-header__title--editing'
                    type='text'
                    value={title}
                    onChange={(e) => onTitleChange(e.target.value)}
                    onBlur={handleFinishEditing}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleFinishEditing(); }}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                />
            ) : (
                <span
                    className='module-header__title'
                    onDoubleClick={handleDoubleClick}
                >
                    {title}
                </span>
            )}

            <div className='module-header__actions'>
                {onReset && (
                    <IconButton size="x-small" onClick={handleResetClick} onTouchStart={handleResetClick} title="Reset">
                        <RestartAlt />
                    </IconButton>
                    // <button className="module-header__btn" onClick={handleResetClick} onTouchStart={handleResetClick} title="Reset">
                    //     ↻
                    // </button>
                )}
                {children}
                
                {canDeleteModules && (
                    <IconButton size="x-small" onClick={handleRemoveClick} onTouchStart={handleRemoveClick} title="Remove">
                        <Clear />
                    </IconButton>
                    // <button className='module-header__btn module-header__btn--remove' onClick={handleRemoveClick} onTouchStart={handleRemoveClick}>
                    //     x
                    // </button>
                )}
            </div>
        </div>
    );
}