import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import type { Album, Track } from "../data/albums";
import { ALBUMS } from "../data/albums";


// Extend Window interface for YouTube API
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
  play: () => void;
  pause: () => void;
  stop: () => void;
  togglePlay: () => void;
  seekTo: (seconds: number) => void;
  initPlayerNow: () => void;
  setSide: (side: "A" | "B") => void;
  setTrackIndex: (index: number) => void;
  toggleMute: () => void;
  setVolume: (vol: number) => void;
  resetPlayer: () => void;
  
  // Ref to hold the iframe mount point ID
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
  const iframeContainerId = "yt-hidden-player";
  
  const tracks = activeAlbum 
    ? (currentSide === "A" ? activeAlbum.tracksSideA : activeAlbum.tracksSideB)
    : [];
  const currentTrack = tracks[currentTrackIndex] || null;

  // 1. Load YouTube IFrame Player API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }
  }, []);

  // 2. Initialize player when activeTrack changes
  useEffect(() => {
    if (!currentTrack) {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {
          console.error(e);
        }
        playerRef.current = null;
        setPlayerStatus("UNSTARTED");
        setCurrentTime(0);
        setDuration(0);
      }
      return;
    }

    const initPlayer = () => {
      let containerId = iframeContainerId;
      let el = document.getElementById(containerId);

      // Check if div exists. If not, wait.
      if (!el) {
        setTimeout(initPlayer, 100);
        return;
      }

      // If player already exists
      if (playerRef.current) {
        if (el.tagName !== "IFRAME") {
          // It's still a DIV. Either it's initializing, or it's a dead reference.
          // If we already marked it as initializing, wait.
          if (el.hasAttribute('data-yt-init')) {
            setTimeout(initPlayer, 100);
            return;
          }
          // Dead reference, destroy it
          try {
            if (typeof playerRef.current.destroy === "function") {
              playerRef.current.destroy();
            }
          } catch (e) {
            console.error(e);
          }
          playerRef.current = null;
        } else {
          // It's an IFRAME, reuse it
          if (typeof playerRef.current.loadVideoById === "function") {
            playerRef.current.loadVideoById({
              videoId: currentTrack.youtubeId,
              startSeconds: currentTrack.startTime
            });
            setPlayerStatus("BUFFERING");
          }
          return;
        }
      }

      el.setAttribute('data-yt-init', 'true');

      // Create new player
      playerRef.current = new window.YT.Player(containerId, {
        height: "100%",
        width: "100%",
        videoId: currentTrack.youtubeId,
        playerVars: {
          autoplay: 1,
          controls: 0, // Hide native controls
          start: currentTrack.startTime,
          disablekb: 1,
          fs: 0,
          rel: 0,
          showinfo: 0,
          modestbranding: 1,
          iv_load_policy: 3,
          origin: window.location.origin
        },
        events: {
          onReady: (event: any) => {
            event.target.setVolume(volume);
            if (isMuted) {
              event.target.mute();
            } else {
              event.target.unMute();
            }
            setDuration(event.target.getDuration() || currentTrack.duration);
            event.target.playVideo();
          },
          onStateChange: (event: any) => {
            const state = event.data;
            let statusStr: PlayerStatus = "UNSTARTED";
            
            if (state === window.YT.PlayerState.PLAYING) statusStr = "PLAYING";
            else if (state === window.YT.PlayerState.PAUSED) statusStr = "PAUSED";
            else if (state === window.YT.PlayerState.BUFFERING) statusStr = "BUFFERING";
            else if (state === window.YT.PlayerState.ENDED) statusStr = "ENDED";
            else if (state === window.YT.PlayerState.CUED) statusStr = "CUED";

            setPlayerStatus(statusStr);

            if (state === window.YT.PlayerState.PLAYING) {
              setDuration(event.target.getDuration() || currentTrack.duration);
            }

            // Auto-reverse / Auto-advance logic
            if (state === window.YT.PlayerState.ENDED) {
              handleTrackEnd();
            }
          }
        }
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = () => {
        initPlayer();
      };
    }
  }, [currentTrack]);

  const initPlayerNow = () => {
    if (!currentTrack) return;
    const containerId = iframeContainerId;
    const el = document.getElementById(containerId);
    if (!el) return;

    if (playerRef.current) {
      if (typeof playerRef.current.getPlayerState === "function") {
        if (typeof playerRef.current.loadVideoById === "function") {
          playerRef.current.loadVideoById({
            videoId: currentTrack.youtubeId,
            startSeconds: currentTrack.startTime
          });
          setPlayerStatus("BUFFERING");
        }
        return;
      }
    }

    if (el.getAttribute('data-yt-init') === 'true') return;
    el.setAttribute('data-yt-init', 'true');

    playerRef.current = new window.YT.Player(containerId, {
      height: "100%",
      width: "100%",
      videoId: currentTrack.youtubeId,
      playerVars: {
        autoplay: 1,
        controls: 0,
        start: currentTrack.startTime,
        disablekb: 1,
        fs: 0,
        rel: 0,
        showinfo: 0,
        modestbranding: 1,
        iv_load_policy: 3,
        origin: window.location.origin
      },
      events: {
        onReady: (event: any) => {
          event.target.setVolume(volume);
          if (isMuted) {
            event.target.mute();
          } else {
            event.target.unMute();
          }
          setDuration(event.target.getDuration() || currentTrack.duration);
          event.target.playVideo();
        },
        onStateChange: (event: any) => {
          const state = event.data;
          let statusStr: PlayerStatus = "UNSTARTED";
          if (state === window.YT.PlayerState.PLAYING) statusStr = "PLAYING";
          else if (state === window.YT.PlayerState.PAUSED) statusStr = "PAUSED";
          else if (state === window.YT.PlayerState.BUFFERING) statusStr = "BUFFERING";
          else if (state === window.YT.PlayerState.ENDED) statusStr = "ENDED";
          else if (state === window.YT.PlayerState.CUED) statusStr = "CUED";
          setPlayerStatus(statusStr);
          if (state === window.YT.PlayerState.PLAYING) {
            setDuration(event.target.getDuration() || currentTrack.duration);
          }
          if (state === window.YT.PlayerState.ENDED) {
            handleTrackEnd();
          }
        }
      }
    });
  };

  // 3. Time polling interval
  useEffect(() => {
    if (playerStatus === "PLAYING") {
      // High frequency updates (50ms) for extremely smooth vinyl and cassette reel animations
      timeUpdateInterval.current = window.setInterval(() => {
        if (playerRef.current && typeof playerRef.current.getCurrentTime === "function") {
          setCurrentTime(playerRef.current.getCurrentTime());
        }
      }, 50);
    } else {
      if (timeUpdateInterval.current) {
        clearInterval(timeUpdateInterval.current);
        timeUpdateInterval.current = null;
      }
    }

    return () => {
      if (timeUpdateInterval.current) {
        clearInterval(timeUpdateInterval.current);
      }
    };
  }, [playerStatus]);

  // Handle video ended (Advance track or Auto-reverse Side)
  const handleTrackEnd = () => {
    if (!activeAlbum) return;

    const nextIndex = currentTrackIndex + 1;
    if (nextIndex < tracks.length) {
      setCurrentTrackIndex(nextIndex);
    } else {
      // Side finished! Trigger Auto-Reverse
      if (currentSide === "A") {
        setTimeout(() => {
          setCurrentSide("B");
          setCurrentTrackIndex(0);
        }, 1500); // 1.5s delay to simulate reverse mechanical sound/gap
      } else {
        setTimeout(() => {
          setCurrentSide("A");
          setCurrentTrackIndex(0);
        }, 1500);
      }
    }
  };

  const selectAlbum = (album: Album | null) => {
    setActiveAlbum(album);
    try {
      if (album) {
        sessionStorage.setItem("activeAlbumId", String(album.id));
      } else {
        sessionStorage.removeItem("activeAlbumId");
      }
    } catch(e) {}
    setCurrentSide("A");
    setCurrentTrackIndex(0);
    setCurrentTime(0);
  };

  const selectMedia = (media: "lp" | "cassette" | null) => {
    setActiveMedia(media);
  };

  const play = () => {
    if (playerRef.current && typeof playerRef.current.playVideo === "function") {
      playerRef.current.playVideo();
    }
  };

  const pause = () => {
    if (playerRef.current && typeof playerRef.current.pauseVideo === "function") {
      playerRef.current.pauseVideo();
    }
  };

  const stop = () => {
    if (playerRef.current && typeof playerRef.current.stopVideo === "function") {
      playerRef.current.stopVideo();
      setPlayerStatus("UNSTARTED");
    }
  };

  const togglePlay = () => {
    if (playerStatus === "PLAYING") {
      pause();
    } else {
      play();
    }
  };

  const seekTo = (seconds: number) => {
    if (playerRef.current && typeof playerRef.current.seekTo === "function") {
      const targetTime = Math.max(0, Math.min(seconds, duration));
      playerRef.current.seekTo(targetTime, true);
      setCurrentTime(targetTime);
    }
  };

  const setSide = (side: "A" | "B") => {
    setCurrentSide(side);
    setCurrentTrackIndex(0);
    if (activeAlbum) {
      const newTracks = side === "A" ? activeAlbum.tracksSideA : activeAlbum.tracksSideB;
      setCurrentTime(newTracks[0]?.startTime || 0);
    } else {
      setCurrentTime(0);
    }
  };

  const setTrackIndex = (index: number) => {
    if (index >= 0 && index < tracks.length) {
      setCurrentTrackIndex(index);
      setCurrentTime(tracks[index].startTime);
    }
  };

  const toggleMute = () => {
    if (playerRef.current && typeof playerRef.current.mute === "function") {
      if (isMuted) {
        playerRef.current.unMute();
        setIsMuted(false);
      } else {
        playerRef.current.mute();
        setIsMuted(true);
      }
    } else {
      setIsMuted(!isMuted);
    }
  };

  const setVolume = (vol: number) => {
    const safeVol = Math.max(0, Math.min(vol, 100));
    setVolumeState(safeVol);
    if (playerRef.current && typeof playerRef.current.setVolume === "function") {
      playerRef.current.setVolume(safeVol);
    }
  };


  const resetPlayer = () => {
    setActiveAlbum(null);
    setActiveMedia(null);
    setCurrentSide("A");
    setCurrentTrackIndex(0);
    setPlayerStatus("UNSTARTED");
    setCurrentTime(0);
    setDuration(0);
    if (playerRef.current) {
      try {
        playerRef.current.destroy();
      } catch (e) {
        console.error(e);
      }
      playerRef.current = null;
    }
  };

  return (
    <YTPlayerContext.Provider
      value={{
        activeAlbum,
        activeMedia,
        currentSide,
        currentTrackIndex,
        currentTrack,
        playerStatus,
        currentTime,
        duration,
        isMuted,
        volume,
        selectAlbum,
        selectMedia,
        play,
        pause,
        stop,
        togglePlay,
        seekTo,
        setSide,
        setTrackIndex,
        toggleMute,
        setVolume,
        resetPlayer,
        initPlayerNow,
        iframeContainerId
      }}
    >
      {children}
    </YTPlayerContext.Provider>
  );
};
