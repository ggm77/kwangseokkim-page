import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import type { Album, Track } from "../data/albums";
import { ALBUMS } from "../data/albums";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: (() => void) | undefined;
  }
}

export type PlayerStatus = "UNSTARTED" | "ENDED" | "PLAYING" | "PAUSED" | "BUFFERING" | "CUED";

interface YTPlayerContextType {
  activeAlbum: Album | null;
  activeMedia: "lp" | "cassette" | null;
  currentSide: "A" | "B";
  currentTrackIndex: number;
  currentTrack: Track | null;
  playerStatus: PlayerStatus;
  currentTime: number;
  duration: number;
  isMuted: boolean;
  volume: number;
  
  selectAlbum: (album: Album | null) => void;
  selectMedia: (media: "lp" | "cassette" | null) => void;
  startMedia: (album: Album, media: "lp" | "cassette") => void;
  play: () => void;
  pause: () => void;
  stop: () => void;
  togglePlay: () => void;
  seekTo: (seconds: number) => void;
  setSide: (side: "A" | "B") => void;
  setTrackIndex: (index: number) => void;
  toggleMute: () => void;
  setVolume: (vol: number) => void;
  resetPlayer: () => void;
  
  iframeContainerId: string;
}

const YTPlayerContext = createContext<YTPlayerContextType | undefined>(undefined);

export const useYTPlayer = () => {
  const context = useContext(YTPlayerContext);
  if (!context) {
    throw new Error("useYTPlayer must be used within a YTPlayerProvider");
  }
  return context;
};

