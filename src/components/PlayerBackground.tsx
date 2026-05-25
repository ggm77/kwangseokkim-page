import React from 'react';

interface Props {
    youtubeId: string;
    coverColor: string;
    accentColor: string;
    isPlaying: boolean;
}

export const PlayerBackground: React.FC<Props> = ({ youtubeId, coverColor, accentColor, isPlaying }) => {
    return (
        <div className={`player-bg${isPlaying ? ' player-bg--playing' : ''}`}>
            <div
                className="player-bg-image"
                style={{ backgroundImage: `url(https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg)` }}
            />
            <div className="player-bg-orb player-bg-orb--1" style={{ '--orb-color': coverColor } as React.CSSProperties} />
            <div className="player-bg-orb player-bg-orb--2" style={{ '--orb-color': accentColor } as React.CSSProperties} />
            <div className="player-bg-orb player-bg-orb--3" style={{ '--orb-color': accentColor } as React.CSSProperties} />
            <div className="player-bg-overlay" />
        </div>
    );
};
