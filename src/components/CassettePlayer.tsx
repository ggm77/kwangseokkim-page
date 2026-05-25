import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useYTPlayer } from "./YTPlayerStore";
import { AlbumSleeve } from "./AlbumSleeve";

export const CassettePlayer: React.FC = () => {
    const {
        activeAlbum,
        currentSide,
        currentTrack,
        playerStatus,
        currentTime,
        duration,
        play,
        pause,
        seekTo,
        setSide,
        resetPlayer
    } = useYTPlayer();
    
    const navigate = useNavigate();

    useEffect(() => {
        if (window.innerWidth <= 860) {
            window.scrollTo(0, 0);
        }
    }, []);

    useEffect(() => {
        if (!activeAlbum || !currentTrack) {
            navigate("/");
        }
    }, [activeAlbum, currentTrack, navigate]);

    const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
    const [isFlipped, setIsFlipped] = useState<boolean>(false);
    const [isEjecting, setIsEjecting] = useState<boolean>(false);
    const [isFF, setIsFF] = useState<boolean>(false);
    const [isREW, setIsREW] = useState<boolean>(false);
    const [playIntent, setPlayIntent] = useState<boolean>(false);
    const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth <= 860);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 860);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
    }, []);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };

    // Sync playIntent with actual player status
    useEffect(() => {
        if (playerStatus === "PAUSED" || playerStatus === "ENDED" || playerStatus === "UNSTARTED") {
            setPlayIntent(false);
        } else if (playerStatus === "PLAYING" || playerStatus === "BUFFERING") {
            setPlayIntent(true);
        }
    }, [playerStatus]);

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

    const tracksList = currentSide === "A" ? activeAlbum?.tracksSideA : activeAlbum?.tracksSideB;
    const sideStartTime = tracksList?.[0]?.startTime || 0;
    const lastTrack = tracksList?.[tracksList.length - 1];
    const sideEndTime = lastTrack ? lastTrack.startTime + lastTrack.duration : (duration || 1);
    const sideDuration = sideEndTime - sideStartTime;

    // Visual Tape Amount calculation
    // Tape area is proportional to length, so radius grows with square root of progress
    const clampedTime = Math.max(sideStartTime, Math.min(currentTime, sideEndTime));
    const progress = sideDuration > 0 ? (clampedTime - sideStartTime) / sideDuration : 0;

    // Outer tape wrap radius parameters
    const R_MIN = isMobile ? 22 : 28;
    const R_MAX = isMobile ? 36 : 42;
    const rLeft = Math.sqrt(R_MIN ** 2 + (R_MAX ** 2 - R_MIN ** 2) * (1 - progress));
    const rRight = Math.sqrt(R_MIN ** 2 + (R_MAX ** 2 - R_MIN ** 2) * progress);

    // FF/REW seek step: jump 2.8 seconds every 50ms while held → 56x speed
    const SEEK_STEP = 2.8;
    const SEEK_INTERVAL = 50;

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
        setPlayIntent(true);
        play();
    }, [play]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (document.activeElement?.tagName === "BUTTON" && e.code === "Space") return;

            if (e.code === "Space" && !e.repeat) {
                e.preventDefault();
                if (playerStatus === "PLAYING" || playerStatus === "BUFFERING") {
                    pause();
                } else {
                    setPlayIntent(true);
                    play();
                }
            } else if (e.code === "ArrowRight" && !e.repeat) {
                e.preventDefault();
                startFF();
            } else if (e.code === "ArrowLeft" && !e.repeat) {
                e.preventDefault();
                startREW();
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.code === "ArrowRight" || e.code === "ArrowLeft") {
                e.preventDefault();
                stopSearch();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, [playerStatus, play, pause, startFF, startREW, stopSearch]);

    // Natural 180-degree flip animation
    const handleEject = () => {
        if (isEjecting) return;
        setIsEjecting(true);
        pause();

        const nextSide = currentSide === "A" ? "B" : "A";
        // Start CSS rotation immediately
        setIsFlipped(nextSide === "B");

        // Change text/side halfway through the flip when the tape is edge-on
        setTimeout(() => {
            setSide(nextSide);
        }, 600);

        // Unlock after flip completes
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
    if (playIntent || playerStatus === "PLAYING" || playerStatus === "BUFFERING") reelSpeedClass = "playing";
    else if (isFF) reelSpeedClass = "fast-forward";
    else if (isREW) reelSpeedClass = "rewind";

    // Consider it at the end if it's within 1 second of the end
    const isAtEnd = currentTime >= sideEndTime - 1;

    if (!tracksList) return null;

    const renderTapeFace = (faceClass: string, faceSide: "A" | "B") => {
        const sideName = faceSide;
        return (
            <div className={`cassette-tape-body ${faceClass}`}>
                {/* Label Sticker */}
                <div className="tape-sticker" style={{ borderTopColor: activeAlbum.coverColor }}>
                    <div className="sticker-meta">
                        <span className="side-indicator font-retro">{sideName}</span>
                        <div className="sticker-titles">
                            <div className="song-title">{activeAlbum.title}</div>
                            <div className="album-title-sticker">김광석 (Kim Kwang-seok)</div>
                        </div>
                        <span className="dolby-logo">DO DO[BY SYSTEM]</span>
                    </div>

                    {/* Tape Window with transparent center and reels */}
                    <div className="tape-window-wrapper">
                        <div className="window-glass">
                            {/* Supply Reel (Left) & Tape thickness */}
                            <div className="tape-reel-hub left-reel">
                                <svg className="tape-wrap-svg">
                                    <circle cx="50%" cy="50%" r={rLeft} className="tape-wrap-color" />
                                    <circle cx="50%" cy="50%" r={R_MIN} className="tape-reel-spokes-bg" />
                                </svg>
                                <div className={`spindle-gear ${reelSpeedClass}`}></div>
                            </div>

                            {/* Take-up Reel (Right) & Tape thickness */}
                            <div className="tape-reel-hub right-reel">
                                <svg className="tape-wrap-svg">
                                    <circle cx="50%" cy="50%" r={rRight} className="tape-wrap-color" />
                                    <circle cx="50%" cy="50%" r={R_MIN} className="tape-reel-spokes-bg" />
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

                {/* Bottom Exposed Magnetic Tape Area */}
                <div className="tape-bottom-plastic">
                    <div className="hole hole-outer-left"></div>
                    <div className="hole hole-inner-left"></div>
                    <div className="hole hole-inner-right"></div>
                    <div className="hole hole-outer-right"></div>
                </div>
            </div>
        );
    };

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
                <div className="nav-right-group">
                    <div className="album-info-display">
                        <span className="retro-tag">CASSETTE DECK</span>
                        <h2 className="album-display-title">{activeAlbum.title}</h2>
                    </div>
                    <button className="fullscreen-btn retro-btn" onClick={toggleFullscreen} title={isFullscreen ? "전체 화면 종료" : "전체 화면"}>
                        {isFullscreen ? (
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter">
                                <polyline points="5,1 5,5 1,5" />
                                <polyline points="11,1 11,5 15,5" />
                                <polyline points="5,15 5,11 1,11" />
                                <polyline points="11,15 11,11 15,11" />
                            </svg>
                        ) : (
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter">
                                <polyline points="1,5 1,1 5,1" />
                                <polyline points="15,5 15,1 11,1" />
                                <polyline points="1,11 1,15 5,15" />
                                <polyline points="15,11 15,15 11,15" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>

            <div className="player-main-layout">
                {/* Left: Disguised Youtube Iframe (The "Album Sleeve") */}
                <AlbumSleeve activeAlbum={activeAlbum} currentSide={currentSide} />

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
                            <div className={`cassette-eject-lifter ${isEjecting ? "eject-anim" : ""}`}>
                            <div className={`cassette-tape-wrap ${isFlipped ? "flipped-side" : ""}`}>
                                {/* 3D Extrusion Layers (Rounded Corners) */}
                                {Array.from({ length: 15 }).map((_, i) => {
                                    const zOffset = 7 - i;
                                    const isSeam = zOffset === 0;
                                    return (
                                        <div 
                                            key={i} 
                                            className={`tape-layer ${isSeam ? 'tape-seam' : ''}`} 
                                            style={{ transform: `translateZ(${zOffset}px)` }}
                                        ></div>
                                    );
                                })}
                                
                                {/* Cassette Faces */}
                                {renderTapeFace("tape-front", "A")}
                                {renderTapeFace("tape-back", "B")}
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
                                className={`deck-btn btn-play ${playIntent || playerStatus === "PLAYING" || playerStatus === "BUFFERING" ? "pressed" : ""}`}
                                onClick={() => { if (!isAtEnd) { setPlayIntent(true); play(); } }}
                                disabled={playerStatus === "PLAYING" || playerStatus === "BUFFERING" || isAtEnd}
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
                                disabled={isEjecting}
                            >
                                <div className="btn-cap"><span className="icon">&#9167;</span><span className="label">FLIP</span></div>
                            </button>
                        </div>
                    </div>


                </div>
            </div>
        </div>
    );
};
