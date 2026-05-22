import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useYTPlayer } from "./YTPlayerStore";

export const CassettePlayer: React.FC = () => {
    const {
        activeAlbum,
        currentSide,
        currentTrackIndex,
        currentTrack,
        playerStatus,
        currentTime,
        duration,
        play,
        pause,
        seekTo,
        setSide,
        setTrackIndex,
        resetPlayer
    } = useYTPlayer();
    
    const navigate = useNavigate();

    useEffect(() => {
        if (!activeAlbum || !currentTrack) {
            navigate("/");
        }
    }, [activeAlbum, currentTrack, navigate]);

    const [isFlipped, setIsFlipped] = useState<boolean>(false);
    const [isEjecting, setIsEjecting] = useState<boolean>(false);
    const [isFF, setIsFF] = useState<boolean>(false);
    const [isREW, setIsREW] = useState<boolean>(false);

    const searchInterval = useRef<number | null>(null);
    // Track latest currentTime via ref so setInterval callback always has fresh value
    const currentTimeRef = useRef<number>(currentTime);
    const durationRef = useRef<number>(duration);

    // Keep refs in sync with state
    useEffect(() => {
        currentTimeRef.current = currentTime;
    }, [currentTime]);

    useEffect(() => {
        durationRef.current = duration;
    }, [duration]);

    // Sync isFlipped with currentSide
    useEffect(() => {
        setIsFlipped(currentSide === "B");
    }, [currentSide]);

    // Visual Tape Amount calculation
    // Tape progresses from left reel (supply) to right reel (take-up)
    const progress = duration > 0 ? currentTime / duration : 0;

    // Outer tape wrap radius parameters (min = 28px, max = 54px for visual thickness)
    const R_MIN = 28;
    const R_MAX = 54;
    const rLeft = R_MIN + (R_MAX - R_MIN) * (1 - progress);
    const rRight = R_MIN + (R_MAX - R_MIN) * progress;

    // FF/REW seek step: jump 2 seconds every 100ms while held → 20x speed
    const SEEK_STEP = 2;
    const SEEK_INTERVAL = 100;

    // Handle mechanical Fast Forward (FF) — press-and-hold seeks forward
    const startFF = useCallback(() => {
        if (searchInterval.current) {
            clearInterval(searchInterval.current);
            searchInterval.current = null;
        }
        setIsFF(true);
        setIsREW(false);
        pause();

        searchInterval.current = window.setInterval(() => {
            const t = currentTimeRef.current;
            const d = durationRef.current;
            const next = Math.min(t + SEEK_STEP, d);
            seekTo(next);
        }, SEEK_INTERVAL);
    }, [pause, seekTo]);

    // Handle mechanical Rewind (REW) — press-and-hold seeks backward
    const startREW = useCallback(() => {
        if (searchInterval.current) {
            clearInterval(searchInterval.current);
            searchInterval.current = null;
        }
        setIsREW(true);
        setIsFF(false);
        pause();

        searchInterval.current = window.setInterval(() => {
            const t = currentTimeRef.current;
            const next = Math.max(t - SEEK_STEP, 0);
            seekTo(next);
        }, SEEK_INTERVAL);
    }, [pause, seekTo]);

    const stopSearch = useCallback(() => {
        setIsFF(false);
        setIsREW(false);
        if (searchInterval.current) {
            clearInterval(searchInterval.current);
            searchInterval.current = null;
        }
        // Resume playback after release
        play();
    }, [play]);

    // 3D Eject and Flip animation
    const handleEject = () => {
        if (isEjecting) return;
        setIsEjecting(true);
        pause();

        setTimeout(() => {
            const nextSide = currentSide === "A" ? "B" : "A";
            setSide(nextSide);
            setIsFlipped(nextSide === "B");
        }, 600);

        setTimeout(() => {
            setIsEjecting(false);
        }, 1200);
    };

    // Clean up interval on unmount
    useEffect(() => {
        return () => {
            if (searchInterval.current) clearInterval(searchInterval.current);
        };
    }, []);

    if (!activeAlbum || !currentTrack) return null;

    // Rotation speed classes based on state
    let reelSpeedClass = "stopped";
    if (playerStatus === "PLAYING") reelSpeedClass = "playing";
    else if (isFF) reelSpeedClass = "fast-forward";
    else if (isREW) reelSpeedClass = "rewind";

    // List of tracks for the active side
    const tracksList = currentSide === "A" ? activeAlbum.tracksSideA : activeAlbum.tracksSideB;

    return (
        <div className="player-page cassette-page-container">
            {/* Nav Header */}
            <div className="player-nav-header">
                <button className="back-btn retro-btn" onClick={() => {
                    resetPlayer();
                    navigate("/");
                }}>
                    &larr; 보관소로 돌아가기
                </button>
                <div className="album-info-display">
                    <span className="retro-tag">CASSETTE DECK</span>
                    <h2 className="album-display-title">{activeAlbum.title}</h2>
                </div>
            </div>

            <div className="player-main-layout">
                {/* Left: Disguised Youtube Iframe (The "Album Sleeve") */}
                <div className="sleeve-column PC-only">
                    <div className="cassette-sleeve-frame">
                        <div className="sleeve-card" style={{ backgroundColor: activeAlbum.coverColor }}>
                            <div className="sleeve-j-card">
                                <div className="sleeve-spine" style={{ borderLeftColor: activeAlbum.accentColor }}>
                                    <div className="spine-text">{activeAlbum.title}</div>
                                </div>
                                <div className="sleeve-front">
                                    <div className="vintage-header">ANALOG STEREO</div>
                                    <div className="youtube-player-frame-outer">
                                        <div id="yt-hidden-player" className="yt-iframe-embed"></div>
                                    </div>
                                    <div className="tracklist-sleeve">
                                        <h4>SIDE {currentSide} TRACKS</h4>
                                        <ol>
                                            {tracksList.map((t, idx) => (
                                                <li key={idx}>
                                                    {t.title} ({Math.floor(t.duration / 60)}:{(t.duration % 60).toString().padStart(2, "0")})
                                                </li>
                                            ))}
                                        </ol>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile YouTube Box */}
                <div className="mobile-player-box mobile-only">
                    <div className="youtube-player-frame-outer">
                        <div id="yt-hidden-player-mobile-placeholder"></div>
                    </div>
                </div>

                {/* Right/Center: Large Interactive Cassette Player */}
                <div className="player-column">
                    <div className="cassette-deck-outer glass-effect">
                        <div className="deck-header">
                            <span className="brand-logo font-retro">DIRECT DRIVE / HI-FI</span>
                            <div className="counter-led">
                                {Math.floor(currentTime / 60).toString().padStart(2, "0")}:
                                {Math.floor(currentTime % 60).toString().padStart(2, "0")}
                            </div>
                        </div>

                        {/* The 3D Rotating Cassette Tape */}
                        <div className="tape-compartment">
                            <div className={`cassette-tape-wrap ${isEjecting ? "eject-anim" : ""} ${isFlipped ? "flipped-side" : ""}`}>
                                {/* Cassette Front Side */}
                                <div className="cassette-tape-body tape-front">
                                    {/* Label Sticker */}
                                    <div className="tape-sticker" style={{ borderTopColor: activeAlbum.coverColor }}>
                                        <div className="sticker-meta">
                                            <span className="side-indicator font-retro">{currentSide}</span>
                                            <div className="sticker-titles">
                                                <div className="song-title">{currentTrack.title}</div>
                                                <div className="album-title-sticker">{activeAlbum.title}</div>
                                            </div>
                                            <span className="dolby-logo">DO DO[BY SYSTEM]</span>
                                        </div>

                                        {/* Tape Window with transparent center and reels */}
                                        <div className="tape-window-wrapper">
                                            <div className="window-glass">
                                                {/* Supply Reel (Left) & Tape thickness */}
                                                <div className="tape-reel-hub left-reel">
                                                    <svg className="tape-wrap-svg">
                                                        <circle cx="50" cy="50" r={rLeft} className="tape-wrap-color" />
                                                        <circle cx="50" cy="50" r="28" className="tape-reel-spokes-bg" />
                                                    </svg>
                                                    <div className={`spindle-gear ${reelSpeedClass}`}></div>
                                                </div>

                                                {/* Take-up Reel (Right) & Tape thickness */}
                                                <div className="tape-reel-hub right-reel">
                                                    <svg className="tape-wrap-svg">
                                                        <circle cx="50" cy="50" r={rRight} className="tape-wrap-color" />
                                                        <circle cx="50" cy="50" r="28" className="tape-reel-spokes-bg" />
                                                    </svg>
                                                    <div className={`spindle-gear ${reelSpeedClass}`}></div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="tape-footer-details">
                                            <span>NR [ON]</span>
                                            <span>CrO2 BIAS</span>
                                            <span>120µs EQ</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Physical Mechanical Deck Buttons */}
                        <div className="deck-controls-row">
                            {/* REW Button */}
                            <button
                                className={`deck-btn btn-rew ${isREW ? "pressed" : ""}`}
                                onMouseDown={startREW}
                                onMouseUp={stopSearch}
                                onMouseLeave={isREW ? stopSearch : undefined}
                                onTouchStart={(e) => { e.preventDefault(); startREW(); }}
                                onTouchEnd={(e) => { e.preventDefault(); stopSearch(); }}
                                title="Rewind (꾹 누르세요)"
                            >
                                <div className="btn-cap"><span className="icon">&laquo;&laquo;</span><span className="label">REW</span></div>
                            </button>

                            {/* FF Button */}
                            <button
                                className={`deck-btn btn-ff ${isFF ? "pressed" : ""}`}
                                onMouseDown={startFF}
                                onMouseUp={stopSearch}
                                onMouseLeave={isFF ? stopSearch : undefined}
                                onTouchStart={(e) => { e.preventDefault(); startFF(); }}
                                onTouchEnd={(e) => { e.preventDefault(); stopSearch(); }}
                                title="Fast Forward (꾹 누르세요)"
                            >
                                <div className="btn-cap"><span className="icon">&raquo;&raquo;</span><span className="label">F.FWD</span></div>
                            </button>

                            {/* Play Button */}
                            <button
                                className={`deck-btn btn-play ${playerStatus === "PLAYING" ? "pressed" : ""}`}
                                onClick={play}
                                disabled={playerStatus === "PLAYING"}
                            >
                                <div className="btn-cap"><span className="icon">&#9658;</span><span className="label">PLAY</span></div>
                            </button>

                            {/* Stop Button */}
                            <button
                                className={`deck-btn btn-stop ${playerStatus === "PAUSED" || playerStatus === "ENDED" ? "pressed" : ""}`}
                                onClick={pause}
                            >
                                <div className="btn-cap"><span className="icon">&#9632;</span><span className="label">STOP</span></div>
                            </button>

                            {/* Eject / Flip Button */}
                            <button
                                className={`deck-btn btn-eject ${isEjecting ? "pressed" : ""}`}
                                onClick={handleEject}
                            >
                                <div className="btn-cap"><span className="icon">&#9167;</span><span className="label">FLIP</span></div>
                            </button>
                        </div>
                    </div>

                    {/* Detailed track selection panel below player on PC/Mobile */}
                    <div className="track-selector-widget glass-effect">
                        <h3>트랙 다이렉트 선택</h3>
                        <div className="track-badges">
                            {tracksList.map((t, idx) => (
                                <button
                                    key={idx}
                                    className={`track-badge-btn ${idx === currentTrackIndex ? "active" : ""}`}
                                    onClick={() => setTrackIndex(idx)}
                                >
                                    <span className="badge-num">{idx + 1}</span> {t.title}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
