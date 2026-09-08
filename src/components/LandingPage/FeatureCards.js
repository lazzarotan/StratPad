"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSession } from '@/lib/auth-client';
import './FeatureCards.css';

const CARDS = [
    {
        title: "Build Your Stuff",
        desc: "Create custom dashboards with tables, dice rollers, and more for your tabletop games",
        btn: "Start Building",
        img: "/images/landing page/build.jpg",
        hrefLoggedIn: "/home",
        hrefLoggedOut: "/stratlab",
    },
    {
        title: "Share Your Stuff",
        desc: "Export and share your custom dashboards with your gaming group or the community",
        btn: "Explore the Community",
        href: "/community",
        img: "/images/landing page/share.jpg",
    },
    {
        title: "Play More Games!",
        desc: "From scorekeeping to dice rolling, everything you need in one place so you can focus on the fun",
        btn: "See How It Works",
        img: "/images/landing page/play.jpg",
        hrefLoggedIn: "/home",
        hrefLoggedOut: "/login",
    },
];

export default function FeatureCards() {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;

  return (
    <div className='features-wrapper'>
        <section>
        {CARDS.map((card, i) => {
            const href = card.href || (isLoggedIn ? card.hrefLoggedIn : card.hrefLoggedOut) || null;

            return (
                <motion.div
                    key={i}
                    className="card"
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.12 }}
                >
                    <div className="card-image">
                        {card.img && <img src={card.img} alt={card.title} />}
                    </div>
                    <h3>{card.title}</h3>
                    <p>{card.desc}</p>
                    {href ? (
                        <Link href={href}><button>{card.btn}</button></Link>
                    ) : (
                        <button>{card.btn}</button>
                    )}
                </motion.div>
            );
        })}
        </section>
    </div>
  );
}