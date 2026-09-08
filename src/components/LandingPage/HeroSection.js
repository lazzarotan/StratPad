"use client";

import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { motion } from 'framer-motion';
import FloatingIconsBackground from '@/components/FloatingIconsBackground/FloatingIconsBackground';
import './HeroSection.css';

export default function HeroSection() {
    const { data: session } = useSession();
    const router = useRouter();

    function handleClick() {
        router.push(session ? '/home' : '/login');
    }

    return(
        <section className='hero-section'>
            <FloatingIconsBackground />
            <div className='hero-container'>
                <motion.div
                    className='hero-left'
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    <h1>StratPad</h1>
                    <p className="hero-tagline">The boardgame dashboard builder</p>
                    <p className="hero-description">
                        Drag-and-drop dice rollers, score tables, timers, and more
                        to build custom dashboards for any tabletop game.
                    </p>
                    <button onClick={handleClick}>Try it out</button>
                </motion.div>
                <motion.div
                    className="hero-right"
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
                >
                    <div className="hero-gif-stack">
                        <div className="stack-card stack-card-3"></div>
                        <div className="stack-card stack-card-2"></div>
                        <video
                            src="/images/HeroSection.mp4"
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="hero-demo-gif"
                        />
                    </div>
                </motion.div>
            </div>
        </section>
    );
}