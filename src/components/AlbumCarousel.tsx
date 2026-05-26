import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ALBUMS } from "../data/albums";
import type { Album } from "../data/albums";
import { useYTPlayer } from "./YTPlayerStore";

export const AlbumCarousel: React.FC = () => {
    const { startMedia, resetPlayer } = useYTPlayer();
    const navigate = useNavigate();

    useEffect(() => {
        // Stop playing when the user returns to the main page
        // (e.g., via browser's back button)
        resetPlayer();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSelectMedia = (album: Album, media: "lp" | "cassette", e: React.MouseEvent) => {
        e.stopPropagation();
        startMedia(album, media);
        navigate(`/${media}`);
    };

    return (
        <div className="home-section">
            {/* Hero Title Area — matching design/home.png */}
            <div className="home-hero">
                <p className="hero-subtitle">ALBUM BY ALBUM</p>
                <h1 className="hero-title">다시 부르기 : 아날로그 김광석</h1>
                <p className="hero-desc">
                    앨범 한 장 한 장에는<br />
                    그 시절 김광석의 목소리가 고스란히 담겨 있습니다.<br /><br />
                    처음 트랙부터 마지막 트랙까지—<br />
                    앨범 그대로, 음악 그대로 들어보세요.
                </p>
            </div>

            {/* 3x2 Album Grid — matching design/home.png */}
            <div className="album-grid">
                {ALBUMS.map((album) => (
                    <div
                        key={album.id}
                        className="album-grid-item"
                        onClick={(e) => handleSelectMedia(album, "lp", e)}
                    >
                        {/* Album Cover Card */}
                        <div className="album-cover-stack">
                            {/* Main LP Sleeve (Image Wrapper) */}
                            <div 
                                className="lp-sleeve-card"
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    overflow: "hidden",
                                    borderRadius: "4px"
                                }}
                            >
                                <img 
                                    src={`https://img.youtube.com/vi/${album.tracksSideA[0].youtubeId}/hqdefault.jpg`} 
                                    alt={album.title} 
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                        transform: `scale(${album.coverScale || 1.34}) translateY(${album.coverOffsetY || '0px'})`
                                    }}
                                />
                                <div style={{
                                    position: 'absolute',
                                    top: '8px',
                                    left: '8px',
                                    backgroundColor: 'rgba(20, 15, 10, 0.75)',
                                    backdropFilter: 'blur(4px)',
                                    color: 'rgba(255, 255, 255, 0.95)',
                                    padding: '4px 8px',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    zIndex: 1,
                                    display: 'flex',
                                    gap: '4px',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    fontFamily: 'var(--font-mono, monospace)',
                                    fontSize: '10px',
                                    fontWeight: 600,
                                    letterSpacing: '0.05em'
                                }}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <circle cx="12" cy="12" r="3"></circle>
                                    </svg>
                                    <span>LP</span>
                                </div>
                            </div>
                            
                            {/* Mini Cassette thumbnail — overlapping */}
                            <div 
                                className="cassette-mini-card" 
                                onClick={(e) => handleSelectMedia(album, "cassette", e)}
                            >
                                <div className="cassette-mini-inner" style={{ borderTopColor: album.coverColor }}>
                                    {/* Album Cover Background for Cassette */}
                                    <div style={{
                                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                                        backgroundImage: `url(https://img.youtube.com/vi/${album.tracksSideA[0].youtubeId}/hqdefault.jpg)`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        opacity: 0.85,
                                        transform: `scale(${album.coverScale || 1.34}) translateY(${album.coverOffsetY || '0px'})`
                                    }} />
                                    
                                    {/* Format Indicator Badge */}
                                    <div style={{
                                        position: 'absolute',
                                        bottom: 0, left: 0, right: 0,
                                        backgroundColor: 'rgba(20, 15, 10, 0.85)',
                                        backdropFilter: 'blur(4px)',
                                        color: 'rgba(255, 255, 255, 0.95)',
                                        fontSize: '10px',
                                        fontFamily: 'var(--font-mono, monospace)',
                                        fontWeight: 600,
                                        letterSpacing: '0.15em',
                                        padding: '5px 0',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        gap: '6px',
                                        zIndex: 5,
                                        borderBottomLeftRadius: '3px',
                                        borderBottomRightRadius: '3px',
                                        borderTop: '1px solid rgba(255,255,255,0.1)'
                                    }}>
                                        <svg width="12" height="8" viewBox="0 0 24 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="2" y="2" width="20" height="12" rx="2" />
                                            <circle cx="8" cy="8" r="2" />
                                            <circle cx="16" cy="8" r="2" />
                                        </svg>
                                        CASSETTE
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Album Info */}
                        <div className="album-grid-info">
                            <h3 className="album-grid-title">{album.title}</h3>
                            <p className="album-grid-year">{album.year}</p>
                        </div>
                    </div>
                ))}
            </div>


        </div>
    );
};
