"use client"
import { useState, useEffect, useRef, useCallback } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material'
import './Stopwatch.css'
import ModuleHeader from '../ModuleHeader.js/ModuleHeader'
import { useSession, MODULE_SESSION_PREFIX } from '@/client_API_calls/session_storage/useSession'
import { MODULE_DEFINITIONS } from '@/module_definitions/module_definitions';

function FlipDigit({ digit }) {
    const pieceRef = useRef(null)
    const currentRef = useRef(null)
    const elemsRef = useRef(null)

    const initRef = useCallback((el) => {
        if (!el || pieceRef.current) return
        pieceRef.current = el

        const top = el.querySelector('.flip-card__top')
        const bottom = el.querySelector('.flip-card__bottom')
        const back = el.querySelector('.flip-card__back')
        const backBottom = el.querySelector('.flip-card__back .flip-card__bottom')

        elemsRef.current = { top, bottom, back, backBottom }

        // Set initial value imperatively
        currentRef.current = digit
        top.innerText = digit
        bottom.setAttribute('data-value', digit)
        back.setAttribute('data-value', digit)
        backBottom.setAttribute('data-value', digit)
    }, [])

    useEffect(() => {
        const piece = pieceRef.current
        const elems = elemsRef.current
        if (!piece || !elems) return

        const val = digit
        if (val !== currentRef.current) {
            const { top, bottom, back, backBottom } = elems

            back.setAttribute('data-value', currentRef.current)
            bottom.setAttribute('data-value', currentRef.current)

            currentRef.current = val
            top.innerText = val
            backBottom.setAttribute('data-value', val)

            piece.classList.remove('flip')
            void piece.offsetWidth
            piece.classList.add('flip')
        }
    }, [digit])

    return (
        <span ref={initRef} className="flip-clock__piece">
            <b className="flip-clock__card flip-card">
                <b className="flip-card__top" />
                <b className="flip-card__bottom" />
                <b className="flip-card__back">
                    <b className="flip-card__bottom" />
                </b>
            </b>
        </span>
    )
}

export default function Stopwatch({ id, onRemove, onSettings }) {

    const containerRef = useRef(null)

    useEffect(() => {
        const el = containerRef.current
        if (!el) return
        const observer = new ResizeObserver(([entry]) => {
            const { width, height } = entry.contentRect
            const scale = Math.min(width / 150, height / 110)
            el.style.setProperty('--sw-scale', Math.max(0.5, Math.min(scale, 2.5)))
        })
        observer.observe(el)
        return () => observer.disconnect()
    }, [])

    const [data, setData] = useSession(
        MODULE_SESSION_PREFIX + id,
        MODULE_DEFINITIONS.stopwatch.defaultData
    )

    // Tick to force re-renders while running (does not store time itself)
    const [, setTick] = useState(0)
    const [showFinishedModal, setShowFinishedModal] = useState(false)
    const prevTimerSettings = useRef({ mode: data.mode, timerMinutes: data.timerMinutes, timerSeconds: data.timerSeconds })

    const isTimer = data.mode === 'timer'
    const timerDuration = (data.timerMinutes || 0) * 60 + (data.timerSeconds || 0)
    const isRunning = !!data.startedAt

    // Derive elapsed seconds from stored timestamp so refreshes are handled correctly
    const currentSeconds = (data.elapsedSeconds || 0) +
        (isRunning ? Math.floor((Date.now() - data.startedAt) / 1000) : 0)

    const finished = isTimer && currentSeconds >= timerDuration && !isRunning
    const displaySeconds = isTimer ? Math.max(0, timerDuration - currentSeconds) : currentSeconds

    // Tick interval — just forces re-renders, doesn't own the time
    useEffect(() => {
        if (!isRunning) return
        const interval = setInterval(() => setTick(t => t + 1), 500)
        return () => clearInterval(interval)
    }, [isRunning])

    // Auto-stop when countdown timer reaches zero
    useEffect(() => {
        if (isTimer && isRunning && currentSeconds >= timerDuration) {
            setData(prev => ({ ...prev, elapsedSeconds: timerDuration, startedAt: null }))
            setShowFinishedModal(true)
        }
    }, [currentSeconds]) 

    // Reset elapsed time only when the user actually changes mode or timer duration
    useEffect(() => {
        const prev = prevTimerSettings.current
        const changed = prev.mode !== data.mode || prev.timerMinutes !== data.timerMinutes || prev.timerSeconds !== data.timerSeconds
        prevTimerSettings.current = { mode: data.mode, timerMinutes: data.timerMinutes, timerSeconds: data.timerSeconds }
        if (!changed) return
        setData(prev => ({ ...prev, elapsedSeconds: 0, startedAt: null }))
    }, [data.mode, data.timerMinutes, data.timerSeconds]) 

    function getTimeDigits(totalSeconds) {
        const hrs = Math.floor(totalSeconds / 3600)
        const mins = Math.floor((totalSeconds % 3600) / 60)
        const secs = totalSeconds % 60
        const pad = (n) => n.toString().padStart(2, '0')
        if (hrs > 0) {
            return { groups: [pad(hrs), pad(mins), pad(secs)] }
        }
        return { groups: [pad(mins), pad(secs)] }
    }

    function handleStartPause() {
        if (finished) return
        if (isTimer && currentSeconds >= timerDuration) return
        if (isRunning) {
            // Pause: snapshot elapsed, clear startedAt
            setData(prev => ({ ...prev, elapsedSeconds: currentSeconds, startedAt: null }))
        } else {
            // Start: record timestamp
            setData(prev => ({ ...prev, startedAt: Date.now() }))
        }
    }

    function handleReset() {
        setData(prev => ({ ...prev, elapsedSeconds: 0, startedAt: null }))
        setShowFinishedModal(false)
    }

    const startLabel = isRunning ? 'Pause' : finished ? 'Done' : 'Start'
    const startClass = isRunning ? 'stopwatch-pause' : finished ? 'stopwatch-finished-btn' : 'stopwatch-start'

    return (
        <>
        <Dialog open={showFinishedModal} onClose={() => setShowFinishedModal(false)}>
            <DialogTitle sx={{ textAlign: 'center' }}>Time's up!</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {data.title} has finished.
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleReset}>Reset</Button>
                <Button onClick={() => setShowFinishedModal(false)} variant="contained">Dismiss</Button>
            </DialogActions>
        </Dialog>
        <div ref={containerRef} className={`stopwatch ${finished ? 'stopwatch--finished' : ''}`}>
            <ModuleHeader
                title={data.title}
                onTitleChange={(newTitle) => setData({ ...data, title: newTitle })}
                onRemove={() => onRemove(id)}
                onSettings={() => onSettings(id)}
            />

            <div className="stopwatch-body">
                <div className={`stopwatch-display ${finished ? 'stopwatch-display--finished' : ''}`}>
                    {getTimeDigits(displaySeconds).groups.map((group, gi) => (
                        <span key={gi} className="flip-group">
                            {gi > 0 && <span className="flip-colon">:</span>}
                            {group.split('').map((digit, di) => (
                                <FlipDigit key={`${gi}-${di}`} digit={digit} />
                            ))}
                        </span>
                    ))}
                </div>

                <div className="stopwatch-controls">
                    <button
                        onClick={handleStartPause}
                        className={startClass}
                        disabled={finished}
                    >
                        {startLabel}
                    </button>

                    <button onClick={handleReset} className="stopwatch-reset">
                        Reset
                    </button>
                </div>
            </div>
        </div>
        </>
    )
}
