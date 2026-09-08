"use client"
import { useState, useRef, useEffect } from 'react'
import { useSession, MODULE_SESSION_PREFIX } from "@/client_API_calls/session_storage/useSession"
import './CoinToss.css'
import ModuleHeader from '../ModuleHeader.js/ModuleHeader'
import { MODULE_DEFINITIONS } from '@/module_definitions/module_definitions';

export default function CoinToss({ id, onRemove, onSettings }) {
    const [data, setData] = useSession(
        MODULE_SESSION_PREFIX + id,
        MODULE_DEFINITIONS.coinToss.defaultData
    );

    const containerRef = useRef(null)

    useEffect(() => {
        const el = containerRef.current
        if (!el) return
        const observer = new ResizeObserver(([entry]) => {
            const { width } = entry.contentRect
            el.style.setProperty('--ct-scale', Math.max(width / 200, 0.7))
        })
        observer.observe(el)
        return () => observer.disconnect()
    }, [])

    const [totalRotation, setTotalRotation] = useState({ x: 0})
    const [bouncing, setBouncing] = useState(false)
    const [flipping, setFlipping] = useState(false)

    const edgeLayers = []
    for (let i = -3; i <= 3; i++) {
        edgeLayers.push(
            <div
                key={i}
                className='coin-edge'
                style={{ transform: `translateZ(${i}px)` }}
            />
        )
    }

    function handleFlip() {
        if (flipping) return

        setFlipping(true)
        setBouncing(true)

        const coinResult = Math.random() < 0.5 ? 'heads' : 'tails'
        const targetX = coinResult === 'heads' ? 0 : 180

        const currentAngle = totalRotation.x % 360
        const normalizedCurrent = currentAngle < 0 ? currentAngle + 360 : currentAngle

        let delta = targetX - normalizedCurrent
        if (delta > 0) delta -= 360

        setTotalRotation({ x: totalRotation.x - 1080 + delta })

        setTimeout(() => {
            setData(prev => ({ ...prev, result: coinResult }))
            setFlipping(false)
            setBouncing(false)
        }, 1200)
    }

    return (
        <div className='coin-toss-container' ref={containerRef}>
            <ModuleHeader
                title={data.title}
                onTitleChange={(newTitle) => setData({ ...data, title: newTitle })}
                onRemove={() => onRemove(id)}
                onSettings={() => onSettings(id)}
            />

            <div className='coin-content'>
            <div className='coin-display'>
                <div
                    className='coin-wrapper'
                    style={{
                        animation: bouncing ? 'coinBounce 1.2s ease-out' : 'none'
                    }}
                >
                    <div
                        className='coin'
                        style={{
                            transform: `rotateX(65deg) rotateZ(-20deg) rotateX(${totalRotation.x}deg)`
                        }}
                    >
                        {edgeLayers}
                        <div className='coin-face coin-heads'>
                            <img src="/icons/head.svg" alt="Heads" className='coin-icon' />
                        </div>
                        <div className='coin-face coin-tails'>
                            <img src="/icons/tail.svg" alt="Tails" className='coin-icon' />
                        </div>
                    </div>
                </div>
            </div>

            <button
                onClick={handleFlip}
                disabled={flipping}
                className='flip-button'
            >
                {flipping ? 'Flipping...' : 'Flip Coin'}
            </button>

            <p className='result-text'>
                {data.result ? data.result.charAt(0).toUpperCase() + data.result.slice(1) : 'Click to flip'}
            </p>
            </div>
        </div>
    )
}
