import React from 'react';
import type { Album } from '../data/albums';

interface Props {
    activeAlbum: Album;
}

export const YoutubeBackground: React.FC<Props> = ({ activeAlbum }) => {
    return (
        <div className="youtube-player-frame-outer">
            <img 
                src={`https://img.youtube.com/vi/${activeAlbum.tracksSideA[0].youtubeId}/hqdefault.jpg`} 
                className="yt-iframe-embed" 
                style={{ 
                    objectFit: 'cover', 
                    transform: `scale(${activeAlbum.coverScale || 1.34}) translateY(${activeAlbum.coverOffsetY || '0px'})` 
                }} 
                alt="album cover" 
            />
        </div>
    );
};
