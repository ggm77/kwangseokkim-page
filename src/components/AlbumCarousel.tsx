import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ALBUMS } from "../data/albums";
import type { Album } from "../data/albums";
import { useYTPlayer } from "./YTPlayerStore";

const N = ALBUMS.length;

function getAlbumStyle(i: number, flowIndex: number): React.CSSProperties {
    let off = ((i - flowIndex) % N + N) % N;
    if (off > N / 2) off -= N;
    const abs = Math.abs(off);
    const x = off * 198;
    const rot = off === 0 ? 0 : off < 0 ? 40 : -40;
    const z = -abs * 200;
    const scale = off === 0 ? 1.1 : 1 - Math.min(abs, 3) * 0.08;
    return {
        transform: `translate(-50%,-50%) translateX(${x}px) translateZ(${z}px) rotateY(${rot}deg) scale(${scale})`,
        opacity: 1,
        zIndex: 100 - abs,
        filter: off === 0 ? "none" : `brightness(${0.8 - abs * 0.06})`,
    };
}

export const AlbumCarousel: React.FC = () => {
    const { startMedia, resetPlayer } = useYTPlayer();
    const navigate = useNavigate();
    const [flowIndex, setFlowIndex] = useState(0);

    useEffect(() => {
        resetPlayer();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft") setFlowIndex(i => (i - 1 + N) % N);
            if (e.key === "ArrowRight") setFlowIndex(i => (i + 1) % N);
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
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
                    <span className="brand-dot" />
                    <b>다시 부르기</b>
                </div>
                <div className="meta">KIM KWANG-SEOK · ANALOG ARCHIVE</div>
            </div>

            <div className="hero">
                <span className="eyebrow">곡이 아니라, 한 장의 시간을</span>
                <div className="rule" />
                <h1>넘기지 않고<br /><em>처음부터 끝까지</em> 듣는 일.</h1>
                <p>
                    빨리 감기도, 다음 곡 버튼도 없습니다. LP의 바늘을 직접 내려놓고,
                    카세트의 릴이 다 풀릴 때까지 — 김광석이 한 장에 담아 건넨 순서 그대로
                    그의 목소리를 마주합니다.
                </p>
            </div>

            <div className="shelf-head">
                <span className="eyebrow">가객의 앨범들</span>
                <span className="shelf-hint">앨범을 클릭해 가운데로</span>
            </div>

            <div className="flow">
                <div className="flow-track">
                    {ALBUMS.map((album, i) => {
                        let off = ((i - flowIndex) % N + N) % N;
                        if (off > N / 2) off -= N;
                        const active = off === 0;
                        return (
                            <div
                                key={album.id}
                                className={`alb${active ? " active" : ""}`}
                                style={getAlbumStyle(i, flowIndex)}
                                onClick={() => { if (!active) setFlowIndex(i); }}
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
