import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ALBUMS } from "../data/albums";
import type { Album } from "../data/albums";
import { useYTPlayer } from "./YTPlayerStore";

export const AlbumCarousel: React.FC = () => {
    const { selectAlbum, selectMedia } = useYTPlayer();
    const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
    const navigate = useNavigate();

    const handleCardClick = (album: Album) => {
        setSelectedAlbum(album);
    };

    const handleSelectMedia = (media: "lp" | "cassette") => {
        if (selectedAlbum) {
            selectAlbum(selectedAlbum);
            selectMedia(media);
            setSelectedAlbum(null);
            navigate(`/${media}`);
        }
    };

    const closePopup = () => {
        setSelectedAlbum(null);
    };

    return (
        <div className="home-section">
            {/* Hero Title Area — matching design/home.png */}
            <div className="home-hero">
                <p className="hero-subtitle">THE ANALOG COLLECTION</p>
                <h1 className="hero-title">김광석 디스코그래피</h1>
                <p className="hero-desc">
                    Select a physical format below an album to begin your listening experience.
                </p>
            </div>

            {/* 3x2 Album Grid — matching design/home.png */}
            <div className="album-grid">
                {ALBUMS.map((album) => (
                    <div
                        key={album.id}
                        className="album-grid-item"
                        onClick={() => handleCardClick(album)}
                    >
                        {/* Album Cover Card */}
                        <div className="album-cover-stack">
                            {/* Main LP Sleeve */}
                            <div className="lp-sleeve-card" style={{ backgroundColor: album.coverColor }}>
                                <div className="sleeve-inner-glow"></div>
                                <div className="sleeve-content">
                                    <div className="sleeve-vintage-border">
                                        <div className="sleeve-album-name">{album.title}</div>
                                        <div className="sleeve-album-sub">{album.subtitle}</div>
                                    </div>
                                </div>
                            </div>
                            {/* Mini Cassette thumbnail — overlapping */}
                            <div className="cassette-mini-card">
                                <div className="cassette-mini-inner" style={{ borderTopColor: album.coverColor }}>
                                    <div className="cassette-mini-window">
                                        <div className="mini-reel"></div>
                                        <div className="mini-reel"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Album Info */}
                        <div className="album-grid-info">
                            <h3 className="album-grid-title">{album.title.replace("김광석 ", "")}</h3>
                            <p className="album-grid-year">{album.year}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Media Selection Modal */}
            {selectedAlbum && (
                <div className="media-modal-backdrop" onClick={closePopup}>
                    <div
                        className="media-modal-content"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button className="modal-close" onClick={closePopup}>&times;</button>

                        <div className="modal-header">
                            <span className="album-badge" style={{ backgroundColor: selectedAlbum.coverColor, color: selectedAlbum.textColor }}>
                                {selectedAlbum.year}
                            </span>
                            <h2>{selectedAlbum.title}</h2>
                            <p className="modal-subtitle">{selectedAlbum.subtitle}</p>
                        </div>

                        <p className="choice-prompt">감상할 재생 매체를 선택하세요</p>

                        <div className="media-options">
                            {/* LP Option */}
                            <div
                                className="media-option-card"
                                onClick={() => handleSelectMedia("lp")}
                            >
                                <div className="media-icon-box">
                                    <div className="vinyl-icon-bright"></div>
                                </div>
                                <div className="media-info">
                                    <h3>LP 턴테이블</h3>
                                    <p>톤암 바늘을 직접 올려놓는 공간형 아날로그 감성</p>
                                </div>
                            </div>

                            {/* Cassette Option */}
                            <div
                                className="media-option-card"
                                onClick={() => handleSelectMedia("cassette")}
                            >
                                <div className="media-icon-box">
                                    <div className="cassette-icon-bright">
                                        <span className="reel-dot"></span>
                                        <span className="reel-dot"></span>
                                    </div>
                                </div>
                                <div className="media-info">
                                    <h3>카세트 테이프</h3>
                                    <p>되감기/빨리감기와 A/B면을 뒤집는 빈티지 디바이스</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
