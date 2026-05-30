import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ALBUMS } from "../data/albums";
import type { Album } from "../data/albums";
import { useYTPlayer } from "./YTPlayerStore";

const N = ALBUMS.length;

function getAlbumStyle(i: number, flowIndex: number, windowWidth: number): React.CSSProperties {
    let off = ((i - flowIndex) % N + N) % N;
    if (off > N / 2) off -= N;
    const abs = Math.abs(off);

    // Calculate 3D circular radius based on window width (wider circles on wide screens)
    let radius = 280;
    if (windowWidth > 1800) {
        radius = 560;
    } else if (windowWidth > 1500) {
        radius = 480;
    } else if (windowWidth > 1200) {
        radius = 380;
    } else if (windowWidth > 800) {
        radius = 280;
    } else {
        radius = 180; // Mobile
    }

    // Spread albums horizontally using a dedicated spacing angle so they don't overlap completely
    const angle = off * 42;
    
    // Scale down slightly as they move further back
    const scale = off === 0 ? 1.05 : 1 - abs * 0.08;
    
    // Depth of field filters (brightness and blur) for realistic 3D feel
    let filter = "none";
    let opacity = 1;
    if (abs === 1) {
        filter = "brightness(0.75) contrast(0.9)";
        opacity = 0.85;
    } else if (abs === 2) {
        filter = "brightness(0.45) contrast(0.8) blur(1px)";
        opacity = 0.5;
    } else if (abs === 3) {
        filter = "brightness(0.2) blur(2px)";
        opacity = 0.2;
    }

    return {
        // rotateY(${angle}deg) translateZ(${radius}px) places them in a 3D circle.
        // The second rotateY(${-angle}deg) counter-rotates each album so it always faces perfectly front.
        transform: `translate(-50%,-50%) rotateY(${angle}deg) translateZ(${radius}px) rotateY(${-angle}deg) scale(${scale})`,
        opacity: opacity,
        zIndex: 100 - abs,
        filter: filter,
        pointerEvents: abs >= 2 ? "none" : "auto",
    };
}

