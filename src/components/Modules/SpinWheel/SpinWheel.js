"use client"
import { useState, useRef, useEffect } from 'react'
import ModuleHeader from '../ModuleHeader.js/ModuleHeader'
import './SpinWheel.css'
import { useSession, MODULE_SESSION_PREFIX } from '@/client_API_calls/session_storage/useSession'
import { MODULE_DEFINITIONS } from '@/module_definitions/module_definitions';
const wheelColors = [
    "#8b5cf6", 
    "#2563eb", 
    "#06b6d4", 
    "#16a34a", 
    "#65a30d", 
    "#ea580c",
    "#dc2626", 
    "#ec4899", 
    "#c026d3", 
    "#d97706", 
]

export default function SpinWheel({ id, onRemove, onSettings }) {

    const [data, setData] = useSession(
        MODULE_SESSION_PREFIX + id,
        MODULE_DEFINITIONS.spinWheel.defaultData
    )

    const [rotation, setRotation] = useState(0)
    const [spinning, setSpinning] = useState(false)
    const [result, setResult] = useState(null)
    const [editingIndex, setEditingIndex] = useState(null)
    const [returning, setReturning] = useState(false)
    const [containerSize, setContainerSize] = useState(150)
    const preEditRotation = useRef(null)
    const canvasRef = useRef(null)
    const rootRef = useRef(null)
    const wheelAreaRef = useRef(null)
    const drawWheelRef = useRef(null)

    function drawWheel() {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        const dpr = Math.max(window.devicePixelRatio || 1, 2)
        const size = canvas.width / dpr
        const center = size / 2
        const outerRadius = center

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        const segmentAngle = 360 / data.segments.length
        const fontSize = Math.max(10, Math.round(size * 0.067))

        data.segments.forEach((label, index) => {
            const startAngle = (segmentAngle * index - 90) * (Math.PI / 180)
            const endAngle = (segmentAngle * (index + 1) - 90) * (Math.PI / 180)

            // Draw segment slice
            ctx.beginPath()
            ctx.moveTo(center, center)
            ctx.arc(center, center, outerRadius, startAngle, endAngle)
            ctx.closePath()

            ctx.fillStyle = wheelColors[index % wheelColors.length]
            ctx.fill()

            ctx.strokeStyle = 'rgba(229, 231, 235, 0.6)'
            ctx.lineWidth = 1
            ctx.stroke()

            // Draw text
            ctx.save()
            ctx.translate(center, center)
            const textAngle = (segmentAngle * index + segmentAngle / 2 - 90) * (Math.PI / 180)
            ctx.rotate(textAngle)

            ctx.fillStyle = '#ffffff'
            ctx.font = `bold ${fontSize}px Arial`
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'

            const maxWidth = outerRadius * 0.55
            let displayLabel = label
            while (ctx.measureText(displayLabel).width > maxWidth && displayLabel.length > 1) {
                displayLabel = displayLabel.slice(0, -1)
            }
            if (displayLabel !== label) displayLabel += '…'

            ctx.fillText(displayLabel, outerRadius * 0.65, 0)

            ctx.restore()
        })
    }

    drawWheelRef.current = drawWheel

    useEffect(() => {
        drawWheel()
    }, [data.segments])

    useEffect(() => {
        const root = rootRef.current
        if (!root) return

        const observer = new ResizeObserver(entries => {
            const { width, height } = entries[0].contentRect
            // Derive wheel size from the stable root element.
            // height - 40 removes the module header, then divide by 1.95 to
            // account for the body UI elements (controls, button, result, gaps)
            // which scale proportionally with the wheel.
            const sizeFromHeight = Math.round((height - 40) / 1.95)
            const sizeFromWidth = Math.round(width - 24)
            const size = Math.max(40, Math.min(sizeFromHeight, sizeFromWidth))
            const canvas = canvasRef.current
            const dpr = Math.max(window.devicePixelRatio || 1, 2)
            if (canvas) {
                canvas.width = Math.round(size * dpr)
                canvas.height = Math.round(size * dpr)
            }
            setContainerSize(size)
            drawWheelRef.current()
        })

        observer.observe(root)
        return () => observer.disconnect()
    }, [])

    function handleSpin() {
        if (spinning) return

        setSpinning(true)
        setEditingIndex(null)

        const extraSpins = 3 + Math.floor(Math.random() * 3)
        const segmentAngle = 360 / data.segments.length
        const winningIndex = Math.floor(Math.random() * data.segments.length)
        const segmentCenter = segmentAngle * winningIndex + segmentAngle / 2

        const currentAngle = rotation % 360
        const targetAngle = 360 - segmentCenter
        let delta = targetAngle - currentAngle
        if (delta < 0) delta += 360

        const targetRotation = rotation + (extraSpins * 360) + delta

        setRotation(targetRotation)

        setTimeout(() => {
            setResult(data.segments[winningIndex])
            setSpinning(false)
        }, 3050)
    }

    function handleSegmentCount(e) {
        const count = parseInt(e.target.value)

        if (count > data.segments.length) {
            const newSegments = [...data.segments]
            for (let i = data.segments.length + 1; i <= count; i++) {
                newSegments.push(`${i}`)
            }
            setData({ ...data, segments: newSegments })
        } else {
            setData({ ...data, segments: data.segments.slice(0, count) })
        }
        setRotation(0)
        setResult(null)
        setEditingIndex(null)
    }

    function handleCanvasClick(e) {
        if (spinning) return

        const canvas = canvasRef.current
        if (!canvas) return

        const rect = canvas.getBoundingClientRect()

        const scaleX = canvas.width / rect.width
        const scaleY = canvas.height / rect.height
        const x = (e.clientX - rect.left) * scaleX - canvas.width / 2
        const y = (e.clientY - rect.top) * scaleY - canvas.height / 2

        const distance = Math.sqrt(x * x + y * y)
        if (distance > canvas.width / 2) return

        let angle = Math.atan2(y, x) * (180 / Math.PI) + 90
        if (angle < 0) angle += 360

        const currentAngle = ((rotation % 360) + 360) % 360
        let adjustedAngle = angle - currentAngle
        if (adjustedAngle < 0) adjustedAngle += 360

        const segmentAngle = 360 / data.segments.length
        const clickedIndex = Math.floor(adjustedAngle / segmentAngle)

        // Save current rotation so we can restore it after editing
        preEditRotation.current = rotation

        // Rotate wheel so the clicked segment is horizontal (pointing right)
        const segmentCenter = segmentAngle * clickedIndex + segmentAngle / 2
        const targetRotation = 90 - segmentCenter
        const currentNormalized = ((rotation % 360) + 360) % 360
        let delta = ((targetRotation - currentNormalized) % 360 + 360) % 360
        if (delta > 180) delta -= 360

        setRotation(rotation + delta)
        setEditingIndex(clickedIndex)
    }

    function handleSegmentNameChange(e) {
        const newSegments = [...data.segments]
        newSegments[editingIndex] = e.target.value
        setData({ ...data, segments: newSegments })
    }

    function finishEditing() {
        if (editingIndex !== null && data.segments[editingIndex].trim() === '') {
            const newSegments = [...data.segments]
            newSegments[editingIndex] = `${editingIndex + 1}`
            setData({ ...data, segments: newSegments })
        }
        if (preEditRotation.current !== null) {
            setReturning(true)
            setRotation(preEditRotation.current)
            preEditRotation.current = null
            setTimeout(() => setReturning(false), 400)
        }
        setEditingIndex(null)
    }

    function handleSegmentNameSubmit(e) {
        if (e.key === 'Enter') {
            finishEditing()
        }
    }

    const scale = Math.max(0.6, Math.min(2.5, containerSize / 150))
    const s = (base) => Math.round(base * scale)

    return (
        <div className="spin-wheel" ref={rootRef}>
            <ModuleHeader
                title={data.title}
                onTitleChange={(newTitle) => setData({ ...data, title: newTitle })}
                onRemove={() => onRemove(id)}
                onSettings={() => onSettings(id)}
                onReset={() => {
                    setRotation(0)
                    setResult(null)
                    setEditingIndex(null)
                }}
            />

            <div className="spin-wheel__body" style={{ gap: s(16), paddingBottom: s(16) }}>
                <div className="spin-wheel__controls" style={{ fontSize: s(12) }}>
                    <label className="spin-wheel__label-text" htmlFor={`segment-count-${id}`}>
                        Size:
                    </label>
                    <select
                        id={`segment-count-${id}`}
                        className="spin-wheel__select"
                        value={data.segments.length}
                        onChange={handleSegmentCount}
                        style={{ fontSize: s(12), padding: `${s(2)}px ${s(6)}px` }}
                    >
                        {Array.from({ length: 19 }, (_, i) => i + 2).map((num) => (
                            <option key={num} value={num}>{num}</option>
                        ))}
                    </select>
                </div>

                <div className="spin-wheel__wheel-area" ref={wheelAreaRef}>
                <div className="spin-wheel__container" style={{ width: containerSize, height: containerSize }}>
                    <div className="spin-wheel__pointer" style={{ fontSize: s(22) }}>▼</div>

                    <div
                        className="spin-wheel__disc"
                        style={{
                            transform: `rotate(${rotation}deg)`,
                            transition: spinning
                                ? 'transform 3s cubic-bezier(0.17, 0.67, 0.12, 1)'
                                : (editingIndex !== null || returning)
                                    ? 'transform 0.4s ease'
                                    : 'none'
                        }}
                    >
                        <canvas
                            ref={canvasRef}
                            className="spin-wheel__canvas"
                            width={300}
                            height={300}
                            onClick={handleCanvasClick}
                        />
                    </div>

                    <div className="spin-wheel__hub"></div>

                    {editingIndex !== null && (() => {
                        const segmentAngle = 360 / data.segments.length
                        const angleDeg = segmentAngle * editingIndex + segmentAngle / 2 - 90 + (rotation % 360)
                        const angleRad = angleDeg * (Math.PI / 180)
                        const radius = containerSize / 2
                        const distance = 0.65 * radius

                        const x = radius + Math.cos(angleRad) * distance
                        const y = radius + Math.sin(angleRad) * distance

                        return (
                            <input
                                className="spin-wheel__inline-edit"
                                type="text"
                                value={data.segments[editingIndex]}
                                onChange={handleSegmentNameChange}
                                onKeyDown={handleSegmentNameSubmit}
                                onBlur={finishEditing}
                                autoFocus
                                style={{
                                    left: `${x}px`,
                                    top: `${y}px`,
                                    transform: `translate(-50%, -50%) rotate(${angleDeg}deg)`
                                }}
                            />
                        )
                    })()}
                </div>
                </div>

                <button
                    className="spin-wheel__btn"
                    onClick={handleSpin}
                    disabled={spinning}
                    style={{ fontSize: s(14), padding: `${s(6)}px ${s(16)}px` }}
                >
                    {spinning ? 'Spinning...' : 'Spin!'}
                </button>

                <p className="spin-wheel__result" style={{ fontSize: s(14) }}>
                    {result ? result : 'Click to spin'}
                </p>
            </div>
        </div>
    )
}