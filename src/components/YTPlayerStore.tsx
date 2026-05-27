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
  const preventAutoPlayRef = useRef<boolean>(false);
  const currentTimeRef = useRef<number>(0);
  const currentSideRef = useRef<"A" | "B">("A");
  const iframeContainerId = "yt-global-player";
  
  const tracks = activeAlbum ? (currentSide === "A" ? activeAlbum.tracksSideA : activeAlbum.tracksSideB) : [];
  const currentTrack = tracks[currentTrackIndex] || null;

  // Refs for callbacks
  const stateRef = useRef({ activeAlbum, activeMedia, currentSide, currentTrackIndex, tracks, currentTrack });
  useEffect(() => {
    stateRef.current = { activeAlbum, activeMedia, currentSide, currentTrackIndex, tracks, currentTrack };
  }, [activeAlbum, activeMedia, currentSide, currentTrackIndex, tracks, currentTrack]);

  const volMuteRef = useRef({ volume, isMuted });
  useEffect(() => {
    volMuteRef.current = { volume, isMuted };
  }, [volume, isMuted]);

  useEffect(() => { currentTimeRef.current = currentTime; }, [currentTime]);
  useEffect(() => { currentSideRef.current = currentSide; }, [currentSide]);

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
    const { activeAlbum, currentTrackIndex, tracks } = stateRef.current;
    if (!activeAlbum) return;

    const nextIndex = currentTrackIndex + 1;
    if (nextIndex < tracks.length) {
      setCurrentTrackIndex(nextIndex);
    } else {
      // Reached the end of the side. Stop playback before flipping so it doesn't auto-play.
      preventAutoPlayRef.current = true;
      setPlayerStatus("UNSTARTED");
      if (playerRef.current && typeof playerRef.current.stopVideo === "function") {
         playerRef.current.stopVideo();
      }
      // Return to the beginning of the current side ONLY for LP. Cassettes stay at the end.
      if (stateRef.current.activeMedia === "lp") {
        setTimeout(() => { 
          setCurrentTrackIndex(0);
          setCurrentTime(tracks[0].startTime);
        }, 1500);
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
         if (!preventAutoPlayRef.current && (playerStatus === "PLAYING" || playerStatus === "ENDED" || playerStatus === "BUFFERING")) {
           const currentVid = typeof playerRef.current.getVideoData === 'function' ? playerRef.current.getVideoData().video_id : null;
           const currentT = typeof playerRef.current.getCurrentTime === 'function' ? playerRef.current.getCurrentTime() : 0;
           const isWithinTrack = currentT >= currentTrack.startTime - 1 && currentT <= currentTrack.startTime + currentTrack.duration;
           
           if (currentVid === currentTrack.youtubeId && isWithinTrack && playerStatus === "PLAYING") {
               // Natural play-through within the same video. Do not reload to prevent stutter.
           } else {
               if (currentVid === currentTrack.youtubeId) {
                   playerRef.current.seekTo(currentTrack.startTime, true);
                   if (playerStatus === "PLAYING") playerRef.current.playVideo();
               } else {
                   playerRef.current.loadVideoById({
                     videoId: currentTrack.youtubeId,
                     startSeconds: currentTrack.startTime
                   });
               }
               setPlayerStatus("BUFFERING");
           }
         } else {
           // Otherwise (initial load or flipped side while paused), avoid cueing to prevent Safari freeze.
           // Just set to UNSTARTED so play() knows to load it when pressed.
           preventAutoPlayRef.current = false;
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
          const newTime = playerRef.current.getCurrentTime();
          setCurrentTime(newTime);
          
          // Handle track crossing and side ending
          const { tracks, currentTrackIndex } = stateRef.current;
          if (tracks && tracks.length > 0) {
              const lastTrack = tracks[tracks.length - 1];
              const sideEndTime = lastTrack.startTime + lastTrack.duration;
              
              if (newTime >= sideEndTime - 0.2) {
                  if (!preventAutoPlayRef.current) {
                      handleTrackEnd();
                  }
              } else {
                  let correctIndex = currentTrackIndex;
                  for (let i = 0; i < tracks.length; i++) {
                      if (newTime >= tracks[i].startTime && newTime < tracks[i].startTime + tracks[i].duration) {
                          correctIndex = i;
                          break;
                      }
                  }
                  if (correctIndex !== currentTrackIndex) {
                      setCurrentTrackIndex(correctIndex);
                  }
              }
          }
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
    if (!playerRef.current || !currentTrack) return;
    const ytState = typeof playerRef.current.getPlayerState === "function"
      ? playerRef.current.getPlayerState()
      : -1;
    const currentVid = typeof playerRef.current.getVideoData === "function"
      ? playerRef.current.getVideoData()?.video_id
      : null;
      
    // getVideoData() might return null/empty when the player is paused for a while.
    // If it returns a string, we check if it matches. If it's falsy, we assume it matches
    // because we haven't actively loaded a different video yet.
    const isCorrectVideo = currentVid === currentTrack.youtubeId || !currentVid;
    const expectedTime = currentTimeRef.current || currentTrack.startTime;

    if (ytState !== -1 && isCorrectVideo) {
      const playerTime = typeof playerRef.current.getCurrentTime === "function"
        ? playerRef.current.getCurrentTime()
        : null;
      if (playerTime !== null && Math.abs(playerTime - expectedTime) > 2) {
        playerRef.current.seekTo(expectedTime, true);
      }
      playerRef.current.playVideo();
    } else {
      playerRef.current.loadVideoById({
        videoId: currentTrack.youtubeId,
        startSeconds: expectedTime
      });
    }
    setPlayerStatus("BUFFERING");
  };
  const pause = () => { if (playerRef.current && typeof playerRef.current.pauseVideo === "function") playerRef.current.pauseVideo(); };
  const stop = () => { if (playerRef.current && typeof playerRef.current.stopVideo === "function") { playerRef.current.stopVideo(); setPlayerStatus("UNSTARTED"); } };
  const togglePlay = () => { if (playerStatus === "PLAYING") pause(); else play(); };
  const seekTo = (seconds: number) => {
    if (playerRef.current && typeof playerRef.current.seekTo === "function") {
      const maxDuration = duration || 999999; // Do not cap by single track duration because time is absolute
      const targetTime = Math.max(0, Math.min(seconds, maxDuration));
      const state = typeof playerRef.current.getPlayerState === "function" ? playerRef.current.getPlayerState() : -1;
      
      if (state !== -1 && state !== 5) { // Not UNSTARTED and Not CUED
        playerRef.current.seekTo(targetTime, true);
      }
      setCurrentTime(targetTime);
    }
  };
  const setSide = (side: "A" | "B") => {
    if (activeMedia === "cassette" && activeAlbum) {
      // Simulate physical tape flipping
      const sideA = activeAlbum.tracksSideA;
      const sideB = activeAlbum.tracksSideB;
      
      const startA = sideA[0].startTime;
      const endA = sideA[sideA.length - 1].startTime + sideA[sideA.length - 1].duration;
      const durA = endA - startA;
      
      const startB = sideB[0].startTime;
      const endB = sideB[sideB.length - 1].startTime + sideB[sideB.length - 1].duration;
      const durB = endB - startB;
      
      const physicalSideLength = Math.max(durA, durB);
      
      const oldStart = currentSideRef.current === "A" ? startA : startB;
      const oldElapsed = Math.max(0, Math.min(currentTimeRef.current - oldStart, physicalSideLength));
      
      const newElapsed = physicalSideLength - oldElapsed;
      const newStart = side === "A" ? startA : startB;
      let newTime = newStart + newElapsed;
      
      const newTracks = side === "A" ? sideA : sideB;
      const newEnd = newTracks[newTracks.length - 1].startTime + newTracks[newTracks.length - 1].duration;
      
      if (newTime > newEnd) {
          newTime = newEnd;
      }
      
      let newIndex = newTracks.length - 1;
      for (let i = 0; i < newTracks.length; i++) {
          if (newTime >= newTracks[i].startTime && newTime < newTracks[i].startTime + newTracks[i].duration) {
              newIndex = i;
              break;
          }
      }
      
      setCurrentSide(side);
      setCurrentTrackIndex(newIndex);
      setCurrentTime(newTime);
      currentTimeRef.current = newTime;
      currentSideRef.current = side;

      // useEffect([currentTrack])가 BUFFERING 상태를 보고 currentTrack.startTime으로
      // 재seek하지 못하도록 차단한 뒤, YT 플레이어를 직접 mirror 위치로 이동
      preventAutoPlayRef.current = true;
      if (playerRef.current && typeof playerRef.current.seekTo === "function") {
        const ytState = typeof playerRef.current.getPlayerState === "function"
          ? playerRef.current.getPlayerState()
          : -1;
        if (ytState !== -1 && ytState !== 5) {
          playerRef.current.seekTo(newTime, true);
        }
      }
    } else {
      // LP resets to start
      setCurrentSide(side); setCurrentTrackIndex(0);
      if (activeAlbum) { const newTracks = side === "A" ? activeAlbum.tracksSideA : activeAlbum.tracksSideB; setCurrentTime(newTracks[0]?.startTime || 0); }
      else setCurrentTime(0);
    }
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
      <div style={{ position: 'absolute', width: '200px', height: '200px', opacity: 1, pointerEvents: 'none', top: 0, left: 0, zIndex: -100 }}>
        <div id={iframeContainerId}></div>
      </div>
      {children}
    </YTPlayerContext.Provider>
  );
};
