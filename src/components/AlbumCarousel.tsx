import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ALBUMS } from "../data/albums";
import type { Album } from "../data/albums";
import { useYTPlayer } from "./YTPlayerStore";

export const AlbumCarousel: React.FC = () => {
    const { selectAlbum, selectMedia } = useYTPlayer();
    const navigate = useNavigate();

    const handleSelectMedia = (album: Album, media: "lp" | "cassette", e: React.MouseEvent) => {
        e.stopPropagation();
        selectAlbum(album);
        selectMedia(media);
        navigate(`/${media}`);
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
                        onClick={(e) => handleSelectMedia(album, "lp", e)}
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
                            <div 
                                className="cassette-mini-card" 
                                onClick={(e) => handleSelectMedia(album, "cassette", e)}
                            >
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


        </div>
    );
};
