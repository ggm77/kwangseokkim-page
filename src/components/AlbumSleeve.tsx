import React from 'react';
import type { Album } from '../data/albums';
import { YoutubeBackground } from './YoutubeBackground';
import { TrackListSleeve } from './TrackListSleeve';

interface Props {
    activeAlbum: Album;
    currentSide: 'A' | 'B';
    onSleeveClick?: () => void;
}

export const AlbumSleeve: React.FC<Props> = ({ activeAlbum, currentSide, onSleeveClick }) => {
    const isFlipped = currentSide === 'B';

    return (
        <div className="sleeve-column" onClick={onSleeveClick} style={{ cursor: 'pointer' }}>
            <div className={`modern-sleeve-container ${isFlipped ? "flipped" : ""}`}>
                <div className="modern-sleeve-flipper">
                    {/* Front Face - Side A */}
                    <div className="modern-sleeve-face modern-sleeve-front">
                        <div className="modern-sleeve-glass"></div>
                        <div className="sleeve-card modern-sleeve-card" style={{ 
                            background: `linear-gradient(135deg, ${activeAlbum.coverColor} 40%, rgba(0,0,0,0.2) 100%)`
                        }}>
                            <div className="noise-overlay"></div>
                            
                            <div className="sleeve-j-card modern-j-card">
                                <div className="sleeve-spine" style={{ borderLeftColor: activeAlbum.accentColor }}>
                                    <div className="spine-text">{activeAlbum.title}</div>
                                </div>
                                <div className="sleeve-front">
                                    <div className="vintage-header modern-vintage-header">
                                        <span className="stereo-badge">ANALOG STEREO</span>
                                        <span className="hi-res-badge">HI-RES AUDIO</span>
                                    </div>
                                    <YoutubeBackground activeAlbum={activeAlbum} />
                                    <TrackListSleeve currentSide="A" tracksList={activeAlbum.tracksSideA} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Back Face - Side B */}
                    <div className="modern-sleeve-face modern-sleeve-back">
                        <div className="modern-sleeve-glass"></div>
                        <div className="sleeve-card modern-sleeve-card" style={{ 
                            background: `linear-gradient(135deg, ${activeAlbum.coverColor} 40%, rgba(0,0,0,0.2) 100%)`
                        }}>
                            <div className="noise-overlay"></div>
                            
                            <div className="sleeve-j-card modern-j-card">
                                <div className="sleeve-spine" style={{ borderLeftColor: activeAlbum.accentColor }}>
                                    <div className="spine-text">{activeAlbum.title}</div>
                                </div>
                                <div className="sleeve-front">
                                    <div className="vintage-header modern-vintage-header">
                                        <span className="stereo-badge">ANALOG STEREO</span>
                                        <span className="hi-res-badge">HI-RES AUDIO</span>
                                    </div>
                                    <YoutubeBackground activeAlbum={activeAlbum} />
                                    <TrackListSleeve currentSide="B" tracksList={activeAlbum.tracksSideB} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
