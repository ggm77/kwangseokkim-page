import React from "react";
import { flushSync } from "react-dom";
import { useNavigate } from "react-router-dom";
import { ALBUMS } from "../data/albums";
import type { Album } from "../data/albums";
import { useYTPlayer } from "./YTPlayerStore";

export const AlbumCarousel: React.FC = () => {
    const { selectAlbum, selectMedia, initPlayerNow } = useYTPlayer();
    const navigate = useNavigate();

    const handleSelectMedia = (album: Album, media: "lp" | "cassette", e: React.MouseEvent) => {
        e.stopPropagation();
        flushSync(() => {
            selectAlbum(album);
            selectMedia(media);
            navigate(`/${media}`);
        });
        // Synchronously initialize the player inside the user gesture handler
        // to bypass strict browser autoplay policies.
        initPlayerNow();
    };

    return (
        <div className="home-section">
            {/* Hero Title Area — matching design/home.png */}
            <div className="home-hero">
                <p className="hero-subtitle">THE ANALOG COLLECTION</p>
                <h1 className="hero-title">다시 부르기 : 아날로그 김광석</h1>
                <p className="hero-desc">
                    마우스 클릭 한 번으로 다음 곡을 넘어갈 수 없는 곳.<br />
                    원하는 곡을 듣기 위해선 꾹 누른 채 기다려야 하는 곳.<br /><br />
                    조금은 느리고 불편하지만,<br />
                    음악을 가장 깊게 소유하는 방법을 제안합니다.
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
                                    borderRadius: "4px",
                                    position: "relative"
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
