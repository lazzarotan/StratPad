'use client';
import './about.css';
import AboutHeader from './AboutHeader';
import Link from 'next/link';

const TEAM = [
    { name: 'Josh Rice', role: 'Backend Developer' },
    { name: 'Mher Keshishian', role: 'Frontend & Integration' },
    { name: 'Josh Horsley', role: 'UI/UX Designer', image: '/images/team/josh-h.jpg' },
    { name: 'Christian Tan', role: 'Backend & Auth Integration' },
    { name: 'Kalina Cathcart', role: 'Student Developer' },
];

export default function AboutPage() {
    return (
        <>
            <AboutHeader />

            <div className="about-content">
                <section className="about-section about-team">
                    <h2>The Team</h2>
                    <p className="about-section-intro">
                        StratPad was built as a 2026 Conestoga SET Capstone project.
                    </p>
                    <div className="about-team-grid">
                        {TEAM.map((member) => (
                            <div key={member.name} className="about-team-card">
                                <div className="about-team-avatar">
                                    {member.image ? (
                                        <img src={member.image} alt={member.name} className="about-team-photo" />
                                    ) : (
                                        member.name.charAt(0)
                                    )}
                                </div>
                                <h3>{member.name}</h3>
                                <p>{member.role}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <div className="about-cta">
                    <Link href="/login" className="about-cta-button">
                        Try StratPad
                    </Link>
                </div>
            </div>
        </>
    );
}
