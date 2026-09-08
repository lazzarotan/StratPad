"use client";
import { motion } from 'framer-motion';
import './GamesStrip.css';

const GAMES = [
    { name: "Catan",                img: "/images/games/catan.png" },
    { name: "Ticket to Ride",       img: "/images/games/ticket-to-ride.png" },
    { name: "Wingspan",             img: "/images/games/wingspan.png" },
    { name: "Dungeons & Dragons",   img: "/images/games/dungeons-and-dragons.png" },
    { name: "Deth Wizards",          img: "/images/games/deth-wizards.png", scale: 1.8 },
    { name: "Five Crowns",           img: "/images/games/five-crowns.png", scale: 1.8 },
    { name: "Gloomhaven",           img: "/images/games/gloomhaven.png" },
    { name: "Carcassonne",          img: "/images/games/carcassonne.png" },
    { name: "Arkham Horror",        img: "/images/games/arkham-horror.png", scale: 1.4 },
    { name: "Warhammer 40K",        img: "/images/games/warhammer.png", scale: 1.8 },
];

export default function GamesStrip() {
    // Duplicate list so the marquee loops seamlessly
    const games = [...GAMES, ...GAMES];

    return (
        <section className="games-strip">
            <motion.p
                className="games-strip__tagline"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
            >
                Whatever you're playing, StratPad has you covered.
            </motion.p>
            <motion.div
                className="games-strip__track-wrapper"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
            >
                <div className="games-strip__fade games-strip__fade--left" />
                <div className="games-strip__track">
                    {games.map((game, i) => (
                        <span key={i} className="games-strip__chip">
                            <img
                                src={game.img}
                                alt={game.name}
                                className="games-strip__chip-logo"
                                style={game.scale ? { transform: `scale(${game.scale})` } : undefined}
                            />
                        </span>
                    ))}
                </div>
                <div className="games-strip__fade games-strip__fade--right" />
            </motion.div>
        </section>
    );
}
