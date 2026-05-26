import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import { YTPlayerProvider, useYTPlayer } from "./components/YTPlayerStore";
import { AlbumCarousel } from "./components/AlbumCarousel";
import { LPPlayer } from "./components/LPPlayer";
import { CassettePlayer } from "./components/CassettePlayer";
import { PlayerBackground } from "./components/PlayerBackground";
import "./App.css";

const Header: React.FC = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 150);
        };
        window.addEventListener("scroll", handleScroll);
        // Trigger once on mount
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const isMainPage = location.pathname === "/";
    const showHeader = !isMainPage || isScrolled;

    return (
        <header className={`site-header ${showHeader ? "scrolled" : ""}`}>
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                <h1 className="site-logo">다시 부르기 : 아날로그 김광석</h1>
            </Link>
        </header>
    );
};

const AppBackground: React.FC = () => {
    const { activeAlbum, playerStatus } = useYTPlayer();
    const location = useLocation();
    const isPlayerPage = location.pathname === '/lp' || location.pathname === '/cassette';

    if (!isPlayerPage || !activeAlbum) return null;

    return (
        <PlayerBackground
            youtubeId={activeAlbum.tracksSideA[0].youtubeId}
            coverColor={activeAlbum.coverColor}
            accentColor={activeAlbum.accentColor}
            isPlaying={playerStatus === "PLAYING" || playerStatus === "BUFFERING"}
        />
    );
};

const AppContent: React.FC = () => {
    return (
        <main className="app-main-content">
            <div className="smoke-ambient"></div>

            <Routes>
                <Route path="/" element={<AlbumCarousel />} />
                <Route path="/lp" element={<LPPlayer />} />
                <Route path="/cassette" element={<CassettePlayer />} />
            </Routes>
        </main>
    );
};

function App() {
    return (
        <YTPlayerProvider>
            <BrowserRouter>
                <div className="app-container">
                    <AppBackground />
                    <Header />
                    <AppContent />

                    {/* Minimal footer */}
                    <footer className="site-footer">
                        <p className="copyright-text">
                            Designed & Built as a Tribute Portfolio
                        </p>
                        <p className="legal-notes">
                            본 웹사이트는 故 김광석 님을 기리기 위해 제작된 비영리 팬/포트폴리오 프로젝트입니다.<br />
                            수록된 음원, 영상, 이미지의 모든 저작권 및 수익권은 원작자 및 관련 권리자에게 귀속되며, 어떠한 상업적 목적으로도 사용되지 않습니다.
                        </p>
                        <p className="contact-email">
                            문의 및 피드백 : <a href="mailto:shm040806@gmail.com">shm040806@gmail.com</a>
                        </p>
                    </footer>
                </div>
            </BrowserRouter>
        </YTPlayerProvider>
    );
}

export default App;