export const YTPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeAlbum, setActiveAlbum] = useState<Album | null>(() => {
    try {
      const saved = sessionStorage.getItem("activeAlbumId");
      if (saved) {
        return ALBUMS.find(a => String(a.id) === saved) || null;
      }
    } catch(e) {}
    return null;
  });
  const [activeMedia, setActiveMedia] = useState<"lp" | "cassette" | null>(null);
  const [currentSide, setCurrentSide] = useState<"A" | "B">("A");
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [playerStatus, setPlayerStatus] = useState<PlayerStatus>("UNSTARTED");
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolumeState] = useState<number>(80);

  const playerRef = useRef<any>(null);
  const timeUpdateInterval = useRef<number | null>(null);
  const iframeContainerId = "yt-global-player";
  
  const tracks = activeAlbum ? (currentSide === "A" ? activeAlbum.tracksSideA : activeAlbum.tracksSideB) : [];
  const currentTrack = tracks[currentTrackIndex] || null;

  // Refs for callbacks
  const stateRef = useRef({ activeAlbum, currentSide, currentTrackIndex, tracks, currentTrack });
  useEffect(() => {
    stateRef.current = { activeAlbum, currentSide, currentTrackIndex, tracks, currentTrack };
  }, [activeAlbum, currentSide, currentTrackIndex, tracks, currentTrack]);

  const volMuteRef = useRef({ volume, isMuted });
  useEffect(() => {
    volMuteRef.current = { volume, isMuted };
  }, [volume, isMuted]);

  // Load API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }
  }, []);

  const handleTrackEnd = () => {
    const { activeAlbum, currentSide, currentTrackIndex, tracks } = stateRef.current;
    if (!activeAlbum) return;

    const nextIndex = currentTrackIndex + 1;
    if (nextIndex < tracks.length) {
      setCurrentTrackIndex(nextIndex);
    } else {
      if (currentSide === "A") {
        setTimeout(() => { setCurrentSide("B"); setCurrentTrackIndex(0); }, 1500);
      } else {
        setTimeout(() => { setCurrentSide("A"); setCurrentTrackIndex(0); }, 1500);
      }
    }
  };

  // Init global player once
  useEffect(() => {
    let isCancelled = false;
    const initPlayer = () => {
      if (isCancelled) return;
      if (playerRef.current) return;
      const el = document.getElementById(iframeContainerId);
      if (!el) {
        window.setTimeout(initPlayer, 100);
        return;
      }
      playerRef.current = new window.YT.Player(iframeContainerId, {
        height: "100%", width: "100%",
        videoId: ALBUMS[0].tracksSideA[0].youtubeId,
        playerVars: { autoplay: 0, controls: 0, disablekb: 1, fs: 0, rel: 0, showinfo: 0, modestbranding: 1, origin: window.location.origin },
        events: {
          onReady: (event: any) => {
            if (isCancelled) return;
            const { volume, isMuted } = volMuteRef.current;
            event.target.setVolume(volume);
            if (isMuted) event.target.mute(); else event.target.unMute();
            
            // Do not cue video here. Keep UNSTARTED to avoid Safari frozen state.
          },
          onStateChange: (event: any) => {
            if (isCancelled) return;
            const state = event.data;
            let statusStr: PlayerStatus = "UNSTARTED";
            if (state === window.YT.PlayerState.PLAYING) statusStr = "PLAYING";
            else if (state === window.YT.PlayerState.PAUSED) statusStr = "PAUSED";
            else if (state === window.YT.PlayerState.BUFFERING) statusStr = "BUFFERING";
            else if (state === window.YT.PlayerState.ENDED) statusStr = "ENDED";
            else if (state === window.YT.PlayerState.CUED) statusStr = "CUED";
            
            setPlayerStatus(statusStr);
            if (state === window.YT.PlayerState.PLAYING) {
              setDuration(event.target.getDuration() || stateRef.current.currentTrack?.duration || 0);
            }
            if (state === window.YT.PlayerState.ENDED) {
              handleTrackEnd();
            }
          }
        }
      });
    };

    if (window.YT && window.YT.Player) initPlayer();
    else { window.onYouTubeIframeAPIReady = () => { if (!isCancelled) initPlayer(); }; }
    
    return () => { isCancelled = true; };
  }, []);

  // Sync track changes if done from next/prev/side change
  useEffect(() => {
    // Only react to currentTrack changes if player is ready
    if (playerRef.current && typeof playerRef.current.loadVideoById === "function") {
       if (currentTrack && activeMedia) {
         // If it was playing or just ended (auto-advance), load and play
         if (playerStatus === "PLAYING" || playerStatus === "ENDED" || playerStatus === "BUFFERING") {
           playerRef.current.loadVideoById({
             videoId: currentTrack.youtubeId,
             startSeconds: currentTrack.startTime
           });
           setPlayerStatus("BUFFERING");
         } else {
           // Otherwise (initial load or flipped side while paused), avoid cueing to prevent Safari freeze.
           // Just set to UNSTARTED so play() knows to load it when pressed.
           setPlayerStatus("UNSTARTED");
         }
       } else {
         playerRef.current.stopVideo();
         setPlayerStatus("UNSTARTED");
         setCurrentTime(0);
         setDuration(0);
       }
    }
  }, [currentTrack, activeMedia]);

  useEffect(() => {
    if (playerStatus === "PLAYING") {
      timeUpdateInterval.current = window.setInterval(() => {
        if (playerRef.current && typeof playerRef.current.getCurrentTime === "function") {
          setCurrentTime(playerRef.current.getCurrentTime());
        }
      }, 50);
    } else {
      if (timeUpdateInterval.current) { clearInterval(timeUpdateInterval.current); timeUpdateInterval.current = null; }
    }
    return () => { if (timeUpdateInterval.current) clearInterval(timeUpdateInterval.current); };
  }, [playerStatus]);

  const startMedia = (album: Album, media: "lp" | "cassette") => {
    setActiveAlbum(album);
    setActiveMedia(media);
    setCurrentSide("A");
    setCurrentTrackIndex(0);
    try { sessionStorage.setItem("activeAlbumId", String(album.id)); } catch(e) {}
    
    const firstTrack = album.tracksSideA[0];
    setCurrentTime(firstTrack.startTime);
    setPlayerStatus("UNSTARTED");
  };

  const selectAlbum = (album: Album | null) => {
    setActiveAlbum(album);
    try {
      if (album) sessionStorage.setItem("activeAlbumId", String(album.id));
      else sessionStorage.removeItem("activeAlbumId");
    } catch(e) {}
    setCurrentSide("A");
    setCurrentTrackIndex(0);
    setCurrentTime(0);
  };
  
  const selectMedia = (media: "lp" | "cassette" | null) => { setActiveMedia(media); };
  
  const play = () => { 
    if (playerRef.current) {
      if ((playerStatus === "UNSTARTED" || playerStatus === "CUED") && currentTrack) {
        // Load explicitly to bypass Safari frozen cue state
        playerRef.current.loadVideoById({
          videoId: currentTrack.youtubeId,
          startSeconds: currentTime || currentTrack.startTime
        });
        setPlayerStatus("BUFFERING");
      } else if (typeof playerRef.current.playVideo === "function") {
        playerRef.current.playVideo();
      }
    }
  };
  const pause = () => { if (playerRef.current && typeof playerRef.current.pauseVideo === "function") playerRef.current.pauseVideo(); };
  const stop = () => { if (playerRef.current && typeof playerRef.current.stopVideo === "function") { playerRef.current.stopVideo(); setPlayerStatus("UNSTARTED"); } };
  const togglePlay = () => { if (playerStatus === "PLAYING") pause(); else play(); };
  const seekTo = (seconds: number) => {
    if (playerRef.current && typeof playerRef.current.seekTo === "function") {
      const trackDuration = duration || currentTrack?.duration || 9999;
      const targetTime = Math.max(0, Math.min(seconds, trackDuration));
      const state = typeof playerRef.current.getPlayerState === "function" ? playerRef.current.getPlayerState() : -1;
      
      if (state !== -1 && state !== 5) { // Not UNSTARTED and Not CUED
        playerRef.current.seekTo(targetTime, true);
      }
      setCurrentTime(targetTime);
    }
  };
  const setSide = (side: "A" | "B") => {
    setCurrentSide(side); setCurrentTrackIndex(0);
    if (activeAlbum) { const newTracks = side === "A" ? activeAlbum.tracksSideA : activeAlbum.tracksSideB; setCurrentTime(newTracks[0]?.startTime || 0); }
    else setCurrentTime(0);
  };
  const setTrackIndex = (index: number) => {
    if (index >= 0 && index < tracks.length) { setCurrentTrackIndex(index); setCurrentTime(tracks[index].startTime); }
  };
  const toggleMute = () => {
    if (playerRef.current && typeof playerRef.current.mute === "function") {
      if (isMuted) { playerRef.current.unMute(); setIsMuted(false); }
      else { playerRef.current.mute(); setIsMuted(true); }
    } else { setIsMuted(!isMuted); }
  };
  const setVolume = (vol: number) => {
    const safeVol = Math.max(0, Math.min(vol, 100));
    setVolumeState(safeVol);
    if (playerRef.current && typeof playerRef.current.setVolume === "function") playerRef.current.setVolume(safeVol);
  };
  const resetPlayer = () => {
    setActiveAlbum(null); setActiveMedia(null); setCurrentSide("A"); setCurrentTrackIndex(0);
    setPlayerStatus("UNSTARTED"); setCurrentTime(0); setDuration(0);
    if (playerRef.current && typeof playerRef.current.stopVideo === "function") {
      playerRef.current.stopVideo();
    }
  };

  return (
    <YTPlayerContext.Provider
      value={{
        activeAlbum, activeMedia, currentSide, currentTrackIndex, currentTrack,
        playerStatus, currentTime, duration, isMuted, volume,
        selectAlbum, selectMedia, startMedia, play, pause, stop, togglePlay,
        seekTo, setSide, setTrackIndex, toggleMute, setVolume, resetPlayer,
        iframeContainerId
      }}
    >
      <div style={{ position: 'absolute', width: '200px', height: '200px', opacity: 0.01, pointerEvents: 'none', top: 0, left: 0, zIndex: -100 }}>
        <div id={iframeContainerId}></div>
      </div>
      {children}
    </YTPlayerContext.Provider>
  );
};
