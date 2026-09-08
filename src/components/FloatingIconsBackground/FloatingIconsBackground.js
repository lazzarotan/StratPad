"use client";
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import './FloatingIconsBackground.css';

// Array of floating icons, their positions, raotation and duration of their floating animation
const FLOATING_ICONS = [
    { src: "/icons/dice.svg",             size: 44, top:  "5%", left:  "3%", duration:  9, delay: 0.0, rotate:  15 },
    { src: "/icons/timer.svg",            size: 32, top:  "8%", left: "18%", duration: 11, delay: 1.2, rotate:  -8 },
    { src: "/icons/coinToss.svg",         size: 50, top:  "6%", left: "35%", duration: 10, delay: 0.4, rotate:  20 },
    { src: "/icons/score.svg",            size: 36, top:  "4%", left: "52%", duration: 13, delay: 2.1, rotate: -12 },
    { src: "/icons/spinWheel.svg",        size: 28, top:  "7%", left: "68%", duration:  8, delay: 0.8, rotate:   6 },
    { src: "/icons/notes.svg",            size: 42, top:  "5%", left: "83%", duration: 12, delay: 1.7, rotate: -18 },
    { src: "/icons/counter.svg",          size: 30, top: "22%", left:  "7%", duration:  9, delay: 3.0, rotate:  10 },
    { src: "/icons/resourceBar.svg",      size: 38, top: "18%", left: "24%", duration: 14, delay: 0.5, rotate: -22 },
    { src: "/icons/list.svg",             size: 34, top: "25%", left: "44%", duration: 10, delay: 1.9, rotate:  14 },
    { src: "/icons/nestedDictionary.svg", size: 46, top: "20%", left: "61%", duration: 11, delay: 0.3, rotate:  -5 },
    { src: "/icons/singleImage.svg",      size: 28, top: "23%", left: "78%", duration:  9, delay: 2.6, rotate:  25 },
    { src: "/icons/dice.svg",             size: 36, top: "23%", left: "92%", duration: 13, delay: 1.1, rotate: -14 },
    { src: "/icons/timer.svg",            size: 48, top: "40%", left:  "2%", duration:  8, delay: 0.7, rotate:   8 },
    { src: "/icons/coinToss.svg",         size: 30, top: "38%", left: "15%", duration: 12, delay: 3.3, rotate: -10 },
    { src: "/icons/score.svg",            size: 40, top: "42%", left: "32%", duration: 10, delay: 1.5, rotate:  18 },
    { src: "/icons/spinWheel.svg",        size: 34, top: "37%", left: "50%", duration: 11, delay: 0.2, rotate:  -7 },
    { src: "/icons/notes.svg",            size: 28, top: "43%", left: "66%", duration:  9, delay: 2.8, rotate:  22 },
    { src: "/icons/counter.svg",          size: 44, top: "39%", left: "80%", duration: 14, delay: 1.0, rotate: -16 },
    { src: "/icons/resourceBar.svg",      size: 32, top: "40%", left: "94%", duration: 10, delay: 3.7, rotate:   5 },
    { src: "/icons/list.svg",             size: 42, top: "60%", left:  "5%", duration: 11, delay: 0.9, rotate: -20 },
    { src: "/icons/nestedDictionary.svg", size: 30, top: "58%", left: "20%", duration:  8, delay: 2.3, rotate:  12 },
    { src: "/icons/singleImage.svg",      size: 38, top: "63%", left: "38%", duration: 13, delay: 1.6, rotate:  -3 },
    { src: "/icons/dice.svg",             size: 26, top: "57%", left: "55%", duration:  9, delay: 0.6, rotate:  19 },
    { src: "/icons/timer.svg",            size: 44, top: "62%", left: "72%", duration: 12, delay: 3.1, rotate: -11 },
    { src: "/icons/coinToss.svg",         size: 34, top: "59%", left: "88%", duration: 10, delay: 1.4, rotate:   7 },
    { src: "/icons/score.svg",            size: 28, top: "80%", left:  "8%", duration: 11, delay: 2.0, rotate: -24 },
    { src: "/icons/spinWheel.svg",        size: 46, top: "78%", left: "25%", duration:  9, delay: 0.1, rotate:  16 },
    { src: "/icons/notes.svg",            size: 32, top: "83%", left: "45%", duration: 13, delay: 2.9, rotate:  -9 },
    { src: "/icons/counter.svg",          size: 40, top: "79%", left: "63%", duration:  8, delay: 1.3, rotate:  21 },
    { src: "/icons/list.svg",             size: 30, top: "82%", left: "88%", duration: 11, delay: 3.5, rotate: -17 },
];

