'use client';

import { useEffect, useState } from 'react';
import { Skeleton } from '@mui/material';
import Die3DCanvas from '@/components/Modules/Dice/Die3DCanvas';
import './DashboardSkeleton.css';

function RollingDie() {
    const [trigger, setTrigger] = useState(0);
    const [value, setValue] = useState(1);

    useEffect(() => {
        // Kick off the first roll
        setValue(Math.floor(Math.random() * 20) + 1);
        setTrigger(1);

        const interval = setInterval(() => {
            setValue(Math.floor(Math.random() * 20) + 1);
            setTrigger((t) => t + 1);
        }, 1800);
        return () => clearInterval(interval);
    }, []);

    return (
        <Die3DCanvas
            type="d20"
            rolling={false}
            rollTrigger={trigger}
            finalValue={value}
            value={value}
            size={80}
            color="#8b5cf6"
        />
    );
}

export default function DashboardSkeleton() {
    return (
        <div className="dash-skeleton">
            {/* Sidebar strip */}
            <div className="dash-skeleton__sidebar">
                <Skeleton variant="circular" width={24} height={24} />
            </div>

            <div className="dash-skeleton__main">
                {/* Toolbar */}
                <div className="dash-skeleton__toolbar">
                    <Skeleton variant="rounded" width={100} height={28} sx={{ borderRadius: '6px' }} />
                    <div className="dash-skeleton__toolbar-tabs">
                        <Skeleton variant="rounded" width={60} height={24} sx={{ borderRadius: '4px' }} />
                        <Skeleton variant="rounded" width={60} height={24} sx={{ borderRadius: '4px' }} />
                    </div>
                    <div className="dash-skeleton__toolbar-actions">
                        <Skeleton variant="rounded" width={70} height={28} sx={{ borderRadius: '6px' }} />
                        <Skeleton variant="rounded" width={70} height={28} sx={{ borderRadius: '6px' }} />
                    </div>
                </div>

                {/* Dashboard area with faded module outlines */}
                <div className="dash-skeleton__canvas">
                    <div className="dash-skeleton__modules">
                        {[
                            { w: 2, h: 2 },
                            { w: 3, h: 2 },
                            { w: 2, h: 1 },
                            { w: 1, h: 1 },
                            { w: 2, h: 2 },
                            { w: 3, h: 1 },
                        ].map((mod, i) => (
                            <div
                                key={i}
                                className="dash-skeleton__module"
                                style={{
                                    gridColumn: `span ${mod.w}`,
                                    gridRow: `span ${mod.h}`,
                                }}
                            >
                                <div className="dash-skeleton__module-header" />
                            </div>
                        ))}
                    </div>

                    {/* Rolling die in center */}
                    <div className="dash-skeleton__die-wrap">
                        <RollingDie />
                        <span className="dash-skeleton__loading-text">Loading dashboard...</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
