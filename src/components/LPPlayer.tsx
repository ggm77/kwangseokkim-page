import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useYTPlayer } from "./YTPlayerStore";

export const LPPlayer: React.FC = () => {
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
        togglePlay,
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

    const tonearmRef = useRef<HTMLDivElement>(null);
    const pivotRef = useRef<HTMLDivElement>(null);
    const platterRef = useRef<HTMLDivElement>(null);

    // Rotation angles for the tonearm needle:
    // -12deg: resting position (off record)
    //  12deg: outer edge of record (0% of track — start)
    //  36deg: inner edge of record (100% of track — end)
    const ANGLE_REST = -12;
    const ANGLE_OUTER = 12;
    const ANGLE_INNER = 36;

    // Calculate current tonearm angle from playback progress
    const progress = duration > 0 ? currentTime / duration : 0;
    const playbackAngle = ANGLE_OUTER + (ANGLE_INNER - ANGLE_OUTER) * progress;

    // While playing or paused, show playback-derived angle; while idle, resting
    const finalAngle = (playerStatus === "UNSTARTED" || playerStatus === "ENDED")
            ? ANGLE_REST
            : playbackAngle;

    // Click on vinyl to seek
    const handleVinylClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!duration) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const dx = e.clientX - centerX;
        const dy = e.clientY - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const maxRadius = rect.width / 2; // Outer edge
        const minRadius = 45; // Center label edge (~45px radius)

        // Clamp distance to playable groove area
        const clampedDistance = Math.max(minRadius, Math.min(distance, maxRadius));

        // Map distance to progress (outer = 0%, inner = 100%)
        const clickProgress = 1 - (clampedDistance - minRadius) / (maxRadius - minRadius);
        const targetSeconds = clickProgress * duration;

        seekTo(targetSeconds);
        
        if (playerStatus !== "PLAYING" && playerStatus !== "BUFFERING") {
            setTimeout(() => {
                play();
            }, 300);
        }
    };

    if (!activeAlbum || !currentTrack) return null;

    const isSpinning = playerStatus === "PLAYING";
    const isBuffering = playerStatus === "BUFFERING";
    const tracksList = currentSide === "A" ? activeAlbum.tracksSideA : activeAlbum.tracksSideB;

    return (
        <div className="player-page lp-page-container">
            {/* Back to Home & Info Bar */}
            <div className="player-nav-header">
                <button className="back-btn retro-btn" onClick={() => {
                    resetPlayer();
                    navigate("/");
                }}>
                    &larr; 보관소로 돌아가기
                </button>
                <div className="album-info-display">
                    <span className="retro-tag">HI-FI TURNTABLE</span>
                    <h2 className="album-display-title">{activeAlbum.title}</h2>
                </div>
            </div>

            <div className="player-main-layout">
                {/* Left Side: Youtube Player (Album Sleeve Cover Mock) */}
                <div className="sleeve-column PC-only">
                    <div className="lp-sleeve-frame">
                        <div className="sleeve-card" style={{ backgroundColor: activeAlbum.coverColor }}>
                            <div className="sleeve-ring-overlay"></div>
                            <div className="sleeve-front">
                                <div className="vintage-label-circle">STEREO</div>
                                <div className="youtube-player-frame-outer">
                                    <div id="yt-hidden-player" className="yt-iframe-embed"></div>
                                </div>

                                <div className="tracklist-sleeve">
                                    <h4>SIDE {currentSide} SELECTIONS</h4>
                                    <ol>
                                        {tracksList.map((t, idx) => (
                                            <li
                                                key={idx}
                                                className={idx === currentTrackIndex ? "active-track" : ""}
                                                onClick={() => setTrackIndex(idx)}
                                            >
                                                {t.title} ({Math.floor(t.duration / 60)}:{(t.duration % 60).toString().padStart(2, "0")})
                                            </li>
                                        ))}
                                    </ol>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right/Center: Large Draggable Turntable */}
                <div className="player-column">
                    <div className="turntable-deck-outer glass-effect">
                        <div className="deck-screws top-left"></div>
                        <div className="deck-screws top-right"></div>
                        <div className="deck-screws bottom-left"></div>
                        <div className="deck-screws bottom-right"></div>

                        {/* Turntable Platter & Vinyl Record */}
                        <div className="platter-compartment" ref={platterRef}>
                            <div className={`turntable-platter ${isSpinning ? "spin-active" : ""} ${isBuffering ? "buffering-slip" : ""}`}>
                                <div 
                                    className="vinyl-record"
                                    onClick={handleVinylClick}
                                    style={{ cursor: "pointer" }}
                                    title="원하는 위치를 클릭하여 재생"
                                >
                                    <div className="vinyl-groove-lines"></div>

                                    {/* Vinyl Record Center Sticker Label */}
                                    <div className="vinyl-label-center" style={{ backgroundColor: activeAlbum.coverColor }}>
                                        <div className="label-album-title">{activeAlbum.title}</div>
                                        <div className="label-track-title">{currentTrack.title}</div>
                                        <div className="label-side-indicator">SIDE {currentSide}</div>
                                        <div className="label-spindle-hole"></div>
                                    </div>
                                </div>
                            </div>
                            {/* Draggable Tonearm Unit */}
                            <div
                                className="tonearm-assembly"
                                ref={tonearmRef}
                                style={{ transform: `rotate(${finalAngle}deg)` }}
                            >
                                <div className="tonearm-pivot-base" ref={pivotRef}>
                                    <div className="weight-dial"></div>
                                </div>

                                <div className="tonearm-rod"></div>

                                <div className="tonearm-headshell">
                                    <div className="stylus-cartridge"></div>
                                    <div className="finger-lift"></div>
                                </div>
                            </div>
                        </div>

                        {/* Turntable Controls */}
                        <div className="turntable-controls-bar">
                            {/* Speed Toggle (33 / 45 RPM) */}
                            <div className="side-selector-knob">
                                <span className="knob-label">SPEED</span>
                                <div className="radio-toggle-group">
                                    <button className="toggle-option active">33</button>
                                    <button className="toggle-option">45</button>
                                </div>
                            </div>

                            {/* Play / Pause Toggle Lever — labeled START like the design */}
                            <button
                                className={`lever-switch ${isSpinning ? "active" : ""}`}
                                onClick={togglePlay}
                            >
                                <div className="lever-handle"></div>
                                <span className="lever-label">{isSpinning ? "STOP" : "START"}</span>
                            </button>

                            {/* Side A / B Toggle Selector */}
                            <div className="side-selector-knob">
                                <span className="knob-label">SIDE</span>
                                <div className="radio-toggle-group">
                                    <button
                                        className={`toggle-option ${currentSide === "A" ? "active" : ""}`}
                                        onClick={() => setSide("A")}
                                    >
                                        A
                                    </button>
                                    <button
                                        className={`toggle-option ${currentSide === "B" ? "active" : ""}`}
                                        onClick={() => setSide("B")}
                                    >
                                        B
                                    </button>
                                </div>
                            </div>

                            {/* LIFT lever (lifts tonearm back to rest) */}
                            <div className="side-selector-knob">
                                <span className="knob-label">LIFT</span>
                                <button
                                    className="toggle-option active"
                                    style={{ padding: "6px 14px" }}
                                    onClick={() => {
                                        pause();
                                    }}
                                >
                                    ↑
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Draggable needle manual helper block */}
                    <div className="stylus-instruction-box glass-effect">
                        <p>
                            💡 <strong>아날로그 조작법:</strong> 회전 중인 LP 판의 원하는 위치를 <strong>클릭</strong>하여 해당 음악 시간대로 자동 점프합니다. 중심에 가까울수록 곡의 후반부입니다.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
