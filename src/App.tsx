import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import { YTPlayerProvider, useYTPlayer } from "./components/YTPlayerStore";
import { AlbumCarousel } from "./components/AlbumCarousel";
import { LPPlayer } from "./components/LPPlayer";
import { CassettePlayer } from "./components/CassettePlayer";
import "./App.css";

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

const HeaderNav: React.FC = () => {
    const location = useLocation();
    
    return (
        <nav className="site-nav">
            <Link to="/" className={`nav-link ${location.pathname === "/" ? "active" : ""}`}>Home</Link>
            <Link to="/archives" className={`nav-link ${location.pathname === "/archives" ? "active" : ""}`}>Archives</Link>
        </nav>
    );
};

function App() {
    return (
        <YTPlayerProvider>
            <BrowserRouter>
                <div className="app-container">
                    {/* Clean Header — matching design/home.png */}
                    <header className="site-header">
                        <h1 className="site-logo">아날로그 김광석</h1>
                        <HeaderNav />
                    <div className="header-icons">
                        <button className="icon-btn" aria-label="검색">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                        </button>
                        <button className="icon-btn" aria-label="프로필">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                        </button>
                    </div>
                </header>

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
