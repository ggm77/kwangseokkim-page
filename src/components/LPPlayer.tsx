import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useYTPlayer } from "./YTPlayerStore";
import { AlbumSleeve } from "./AlbumSleeve";

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
        seekTo,
        setSide,
        resetPlayer,
    } = useYTPlayer();

    const navigate = useNavigate();

    const [viewSide, setViewSide] = useState<"A" | "B">(currentSide);
    const [isSideChanging, setIsSideChanging] = useState<boolean>(false);
    const [isLifted, setIsLifted] = useState<boolean>(false);
    const [isLiftStopping, setIsLiftStopping] = useState<boolean>(false);
    const [playIntent, setPlayIntent] = useState<boolean>(false);
    const liftStopTimerRef = useRef<any>(null);
    const playDelayTimerRef = useRef<any>(null);
    const sideChangeTimerRef = useRef<any>(null);
    const playerStatusRef = useRef(playerStatus);
    const playRef = useRef(play);
    const pauseRef = useRef(pause);

    useEffect(() => {
        playerStatusRef.current = playerStatus;
        playRef.current = play;
        pauseRef.current = pause;
    }, [playerStatus, play, pause]);

    // Sync viewSide with currentSide when currentSide changes naturally (e.g. auto flip)
    useEffect(() => {
        setViewSide(currentSide);
    }, [currentSide]);

    useEffect(() => {
        return () => {
            if (sideChangeTimerRef.current)
                clearTimeout(sideChangeTimerRef.current);
            if (playDelayTimerRef.current)
                clearTimeout(playDelayTimerRef.current);
            if (liftStopTimerRef.current)
                clearTimeout(liftStopTimerRef.current);
        };
    }, []);

    const handleSideChange = (targetSide: "A" | "B") => {
        if (currentSide === targetSide || isSideChanging) return;

        setIsSideChanging(true);

        // 1. Pause playback and lift tonearm
        setIsLifted(true);
        if (playDelayTimerRef.current) clearTimeout(playDelayTimerRef.current);
        setPlayIntent(false);
        pauseRef.current();

        setIsLiftStopping(true);
        if (liftStopTimerRef.current) clearTimeout(liftStopTimerRef.current);
        liftStopTimerRef.current = setTimeout(() => {
            setIsLiftStopping(false);
        }, 300);

        // 2. Wait for tonearm to return, then flip the side
        if (sideChangeTimerRef.current) clearTimeout(sideChangeTimerRef.current);
        sideChangeTimerRef.current = setTimeout(() => {
            // Force platter to stop completely right before flip
            cancelAnimationFrame(slowDownReqRef.current);
            if (spinAnimRef.current) {
                spinAnimRef.current.pause();
                spinAnimRef.current.playbackRate = 0;
            }

            setSide(targetSide);
            setViewSide(targetSide);
            
            // Wait briefly so the user sees the flipped and stopped record
            setTimeout(() => {
                setIsSideChanging(false);
                
                // 3. Auto-play after flipping
                setIsLifted(false);
                setPlayIntent(true);
                playDelayTimerRef.current = setTimeout(() => {
                    playRef.current();
                }, 1000);
            }, 800);
        }, 1200);
    };

    useEffect(() => {
        if (!activeAlbum || !currentTrack) {
            navigate("/");
        }
    }, [activeAlbum, currentTrack, navigate]);

    useEffect(() => {
        if (playerStatus === "PLAYING") {
            setPlayIntent(false);
        }
    }, [playerStatus]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (
                document.activeElement?.tagName === "BUTTON" &&
                e.code === "Space"
            )
                return;

            if (e.code === "Space" && !e.repeat) {
                e.preventDefault();

                const status = playerStatusRef.current;
                if (status !== "PLAYING" && status !== "BUFFERING") {
                    if (sideChangeTimerRef.current) {
                        clearTimeout(sideChangeTimerRef.current);
                        sideChangeTimerRef.current = null;
                    }
                    setIsLifted(false);
                    setIsLiftStopping(false);
                    if (liftStopTimerRef.current)
                        clearTimeout(liftStopTimerRef.current);

                    setPlayIntent(true);
                    if (playDelayTimerRef.current)
                        clearTimeout(playDelayTimerRef.current);
                    playDelayTimerRef.current = setTimeout(() => {
                        playRef.current();
                    }, 1000);
                } else {
                    setIsLifted(true);
                    if (playDelayTimerRef.current)
                        clearTimeout(playDelayTimerRef.current);
                    setPlayIntent(false);
                    pauseRef.current();

                    setIsLiftStopping(true);
                    if (liftStopTimerRef.current)
                        clearTimeout(liftStopTimerRef.current);
                    liftStopTimerRef.current = setTimeout(() => {
                        setIsLiftStopping(false);
                    }, 300);
                }
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const tonearmRef = useRef<HTMLDivElement>(null);
    const pivotRef = useRef<HTMLDivElement>(null);
    const platterRef = useRef<HTMLDivElement>(null);
    const needleRef = useRef<HTMLDivElement>(null);
    const platterSpinRef = useRef<HTMLDivElement>(null);
    const spinAnimRef = useRef<Animation | null>(null);
    const slowDownReqRef = useRef<number>(0);

    const [angles, setAngles] = useState({ rest: 16, outer: 20, inner: 44 });

    useEffect(() => {
        const measure = () => {
            if (
                !platterRef.current ||
                !tonearmRef.current ||
                !pivotRef.current ||
                !needleRef.current
            )
                return;

            const tonearmEl = tonearmRef.current;
            const prevTransform = tonearmEl.style.transform;
            const prevTransition = tonearmEl.style.transition;

            tonearmEl.style.transition = "none";
            tonearmEl.style.transform = "rotate(0deg)";
            void tonearmEl.offsetHeight; // force reflow

            const platterRect = platterRef.current.getBoundingClientRect();
            const pivotRect = pivotRef.current.getBoundingClientRect();
            const needleRect = needleRef.current.getBoundingClientRect();

            tonearmEl.style.transform = prevTransform;
            requestAnimationFrame(() => {
                if (tonearmRef.current)
                    tonearmRef.current.style.transition = prevTransition;
            });

            const Cx = platterRect.left + platterRect.width / 2;
            const Cy = platterRect.top + platterRect.height / 2;
            const Px = pivotRect.left + pivotRect.width / 2;
            const Py = pivotRect.top + pivotRect.height / 2;
            const Nx = needleRect.left + needleRect.width / 2;

            // The needle tip is drawn using a pseudo-element (::after) which extends below the cartridge.
            // getBoundingClientRect() doesn't include pseudo-elements, so we extract its offset to get the true tip.
            const afterStyle = window.getComputedStyle(
                needleRef.current,
                "::after",
            );
            const bottomOffset = Math.abs(parseFloat(afterStyle.bottom)) || 0;
            const Ny = needleRect.bottom + bottomOffset;

            const L = Math.sqrt(Math.pow(Nx - Px, 2) + Math.pow(Ny - Py, 2));
            const D = Math.sqrt(Math.pow(Cx - Px, 2) + Math.pow(Cy - Py, 2));

            const dx = Cx - Px;
            const dy = Cy - Py;
            const phi = Math.atan2(dy, dx) * (180 / Math.PI) - 90;

            const getTheta = (R: number) => {
                const cosAlpha = (L * L + D * D - R * R) / (2 * L * D);
                const alpha =
                    Math.acos(Math.max(-1, Math.min(1, cosAlpha))) *
                    (180 / Math.PI);
                return phi - alpha;
            };

            const R_outer = (platterRect.width / 2) * 0.9;
            const R_inner = (platterRect.width / 2) * 0.28;

            const outer = getTheta(R_outer);
            const inner = getTheta(R_inner);
            setAngles({ rest: outer - 4, outer, inner });
        };

        // Small delay to ensure CSS has fully loaded and laid out elements, especially when resizing
        const timer = setTimeout(measure, 50);
        window.addEventListener("resize", measure);
        return () => {
            clearTimeout(timer);
            window.removeEventListener("resize", measure);
        };
    }, []);

    const ANGLE_REST = angles.rest || 16;
    const ANGLE_OUTER = angles.outer || 20;
    const ANGLE_INNER = angles.inner || 44;

    const tracksList =
        currentSide === "A"
            ? activeAlbum?.tracksSideA
            : activeAlbum?.tracksSideB;
    const sideStartTime = tracksList?.[0]?.startTime || 0;
    const lastTrack = tracksList?.[tracksList.length - 1];
    const sideEndTime = lastTrack
        ? lastTrack.startTime + lastTrack.duration
        : duration || 1;
    const sideDuration = sideEndTime - sideStartTime;

    // Calculate current tonearm angle from playback progress relative to the current side
    const clampedTime = Math.max(
        sideStartTime,
        Math.min(currentTime, sideEndTime),
    );
    const progress =
        sideDuration > 0 ? (clampedTime - sideStartTime) / sideDuration : 0;
    const playbackAngle = ANGLE_OUTER + (ANGLE_INNER - ANGLE_OUTER) * progress;

    const isBuffering = playerStatus === "BUFFERING";
    const isLeverActive = playIntent || playerStatus === "PLAYING" || isBuffering;

    // While lever is active and not lifted, show playback-derived angle; while idle, resting
    const finalAngle =
        isLifted || !isLeverActive
            ? ANGLE_REST
            : playbackAngle;

    // Click on vinyl to seek
    const handleVinylClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (sideChangeTimerRef.current) {
            clearTimeout(sideChangeTimerRef.current);
            sideChangeTimerRef.current = null;
        }
        setIsLifted(false);
        setIsLiftStopping(false);
        if (liftStopTimerRef.current) clearTimeout(liftStopTimerRef.current);
        if (!duration) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const dx = e.clientX - centerX;
        const dy = e.clientY - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const maxRadius = (rect.width / 2) * 0.9; // Outer edge of the grooved area
        const minRadius = (rect.width / 2) * 0.28; // Center label edge (approx 28% of radius)

        // Clamp distance to playable groove area
        const clampedDistance = Math.max(
            minRadius,
            Math.min(distance, maxRadius),
        );

        // Map distance to progress (outer = 0%, inner = 100%)
        const clickProgress =
            1 - (clampedDistance - minRadius) / (maxRadius - minRadius);
        const targetSeconds = sideStartTime + clickProgress * sideDuration;

        seekTo(targetSeconds);

        if (playerStatus !== "PLAYING" && playerStatus !== "BUFFERING") {
            setPlayIntent(true);
            if (playDelayTimerRef.current)
                clearTimeout(playDelayTimerRef.current);
            playDelayTimerRef.current = setTimeout(() => {
                playRef.current();
            }, 1000);
        }
    };

    const isSpinning = isLeverActive || isLiftStopping;

    useEffect(() => {
        if (!platterSpinRef.current) return;

        if (!spinAnimRef.current) {
            spinAnimRef.current = platterSpinRef.current.animate(
                [
                    { transform: "rotate(0deg)" },
                    { transform: "rotate(360deg)" },
                ],
                { duration: 1800, iterations: Infinity, easing: "linear" },
            );
            if (!isSpinning) {
                spinAnimRef.current.pause();
            }
        }

        const anim = spinAnimRef.current;

        if (isSpinning) {
            cancelAnimationFrame(slowDownReqRef.current);
            if (anim.playState !== "running") {
                anim.play();
            }
            let start: number | null = null;
            const dur = 1000;
            const initialRate = anim.playbackRate;
            const speedUp = (timestamp: number) => {
                if (!start) start = timestamp;
                const progress = Math.min((timestamp - start) / dur, 1);
                const easeOut = 1 - Math.pow(1 - progress, 3);
                anim.playbackRate = Math.min(1, initialRate + (1 - initialRate) * easeOut);
                if (progress < 1) slowDownReqRef.current = requestAnimationFrame(speedUp);
            };
            slowDownReqRef.current = requestAnimationFrame(speedUp);
        } else {
            cancelAnimationFrame(slowDownReqRef.current);
            if (anim.playState === "running") {
                let start: number | null = null;
                const dur = 2500;
                const initialRate = anim.playbackRate;
                const slowDown = (timestamp: number) => {
                    if (!start) start = timestamp;
                    const progress = Math.min((timestamp - start) / dur, 1);
                    const easeOut = 1 - Math.pow(1 - progress, 3);
                    anim.playbackRate = Math.max(0, initialRate * (1 - easeOut));
                    if (progress < 1) {
                        slowDownReqRef.current = requestAnimationFrame(slowDown);
                    } else {
                        anim.pause();
                    }
                };
                slowDownReqRef.current = requestAnimationFrame(slowDown);
            }
        }
        return () => cancelAnimationFrame(slowDownReqRef.current);
    }, [isSpinning]);

    if (!activeAlbum || !currentTrack) return null;

    return (
        <div className="player-page lp-page-container">
            {/* Back to Home & Info Bar */}
            <div className="player-nav-header">
                <button
                    className="back-btn retro-btn"
                    onClick={() => {
                        resetPlayer();
                        navigate("/");
                    }}
                >
                    &larr; 보관소로 돌아가기
                </button>
                <div className="album-info-display">
                    <span className="retro-tag">HI-FI TURNTABLE</span>
                    <h2 className="album-display-title">{activeAlbum.title}</h2>
                </div>
            </div>

            <div className="player-main-layout">
                {/* Left Side: Youtube Player (Album Sleeve Cover Mock) */}
                <AlbumSleeve
                    activeAlbum={activeAlbum}
                    currentSide={viewSide}
                    onSleeveClick={() => setViewSide(viewSide === 'A' ? 'B' : 'A')}
                />

                {/* Right/Center: Large Draggable Turntable */}
                <div className="player-column">
                    <div className="turntable-deck-outer glass-effect">
                        {/* Turntable Platter & Vinyl Record */}
                        <div className="platter-compartment" ref={platterRef}>
                            <div
                                className="turntable-platter"
                                ref={platterSpinRef}
                            >
                                <div
                                    className={`vinyl-record ${currentSide === "B" ? "flip-side-b" : ""}`}
                                    onClick={handleVinylClick}
                                    style={{ cursor: "pointer" }}
                                    title="원하는 위치를 클릭하여 재생"
                                >
                                    <div className="vinyl-face vinyl-front">
                                        <div className="vinyl-groove-lines"></div>
                                        <div className="vinyl-label-center" style={{ backgroundColor: activeAlbum.coverColor }}>
                                            <div className="label-album-title">{activeAlbum.title}</div>
                                            <div className="label-track-title">김광석 (Kim Kwang-seok)</div>
                                            <div className="label-side-indicator">SIDE A</div>
                                            <div className="label-spindle-hole"></div>
                                        </div>
                                    </div>
                                    <div className="vinyl-face vinyl-back">
                                        <div className="vinyl-groove-lines"></div>
                                        <div className="vinyl-label-center" style={{ backgroundColor: activeAlbum.coverColor }}>
                                            <div className="label-album-title">{activeAlbum.title}</div>
                                            <div className="label-track-title">김광석 (Kim Kwang-seok)</div>
                                            <div className="label-side-indicator">SIDE B</div>
                                            <div className="label-spindle-hole"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Draggable Tonearm Unit */}
                            <div
                                className="tonearm-assembly"
                                ref={tonearmRef}
                                style={{
                                    transform: `rotate(${finalAngle}deg)`,
                                }}
                            >
                                <div
                                    className="tonearm-pivot-base"
                                    ref={pivotRef}
                                >
                                    <div className="weight-dial"></div>
                                </div>

                                <div className="tonearm-rod"></div>

                                <div className="tonearm-headshell">
                                    <div
                                        className="stylus-cartridge"
                                        ref={needleRef}
                                    ></div>
                                </div>
                            </div>
                        </div>

                        {/* Turntable Controls */}
                        <div className="turntable-controls-bar">
                            {/* Play / Pause Toggle Lever — labeled START like the design */}
                            <button
                                className={`lever-switch ${isLeverActive ? "active" : ""}`}
                                onClick={() => {
                                    if (
                                        playerStatus !== "PLAYING" &&
                                        playerStatus !== "BUFFERING"
                                    ) {
                                        // Turn ON
                                        if (sideChangeTimerRef.current) {
                                            clearTimeout(
                                                sideChangeTimerRef.current,
                                            );
                                            sideChangeTimerRef.current = null;
                                        }
                                        setIsLifted(false);
                                        setIsLiftStopping(false);
                                        if (liftStopTimerRef.current)
                                            clearTimeout(
                                                liftStopTimerRef.current,
                                            );

                                        setPlayIntent(true);
                                        if (playDelayTimerRef.current)
                                            clearTimeout(
                                                playDelayTimerRef.current,
                                            );
                                        playDelayTimerRef.current = setTimeout(
                                            () => {
                                                playRef.current();
                                            },
                                            1000,
                                        );
                                    } else {
                                        // Turn OFF
                                        setIsLifted(true);
                                        if (playDelayTimerRef.current)
                                            clearTimeout(
                                                playDelayTimerRef.current,
                                            );
                                        setPlayIntent(false);
                                        pauseRef.current();

                                        setIsLiftStopping(true);
                                        if (liftStopTimerRef.current)
                                            clearTimeout(
                                                liftStopTimerRef.current,
                                            );
                                        liftStopTimerRef.current = setTimeout(
                                            () => {
                                                setIsLiftStopping(false);
                                            },
                                            300,
                                        );
                                    }
                                }}
                            >
                                <div className="lever-handle"></div>
                                <span className="lever-label">
                                    STOP / START
                                </span>
                            </button>

                            {/* Right side group: SIDE and LIFT */}
                            <div className="turntable-right-controls">
                                {/* Side A / B Toggle Selector */}
                                <div className="side-selector-knob">
                                    <span className="knob-label">SIDE</span>
                                    <div className="radio-toggle-group">
                                        <button
                                            className={`toggle-option ${currentSide === "A" ? "active" : ""}`}
                                            onClick={() => handleSideChange("A")}
                                            disabled={isSideChanging}
                                        >
                                            A
                                        </button>
                                        <button
                                            className={`toggle-option ${currentSide === "B" ? "active" : ""}`}
                                            onClick={() => handleSideChange("B")}
                                            disabled={isSideChanging}
                                        >
                                            B
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
