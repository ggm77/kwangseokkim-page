import React from 'react';
import type { Album } from '../data/albums';
import { YoutubeBackground } from './YoutubeBackground';
import { TrackListSleeve } from './TrackListSleeve';

interface Props {
    activeAlbum: Album;
    currentSide: 'A' | 'B';
    onSleeveClick?: () => void;
    mediaType?: 'lp' | 'cassette';
}

export const AlbumSleeve: React.FC<Props> = ({ activeAlbum, currentSide, onSleeveClick, mediaType = 'lp' }) => {
    const isFlipped = currentSide === 'B';

    return (
        <div className="sleeve-column" onClick={onSleeveClick} style={{ cursor: 'pointer' }}>
            <div className={`modern-sleeve-container ${isFlipped ? "flipped" : ""}`}>
                <div className="modern-sleeve-flipper">
                    {/* Front Face - Side A */}
                    <div className="modern-sleeve-face modern-sleeve-front">
                        <div className="modern-sleeve-glass"></div>
                        <div className="sleeve-card modern-sleeve-card">
                            <div className="noise-overlay"></div>
                            
                            <div className="sleeve-card-content">
                                <div className="sleeve-vintage-header">
                                    <div className="header-left">
                                        ANALOG<br />STEREO
                                    </div>
                                    <div className="header-right">
                                        {mediaType === 'lp' && <>33⅓ RPM<br /></>}
                                        <span className="hi-fi">HI-FI</span>
                                    </div>
                                </div>
                                <div className="sleeve-cover-container">
                                    <YoutubeBackground activeAlbum={activeAlbum} />
                                </div>
                                <TrackListSleeve currentSide="A" tracksList={activeAlbum.tracksSideA} />
                            </div>
                        </div>
                    </div>

                    {/* Back Face - Side B */}
                    <div className="modern-sleeve-face modern-sleeve-back">
                        <div className="modern-sleeve-glass"></div>
                        <div className="sleeve-card modern-sleeve-card">
                            <div className="noise-overlay"></div>
                            
                            <div className="sleeve-card-content">
                                <div className="sleeve-vintage-header">
                                    <div className="header-left">
                                        ANALOG<br />STEREO
                                    </div>
                                    <div className="header-right">
                                        {mediaType === 'lp' && <>33⅓ RPM<br /></>}
                                        <span className="hi-fi">HI-FI</span>
                                    </div>
                                </div>
                                <div className="sleeve-cover-container">
                                    <YoutubeBackground activeAlbum={activeAlbum} />
                                </div>
                                <TrackListSleeve currentSide="B" tracksList={activeAlbum.tracksSideB} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
