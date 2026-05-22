import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import { YTPlayerProvider, useYTPlayer } from "./components/YTPlayerStore";
import { AlbumCarousel } from "./components/AlbumCarousel";
import { LPPlayer } from "./components/LPPlayer";
import { CassettePlayer } from "./components/CassettePlayer";
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
                    {/* Dynamic Scroll Header */}
                    <Header />

                    <AppContent />

                {/* Minimal footer */}
                <footer className="site-footer">
                    <p className="copyright-text">
                        © 2026 아날로그 김광석 음악 보관소
                    </p>
                    <p className="legal-notes">
                        본 웹사이트는 비영리 학습 및 연구용 포트폴리오 프로젝트입니다. 수록된 영상의 모든 저작권 및 수익권은 유튜브 공식 채널 및 원작자에게 귀속됩니다.
                    </p>
                </footer>
            </div>
            </BrowserRouter>
        </YTPlayerProvider>
    );
}

export default App;
