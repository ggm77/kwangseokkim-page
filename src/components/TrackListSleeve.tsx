import React, { useState } from 'react';
import type { Track } from '../data/albums';
import { LyricsModal } from './LyricsModal';

interface Props {
    currentSide: "A" | "B";
    tracksList?: Track[];
}

export const TrackListSleeve: React.FC<Props> = ({ currentSide, tracksList }) => {
    const [selectedTrack, setSelectedTrack] = useState<string | null>(null);

    return (
        <div className="tracklist-sleeve">
            <h4>SIDE {currentSide} SELECTIONS</h4>
            <ol>
                {tracksList?.map((t, idx) => (
                    <li 
                        key={idx} 
                        className="track-item"
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTrack(t.title);
                        }}
                    >
                        {t.title} ({Math.floor(t.duration / 60)}:{(t.duration % 60).toString().padStart(2, "0")})
                    </li>
                ))}
            </ol>
            <LyricsModal 
                isOpen={!!selectedTrack} 
                title={selectedTrack || ""} 
                onClose={() => setSelectedTrack(null)} 
            />
        </div>
    );
};