export const AlbumCarousel: React.FC = () => {
    const { startMedia, resetPlayer } = useYTPlayer();
    const navigate = useNavigate();
    const [flowIndex, setFlowIndex] = useState(0);
    const [moving, setMoving] = useState(false);
    const moveTimerRef = useRef<number | null>(null);
    const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const flowIndexRef = useRef(flowIndex);
    const lastScrollTimeRef = useRef<number>(0);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const touchStartXRef = useRef<number>(0);
    const touchStartYRef = useRef<number>(0);

    useEffect(() => {
        flowIndexRef.current = flowIndex;
    }, [flowIndex]);

    useEffect(() => {
        resetPlayer();
        return () => { if (moveTimerRef.current) clearTimeout(moveTimerRef.current); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft")  setFlowIndex(i => (i - 1 + N) % N);
            if (e.key === "ArrowRight") setFlowIndex(i => (i + 1) % N);
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, []);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleWheel = (e: WheelEvent) => {
            const absX = Math.abs(e.deltaX);
            const absY = Math.abs(e.deltaY);
            
            // Adjusted threshold to trigger wheel scrolling at delta 3
            if (absX < 3 && absY < 3) return;

            const now = Date.now();
            // Reduced cooldown throttling (from 450ms to 220ms) for high responsiveness
            if (now - lastScrollTimeRef.current < 220) {
                e.preventDefault();
                return;
            }

            const currentIdx = flowIndexRef.current;
            let nextIndex = currentIdx;

            if (absX > absY) {
                if (e.deltaX > 0) nextIndex = (currentIdx + 1) % N;
                else nextIndex = (currentIdx - 1 + N) % N;
            } else {
                if (e.deltaY > 0) nextIndex = (currentIdx + 1) % N;
                else nextIndex = (currentIdx - 1 + N) % N;
            }

            if (nextIndex !== currentIdx) {
                setFlowIndex(nextIndex);
                setMoving(true);
                if (moveTimerRef.current) clearTimeout(moveTimerRef.current);
                moveTimerRef.current = window.setTimeout(() => setMoving(false), 720);
                lastScrollTimeRef.current = now;
            }
            e.preventDefault();
        };

        const handleTouchStart = (e: TouchEvent) => {
            touchStartXRef.current = e.touches[0].clientX;
            touchStartYRef.current = e.touches[0].clientY;
        };

        const handleTouchEnd = (e: TouchEvent) => {
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;

            const diffX = touchEndX - touchStartXRef.current;
            const diffY = touchEndY - touchStartYRef.current;

            // Lowered swipe distance requirement (from 20px to 10px) for quick swipes
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 10) {
                const currentIdx = flowIndexRef.current;
                let nextIndex = currentIdx;

                if (diffX > 0) {
                    nextIndex = (currentIdx - 1 + N) % N;
                } else {
                    nextIndex = (currentIdx + 1) % N;
                }

                if (nextIndex !== currentIdx) {
                    setFlowIndex(nextIndex);
                    setMoving(true);
                    if (moveTimerRef.current) clearTimeout(moveTimerRef.current);
                    moveTimerRef.current = window.setTimeout(() => setMoving(false), 720);
                }
            }
        };

        container.addEventListener("wheel", handleWheel, { passive: false });
        container.addEventListener("touchstart", handleTouchStart, { passive: true });
        container.addEventListener("touchend", handleTouchEnd, { passive: true });

        return () => {
            container.removeEventListener("wheel", handleWheel);
            container.removeEventListener("touchstart", handleTouchStart);
            container.removeEventListener("touchend", handleTouchEnd);
        };
    }, []);

    const handleSelectMedia = (album: Album, media: "lp" | "cassette", e: React.MouseEvent) => {
        e.stopPropagation();
        startMedia(album, media);
        navigate(`/${media}`);
    };

    const currentAlbum = ALBUMS[flowIndex];

    return (
        <div className="home">
            <div className="home-top">
                <div className="brand-mark">
                    <b>다시부르기: 가객의 앨범들</b>
                </div>
                <div className="meta">KIM KWANG-SEOK · ANALOG ARCHIVE</div>
            </div>

            <div className="hero">
                <span className="eyebrow">곡이 아니라, 한 장의 시간을</span>
                <div className="rule" />
                <h1>넘기지 않고<br /><em>처음부터 끝까지</em> 듣는 일.</h1>
                <p>
                    빨리 감기도, 다음 곡 버튼도 없습니다. LP의 바늘을 직접 내려놓고,
                    카세트의 릴이 다 풀릴 때까지 <br />
                    김광석이 한 장에 담아 건넨 순서 그대로 그의 목소리를 마주합니다.
                </p>
            </div>

            <div className="shelf-head">
                <span className="eyebrow">가객의 앨범들</span>
            </div>

            <div className="flow" ref={containerRef}>
                <div className="flow-track">
                    {ALBUMS.map((album, i) => {
                        let off = ((i - flowIndex) % N + N) % N;
                        if (off > N / 2) off -= N;
                        const active = off === 0;
                        return (
                            <div
                                key={album.id}
                                className={`alb${active ? " active" : ""}${active && moving ? " moving" : ""}`}
                                style={getAlbumStyle(i, flowIndex, windowWidth)}
                                onClick={() => {
                                    if (!active) {
                                        setFlowIndex(i);
                                        setMoving(true);
                                        if (moveTimerRef.current) clearTimeout(moveTimerRef.current);
                                        moveTimerRef.current = window.setTimeout(() => setMoving(false), 720);
                                    }
                                }}
                            >
                                <div className="cover">
                                    <img
                                        src={`https://img.youtube.com/vi/${album.tracksSideA[0].youtubeId}/hqdefault.jpg`}
                                        alt={album.title}
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "cover",
                                            transform: `scale(${album.coverScale || 1.34}) translateY(${album.coverOffsetY || "0px"})`,
                                        }}
                                    />
                                </div>
                                <div className="media">
                                    <button
                                        className="media-chip"
                                        onClick={(e) => handleSelectMedia(album, "lp", e)}
                                    >
                                        <LPIcon />
                                        <span>LP</span>
                                        <small>턴테이블</small>
                                    </button>
                                    <button
                                        className="media-chip"
                                        onClick={(e) => handleSelectMedia(album, "cassette", e)}
                                    >
                                        <TapeIcon />
                                        <span>Tape</span>
                                        <small>카세트</small>
                                    </button>
                                </div>
                                <div className="spine-year">{album.year}</div>
                                <div className="titleplate">{album.title}</div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="home-foot">
                <span>
                    {String(flowIndex + 1).padStart(2, "0")} / {String(N).padStart(2, "0")} — {currentAlbum.title}
                </span>
                <span>LP · CASSETTE TAPE — 매체를 골라 재생을 시작하세요</span>
            </div>
        </div>
    );
};

const LPIcon = () => (
    <svg className="ic" viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="20" r="17" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="20" cy="20" r="9" stroke="currentColor" strokeWidth="1" />
        <circle cx="20" cy="20" r="3.5" fill="currentColor" />
    </svg>
);

const TapeIcon = () => (
    <svg className="ic" viewBox="0 0 40 40" fill="none">
        <rect x="3" y="9" width="34" height="22" rx="3" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="14" cy="22" r="4.5" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="26" cy="22" r="4.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M18.5 22h3" stroke="currentColor" strokeWidth="1" />
    </svg>
);
