import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useYTPlayer } from "./YTPlayerStore";

export const LPPlayer: React.FC = () => {
    const {
        activeAlbum,
        currentSide,
        currentTrack,
        playerStatus,
        currentTime,
        duration,
        play,
        pause,
        togglePlay,
        seekTo,
        setSide,
        resetPlayer
    } = useYTPlayer();
    
    const navigate = useNavigate();

    const [isLifted, setIsLifted] = useState<boolean>(false);

    useEffect(() => {
        if (!activeAlbum || !currentTrack) {
            navigate("/");
        }
    }, [activeAlbum, currentTrack, navigate]);

    useEffect(() => {
        const timer = setTimeout(() => {
            play();
        }, 600);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const tonearmRef = useRef<HTMLDivElement>(null);
    const pivotRef = useRef<HTMLDivElement>(null);
    const platterRef = useRef<HTMLDivElement>(null);
    const needleRef = useRef<HTMLDivElement>(null);

    const [angles, setAngles] = useState({ rest: 16, outer: 20, inner: 44 });

    useEffect(() => {
        const measure = () => {
            if (!platterRef.current || !tonearmRef.current || !pivotRef.current || !needleRef.current) return;
            
            const tonearmEl = tonearmRef.current;
            const prevTransform = tonearmEl.style.transform;
            const prevTransition = tonearmEl.style.transition;
            
            tonearmEl.style.transition = 'none';
            tonearmEl.style.transform = 'rotate(0deg)';
            void tonearmEl.offsetHeight; // force reflow

            const platterRect = platterRef.current.getBoundingClientRect();
            const pivotRect = pivotRef.current.getBoundingClientRect();
            const needleRect = needleRef.current.getBoundingClientRect();

            tonearmEl.style.transform = prevTransform;
            requestAnimationFrame(() => {
                if (tonearmRef.current) tonearmRef.current.style.transition = prevTransition;
            });

            const Cx = platterRect.left + platterRect.width / 2;
            const Cy = platterRect.top + platterRect.height / 2;
            const Px = pivotRect.left + pivotRect.width / 2;
            const Py = pivotRect.top + pivotRect.height / 2;
            const Nx = needleRect.left + needleRect.width / 2;
            
            // The needle tip is drawn using a pseudo-element (::after) which extends below the cartridge.
            // getBoundingClientRect() doesn't include pseudo-elements, so we extract its offset to get the true tip.
            const afterStyle = window.getComputedStyle(needleRef.current, '::after');
            const bottomOffset = Math.abs(parseFloat(afterStyle.bottom)) || 0;
            const Ny = needleRect.bottom + bottomOffset;

            const L = Math.sqrt(Math.pow(Nx - Px, 2) + Math.pow(Ny - Py, 2));
            const D = Math.sqrt(Math.pow(Cx - Px, 2) + Math.pow(Cy - Py, 2));

            const dx = Cx - Px;
            const dy = Cy - Py;
            const phi = Math.atan2(dy, dx) * (180 / Math.PI) - 90;

            const getTheta = (R: number) => {
                const cosAlpha = (L * L + D * D - R * R) / (2 * L * D);
                const alpha = Math.acos(Math.max(-1, Math.min(1, cosAlpha))) * (180 / Math.PI);
                return phi - alpha;
            };

            const R_outer = (platterRect.width / 2) * 0.90;
            const R_inner = (platterRect.width / 2) * 0.28;

            const outer = getTheta(R_outer);
            const inner = getTheta(R_inner);
            setAngles({ rest: outer - 4, outer, inner });
        };

        // Small delay to ensure CSS has fully loaded and laid out elements, especially when resizing
        const timer = setTimeout(measure, 50);
        window.addEventListener('resize', measure);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', measure);
        };
    }, []);

    const ANGLE_REST = angles.rest || 16;
    const ANGLE_OUTER = angles.outer || 20;
    const ANGLE_INNER = angles.inner || 44;

    const tracksList = currentSide === "A" ? activeAlbum?.tracksSideA : activeAlbum?.tracksSideB;
    const sideStartTime = tracksList?.[0]?.startTime || 0;
    const lastTrack = tracksList?.[tracksList.length - 1];
    const sideEndTime = lastTrack ? lastTrack.startTime + lastTrack.duration : (duration || 1);
    const sideDuration = sideEndTime - sideStartTime;

    // Calculate current tonearm angle from playback progress relative to the current side
    const clampedTime = Math.max(sideStartTime, Math.min(currentTime, sideEndTime));
    const progress = sideDuration > 0 ? (clampedTime - sideStartTime) / sideDuration : 0;
    const playbackAngle = ANGLE_OUTER + (ANGLE_INNER - ANGLE_OUTER) * progress;

    // While playing or paused, show playback-derived angle; while idle, resting
    const finalAngle = (isLifted || playerStatus === "UNSTARTED" || playerStatus === "ENDED" || playerStatus === "CUED")
            ? ANGLE_REST
            : playbackAngle;

    // Click on vinyl to seek
    const handleVinylClick = (e: React.MouseEvent<HTMLDivElement>) => {
        setIsLifted(false);
        if (!duration) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const dx = e.clientX - centerX;
        const dy = e.clientY - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const maxRadius = (rect.width / 2) * 0.90; // Outer edge of the grooved area
        const minRadius = (rect.width / 2) * 0.28; // Center label edge (approx 28% of radius)

        // Clamp distance to playable groove area
        const clampedDistance = Math.max(minRadius, Math.min(distance, maxRadius));

        // Map distance to progress (outer = 0%, inner = 100%)
        const clickProgress = 1 - (clampedDistance - minRadius) / (maxRadius - minRadius);
        const targetSeconds = sideStartTime + clickProgress * sideDuration;

        seekTo(targetSeconds);
        
        if (playerStatus !== "PLAYING" && playerStatus !== "BUFFERING") {
            play();
        }
    };

    if (!activeAlbum || !currentTrack) return null;

    const isSpinning = playerStatus === "PLAYING";
    const isBuffering = playerStatus === "BUFFERING";

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
                <div className="sleeve-column">
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
                                        {tracksList?.map((t, idx) => (
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
                                        <div className="label-track-title">김광석 (Kim Kwang-seok)</div>
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
                                    <div className="stylus-cartridge" ref={needleRef}></div>
                                </div>
                            </div>
                        </div>

                        {/* Turntable Controls */}
                        <div className="turntable-controls-bar">


                            {/* Play / Pause Toggle Lever — labeled START like the design */}
                            <button
                                className={`lever-switch ${isSpinning ? "active" : ""}`}
                                onClick={() => {
                                    setIsLifted(false);
                                    togglePlay();
                                }}
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
                                        setIsLifted(true);
                                        pause();
                                    }}
                                >
                                    ↑
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
