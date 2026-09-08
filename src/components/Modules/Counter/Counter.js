"use client"
import { useState, useRef, useEffect } from 'react'
import ModuleHeader from '../ModuleHeader.js/ModuleHeader'
import './Counter.css'
import { useSession, MODULE_SESSION_PREFIX } from '@/client_API_calls/session_storage/useSession'
import { MODULE_DEFINITIONS } from '@/module_definitions/module_definitions';


export default function Counter({ id, onRemove, onSettings }) {
    const [data, setData] = useSession(
        MODULE_SESSION_PREFIX + id,
        MODULE_DEFINITIONS.counter.defaultData
    );

    const containerRef = useRef(null)

    useEffect(() => {
        const el = containerRef.current
        if (!el) return
        const observer = new ResizeObserver(([entry]) => {
            const { width, height } = entry.contentRect
            const scale = Math.min(width / 150, height / 130)
            el.style.setProperty('--ctr-scale', Math.max(0.5, Math.min(scale, 2.5)))
        })
        observer.observe(el)
        return () => observer.disconnect()
    }, [])

    const [flash, setFlash] = useState(null);
    const [editing, setEditing] = useState(false);
    const [editValue, setEditValue] = useState('');
    const inputRef = useRef(null);
    const prevValue = useRef(data.value);

    const { min, max, increment, value, prefix, suffix } = data;
    const atMin = value <= min;
    const atMax = value >= max;

    useEffect(() => {
        if (value !== prevValue.current) {
            setFlash(value > prevValue.current ? 'up' : 'down');
            const timeout = setTimeout(() => setFlash(null), 300);
            prevValue.current = value;
            return () => clearTimeout(timeout);
        }
    }, [value]);

    function handleDecrement() {
        const next = Math.max(min, value - increment);
        setData({ ...data, value: next });
    }

    function handleIncrement() {
        const next = Math.min(max, value + increment);
        setData({ ...data, value: next });
    }

    function handleValueClick() {
        setEditing(true);
        setEditValue(String(value));
        setTimeout(() => inputRef.current?.select(), 0);
    }

    function handleEditSubmit() {
        const parsed = parseInt(editValue, 10);
        if (!isNaN(parsed)) {
            const clamped = Math.max(min, Math.min(max, parsed));
            setData({ ...data, value: clamped });
        }
        setEditing(false);
    }

    const btnLabel = increment !== 1 ? increment : '';

    return (
        <div className="counter" ref={containerRef}>
            <ModuleHeader
                title={data.title}
                onTitleChange={(newTitle) => setData({ ...data, title: newTitle })}
                onRemove={() => onRemove(id)}
                onSettings={() => onSettings(id)}
                onReset={() => setData({ ...data, value: data.defaultValue })}
            />

            <div className="counter-body">
                <div className={`counter-value ${flash === 'up' ? 'counter-value--flash-up' : flash === 'down' ? 'counter-value--flash-down' : ''}`}>
                    {editing ? (
                        <input
                            ref={inputRef}
                            className="counter-value__input"
                            type="text"
                            inputMode="numeric"
                            value={editValue}
                            onChange={(e) => {
                                const v = e.target.value;
                                if (v === '' || v === '-' || /^-?\d+$/.test(v)) setEditValue(v);
                            }}
                            onBlur={handleEditSubmit}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleEditSubmit(); }}
                        />
                    ) : (
                        <span
                            className="counter-value__display"
                            onDoubleClick={handleValueClick}
                            title="Double-click to edit"
                        >
                            <span className="counter-value__unit counter-value__unit--prefix">{prefix}</span>
                            {value}
                            <span className="counter-value__unit counter-value__unit--suffix">{suffix}</span>
                        </span>
                    )}
                </div>

                <div className="counter-btns">
                    <button
                        className="counter-btn counter-btn--dec"
                        onClick={handleDecrement}
                        disabled={atMin}
                    >
                        <span className="counter-btn__symbol">−</span>
                        {btnLabel && <span className="counter-btn__label">{btnLabel}</span>}
                    </button>

                    <button
                        className="counter-btn counter-btn--inc"
                        onClick={handleIncrement}
                        disabled={atMax}
                    >
                        <span className="counter-btn__symbol">+</span>
                        {btnLabel && <span className="counter-btn__label">{btnLabel}</span>}
                    </button>
                </div>
            </div>
        </div>
    )
}
