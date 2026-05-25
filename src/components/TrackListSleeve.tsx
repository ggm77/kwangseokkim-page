import React from 'react';
import type { Track } from '../data/albums';

interface Props {
    currentSide: "A" | "B";
    tracksList?: Track[];
}

export const TrackListSleeve: React.FC<Props> = ({ currentSide, tracksList }) => {
    return (
        <div className="tracklist-sleeve">
            <h4>SIDE {currentSide} SELECTIONS</h4>
            <ol>
                {tracksList?.map((t, idx) => (
                    <li key={idx}>
                        {t.title} ({Math.floor(t.duration / 60)}:{(t.duration % 60).toString().padStart(2, "0")})
                    </li>
                ))}
            </ol>
        </div>
    );
};