const REPULSE_RADIUS   = 130;
const REPULSE_STRENGTH = 75;
const LERP_FACTOR      = 0.1;

export default function FloatingIconsBackground() {
    const mousePos   = useRef({ x: -9999, y: -9999 });
    const iconRefs   = useRef([]);
    const iconStates = useRef(FLOATING_ICONS.map(() => ({ cx: 0, cy: 0, tx: 0, ty: 0 })));
    const layerRef   = useRef(null);
    const rafId      = useRef(null);
    const isVisible  = useRef(false);

    useEffect(() => {
        const layerEl = layerRef.current;
        if (!layerEl) return;

        function tick() {
            iconStates.current.forEach((state, i) => {
                const el = iconRefs.current[i];
                if (!el) return;

                const rect = el.getBoundingClientRect();
                const cx   = rect.left + rect.width  / 2;
                const cy   = rect.top  + rect.height / 2;
                const dx   = mousePos.current.x - cx;
                const dy   = mousePos.current.y - cy;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < REPULSE_RADIUS && dist > 0) {
                    const force = (REPULSE_RADIUS - dist) / REPULSE_RADIUS;
                    state.tx = -(dx / dist) * force * REPULSE_STRENGTH;
                    state.ty = -(dy / dist) * force * REPULSE_STRENGTH;
                } else {
                    state.tx = 0;
                    state.ty = 0;
                }

                state.cx += (state.tx - state.cx) * LERP_FACTOR;
                state.cy += (state.ty - state.cy) * LERP_FACTOR;

                el.style.setProperty('--rx', `${state.cx}px`);
                el.style.setProperty('--ry', `${state.cy}px`);
            });

            if (isVisible.current) {
                rafId.current = requestAnimationFrame(tick);
            } else {
                rafId.current = null;
            }
        }

        function startLoop() {
            if (!rafId.current) {
                rafId.current = requestAnimationFrame(tick);
            }
        }

        // Only run the loop while the hero section is on screen
        const observer = new IntersectionObserver(([entry]) => {
            isVisible.current = entry.isIntersecting;
            if (entry.isIntersecting) startLoop();
        }, { threshold: 0 });

        observer.observe(layerEl);

        function onMouseMove(e) {
            mousePos.current = { x: e.clientX, y: e.clientY };
        }

        function onMouseLeave() {
            mousePos.current = { x: -9999, y: -9999 };
        }

        window.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseleave', onMouseLeave);

        return () => {
            if (rafId.current) cancelAnimationFrame(rafId.current);
            observer.disconnect();
            window.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseleave', onMouseLeave);
        };
    }, []);

    return (
        <div className="fib-layer" ref={layerRef}>
            {FLOATING_ICONS.map((icon, i) => (
                <div
                    key={i}
                    ref={(el) => (iconRefs.current[i] = el)}
                    className="fib-icon"
                    style={{ width: icon.size, height: icon.size, top: icon.top, left: icon.left }}
                >
                    <motion.div
                        animate={{ y: [0, -18, 0], rotate: [icon.rotate, icon.rotate + 6, icon.rotate] }}
                        transition={{ duration: icon.duration, delay: icon.delay, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <img src={icon.src} width={icon.size} height={icon.size} alt="" />
                    </motion.div>
                </div>
            ))}
        </div>
    );
}
