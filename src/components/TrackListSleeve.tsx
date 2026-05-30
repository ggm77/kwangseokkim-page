import React from 'react';
import type { Track } from '../data/albums';

interface Props {
    currentSide: "A" | "B";
    tracksList?: Track[];
}

export const TrackListSleeve: React.FC<Props> = ({ currentSide, tracksList }) => {
    return (
        <div className="tracklist-sleeve">
            <h4 className="tracklist-side-title">SIDE {currentSide} · 수록곡</h4>
            <div className="tracklist-divider" />
            <div className="tracklist-rows">
                {tracksList?.map((t, idx) => (
                    <div className="tracklist-row" key={idx}>
                        <span className="track-num">{String(idx + 1).padStart(2, '0')}</span>
                        <span className="track-title">{t.title}</span>
                        <span className="track-duration">
                            {Math.floor(t.duration / 60)}:{(t.duration % 60).toString().padStart(2, "0")}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};
