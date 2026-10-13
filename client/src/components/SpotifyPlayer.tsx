import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Shuffle, Repeat, Repeat1, Heart, ChevronDown, LogOut, ExternalLink, Music2
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

/* ─── Spotify SDK global type ─── */
declare global {
  interface Window {
    Spotify: {
      Player: new (options: {
        name: string;
        getOAuthToken: (cb: (token: string) => void) => void;
        volume?: number;
      }) => SpotifySDKPlayer;
    };
    onSpotifyWebPlaybackSDKReady: () => void;
  }
}

interface SpotifySDKPlayer {
  connect: () => Promise<boolean>;
  disconnect: () => void;
  addListener: (event: string, cb: (data: any) => void) => void;
  removeListener: (event: string) => void;
  getCurrentState: () => Promise<any>;
  setVolume: (vol: number) => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  previousTrack: () => Promise<void>;
  nextTrack: () => Promise<void>;
  seek: (pos: number) => Promise<void>;
}

/* ─── Types ─── */
interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { name: string; images: { url: string }[] };
  duration_ms: number;
  external_urls: { spotify: string };
}

interface PlayerState {
  is_playing: boolean;
  progress_ms: number;
  item: SpotifyTrack | null;
  shuffle_state: boolean;
  repeat_state: 'off' | 'track' | 'context';
  device?: { volume_percent: number };
}

/* ─── Helpers ─── */
function formatMs(ms: number) {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

async function api(path: string, method = 'GET', body?: object) {
  const res = await fetch(`/api/spotify${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });
  if (res.status === 204 || res.headers.get('content-length') === '0') return null;
  return res.json().catch(() => null);
}

/* ─── Spotify SVG ─── */
function SpotifyIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════ */
export function SpotifyPlayer() {
  const { isAuthenticated } = useAuth();

  const [connected, setConnected] = useState(false);
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<PlayerState | null>(null);
  const [volume, setVolume] = useState(50);
  const [muted, setMuted] = useState(false);
  const [liked, setLiked] = useState(false);
  const [localProgress, setLocalProgress] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);
  const [deviceId, setDeviceId] = useState<string | null>(null);

  const sdkPlayerRef = useRef<SpotifySDKPlayer | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tokenRef = useRef<string>('');

  /* ── Fetch current state from API ── */
  const fetchState = useCallback(async () => {
    const data = await api('/player/state');
    if (!data) return;
    setState(data);
    if (data.device?.volume_percent !== undefined) setVolume(data.device.volume_percent);
    setLocalProgress(data.progress_ms || 0);
    if (data.item?.id) {
      const saved = await api(`/player/saved?ids=${data.item.id}`);
      if (Array.isArray(saved)) setLiked(saved[0]);
    }
  }, []);

  /* ── Load Spotify Web Playback SDK ── */
  const loadSDK = useCallback(async () => {
    const tokenData = await api('/token');
    if (!tokenData?.access_token) return;
    tokenRef.current = tokenData.access_token;

    if (window.Spotify) {
      initSDKPlayer(tokenData.access_token);
      return;
    }

    // Inject SDK script only once
    if (!document.getElementById('spotify-sdk-script')) {
      const script = document.createElement('script');
      script.id = 'spotify-sdk-script';
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.async = true;
      document.head.appendChild(script);
    }

    window.onSpotifyWebPlaybackSDKReady = () => {
      initSDKPlayer(tokenRef.current);
    };
  }, []);

  const initSDKPlayer = (_initialToken: string) => {
    const player = new window.Spotify.Player({
      name: 'Mi Portfolio 🎵',
      getOAuthToken: async (cb) => {
        // Always fetch a fresh token from the server (auto-refreshes if expired)
        const data = await api('/token');
        cb(data?.access_token || '');
      },
      volume: 0.5,
    });

    player.addListener('ready', ({ device_id }: { device_id: string }) => {
      setDeviceId(device_id);
      setSdkReady(true);
      // Transfer playback silently (don't auto-play)
      api('/player/transfer', 'PUT', { device_id, play: false });
    });

    player.addListener('not_ready', () => {
      setSdkReady(false);
      setDeviceId(null);
    });

    player.addListener('initialization_error', ({ message }: { message: string }) => {
      console.error('Spotify SDK init error:', message);
      setSdkReady(false);
    });

    player.addListener('authentication_error', ({ message }: { message: string }) => {
      console.error('Spotify SDK auth error:', message);
      setSdkReady(false);
    });

    player.addListener('account_error', ({ message }: { message: string }) => {
      console.error('Spotify SDK account error (Premium required):', message);
      setSdkReady(false);
    });

    player.addListener('player_state_changed', (sdkState: any) => {
      if (!sdkState) return;
      const track = sdkState.track_window?.current_track;
      if (!track) return;
      setState({
        is_playing: !sdkState.paused,
        progress_ms: sdkState.position,
        shuffle_state: sdkState.shuffle,
        repeat_state: sdkState.repeat_mode === 0 ? 'off' : sdkState.repeat_mode === 1 ? 'context' : 'track',
        item: {
          id: track.id,
          name: track.name,
          artists: track.artists,
          album: { name: track.album.name, images: track.album.images },
          duration_ms: track.duration_ms,
          external_urls: { spotify: `https://open.spotify.com/track/${track.id}` },
        },
        device: { volume_percent: volume },
      });
      setLocalProgress(sdkState.position);
    });

    player.connect();
    sdkPlayerRef.current = player;
  };

  /* ── Init on connect ── */
  useEffect(() => {
    if (!isAuthenticated) return;
    api('/status').then(d => {
      if (d?.connected) {
        setConnected(true);
        fetchState();
        loadSDK();
      }
    });
    const params = new URLSearchParams(window.location.search);
    if (params.get('spotify') === 'connected') {
      setConnected(true);
      setOpen(true);
      window.history.replaceState({}, '', window.location.pathname);
      setTimeout(() => { fetchState(); loadSDK(); }, 500);
    }
  }, [isAuthenticated, fetchState, loadSDK]);

  /* ── Poll API (fallback for non-SDK devices) ── */
  useEffect(() => {
    if (!connected || sdkReady) return; // SDK handles updates when ready
    fetchState();
    pollRef.current = setInterval(fetchState, 4000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [connected, sdkReady, fetchState]);

  /* ── Progress ticker ── */
  useEffect(() => {
    if (progressRef.current) clearInterval(progressRef.current);
    if (!state?.is_playing || seeking) return;
    progressRef.current = setInterval(() => setLocalProgress(p => p + 1000), 1000);
    return () => { if (progressRef.current) clearInterval(progressRef.current); };
  }, [state?.is_playing, state?.item?.id, seeking]);

  /* ── Cleanup SDK on unmount ── */
  useEffect(() => {
    return () => { sdkPlayerRef.current?.disconnect(); };
  }, []);


  const track = state?.item;
  const duration = track?.duration_ms || 1;
  const progress = Math.min(localProgress, duration);
  const progressPct = (progress / duration) * 100;
  const albumArt = track?.album.images[0]?.url;

  const nextRepeat = (): 'off' | 'context' | 'track' => {
    const cycle: ('off' | 'context' | 'track')[] = ['off', 'context', 'track'];
    return cycle[(cycle.indexOf(state?.repeat_state || 'off') + 1) % 3];
  };

  /* ── Play/Pause handler: uses SDK if available ── */
  const handlePlayPause = async () => {
    const playing = state?.is_playing;

    if (sdkPlayerRef.current && sdkReady && deviceId) {
      if (playing) {
        // Pause via SDK
        await sdkPlayerRef.current.pause();
        setState(s => s ? { ...s, is_playing: false } : s);
      } else if (track) {
        // Resume current track via SDK
        await sdkPlayerRef.current.resume();
        setState(s => s ? { ...s, is_playing: true } : s);
      } else {
        // Nothing playing — transfer to SDK device and start liked songs
        await api('/player/transfer', 'PUT', { device_id: deviceId, play: false });
        // Small delay so Spotify registers the device
        await new Promise(r => setTimeout(r, 500));
        await api('/player/play', 'POST', { device_id: deviceId });
        setState(s => s ? { ...s, is_playing: true } : s);
        setTimeout(fetchState, 1500);
      }
    } else {
      // Fallback: use API directly
      setState(s => s ? { ...s, is_playing: !playing } : s);
      await api(playing ? '/player/pause' : '/player/play', 'POST', deviceId ? { device_id: deviceId } : undefined);
      setTimeout(fetchState, 800);
    }
  };

  const handleNext = async () => {
    if (sdkPlayerRef.current && sdkReady) {
      await sdkPlayerRef.current.nextTrack();
    } else {
      await api('/player/next', 'POST');
      setTimeout(fetchState, 500);
    }
  };

  const handlePrev = async () => {
    if (sdkPlayerRef.current && sdkReady) {
      await sdkPlayerRef.current.previousTrack();
    } else {
      await api('/player/prev', 'POST');
      setTimeout(fetchState, 500);
    }
  };

  const handleSeek = async (ms: number) => {
    setLocalProgress(ms);
    if (sdkPlayerRef.current && sdkReady) {
      await sdkPlayerRef.current.seek(ms);
    } else {
      await api('/player/seek', 'PUT', { position_ms: ms });
    }
  };

  const handleVolume = async (val: number) => {
    setVolume(val);
    setMuted(val === 0);
    if (sdkPlayerRef.current && sdkReady) {
      await sdkPlayerRef.current.setVolume(val / 100);
    } else {
      await api('/player/volume', 'PUT', { volume_percent: val });
    }
  };

  /* ── Global Hotkeys ── */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Solo actuar si Alt está presionado y no estamos escribiendo en un input
      if (!e.altKey) return;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) return;

      switch (e.key) {
        case 'p':
        case 'P':
          e.preventDefault();
          handlePlayPause();
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleNext();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handlePrev();
          break;
        case 'ArrowUp':
          e.preventDefault();
          handleVolume(Math.min(volume + 10, 100));
          break;
        case 'ArrowDown':
          e.preventDefault();
          handleVolume(Math.max(volume - 10, 0));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePlayPause, handleNext, handlePrev, handleVolume, volume]);

  /* ──────────────────────────────────────────────── */
  if (!isAuthenticated) return null;

  return (
    <>
      {/* ── Header Button (no green dot) ── */}
      <button
        id="spotify-header-btn"
        onClick={() => {
          if (!connected) {
            window.location.href = '/api/spotify/login';
          } else {
            setOpen(o => !o);
          }
        }}
        className={`relative flex items-center justify-center w-9 h-9 rounded-full transition-all duration-300
          ${connected
            ? 'text-[#1DB954] hover:bg-[#1DB954]/10'
            : 'text-muted-foreground hover:text-foreground hover:bg-accent'
          }`}
        title={connected ? 'Reproductor Spotify' : 'Conectar Spotify'}
      >
        <SpotifyIcon className="w-5 h-5" />
      </button>

      {/* ── Popup via Portal (escapes header's backdrop-filter context) ── */}
      {createPortal(
      <AnimatePresence>
        {open && connected && (
          <motion.div
            key="spotify-popup"
            initial={{ opacity: 0, scale: 0.8, y: 20, originX: 1, originY: 1 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 40, x: 40, originX: 1, originY: 1 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed bottom-4 left-4 z-[300] w-80 rounded-2xl shadow-2xl
                       bg-card/95 backdrop-blur-xl border border-border overflow-hidden"
          >
            {/* ── Album Art ── */}
            <div className="relative h-44 overflow-hidden">
              {albumArt ? (
                <motion.img
                  key={albumArt}
                  src={albumArt}
                  alt="Album"
                  className="w-full h-full object-cover"
                  initial={{ opacity: 0, scale: 1.06 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-muted to-muted/30 flex items-center justify-center">
                  <Music2 className="w-14 h-14 text-muted-foreground/30" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />

              {/* Close → animates toward header */}
              <motion.button
                onClick={() => setOpen(false)}
                whileTap={{ scale: 0.85 }}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm
                           flex items-center justify-center text-white/80 hover:text-white transition-colors"
              >
                <ChevronDown className="w-4 h-4" />
              </motion.button>

              {/* Spotify badge */}
              <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full">
                <SpotifyIcon className="w-3 h-3 text-[#1DB954]" />
                <span className="text-[10px] text-white/80 font-semibold tracking-wide">
                  {sdkReady ? 'En vivo' : 'Spotify'}
                </span>
              </div>

              {/* Track info */}
              <div className="absolute bottom-0 left-0 right-0 px-4 pb-3">
                {track ? (
                  <>
                    <a href={track.external_urls.spotify} target="_blank" rel="noreferrer"
                       className="text-sm font-bold text-white truncate block hover:underline leading-tight">
                      {track.name}
                    </a>
                    <p className="text-xs text-white/65 truncate mt-0.5">
                      {track.artists.map(a => a.name).join(', ')}
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-white/50 italic">
                    {sdkReady ? 'Presiona play para empezar' : 'Nada reproduciendo'}
                  </p>
                )}
              </div>
            </div>

            {/* ── Progress ── */}
            <div className="px-4 pt-3 pb-1">
              <div
                className="relative h-1.5 bg-muted rounded-full overflow-hidden cursor-pointer group"
                onClick={(e) => {
                  if (!track) return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pos = Math.floor(((e.clientX - rect.left) / rect.width) * duration);
                  setSeeking(true);
                  handleSeek(pos).finally(() => setSeeking(false));
                }}
              >
                <div className="h-full bg-[#1DB954] rounded-full transition-all" style={{ width: `${progressPct}%` }} />
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                <span>{formatMs(progress)}</span>
                <span>{formatMs(duration)}</span>
              </div>
            </div>

            {/* ── Controls ── */}
            <div className="flex items-center justify-between px-5 py-2">
              <button
                onClick={async () => {
                  const next = !state?.shuffle_state;
                  setState(s => s ? { ...s, shuffle_state: next } : s);
                  await api('/player/shuffle', 'PUT', { state: next });
                }}
                className={`p-1.5 rounded-full transition-colors ${state?.shuffle_state ? 'text-[#1DB954]' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <Shuffle className="w-4 h-4" />
              </button>

              <button onClick={handlePrev} className="p-1.5 text-foreground hover:text-[#1DB954] transition-colors">
                <SkipBack className="w-5 h-5 fill-current" />
              </button>

              <motion.button
                whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                onClick={handlePlayPause}
                className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg"
              >
                {state?.is_playing
                  ? <Pause className="w-5 h-5 fill-black text-black" />
                  : <Play className="w-5 h-5 fill-black text-black ml-0.5" />
                }
              </motion.button>

              <button onClick={handleNext} className="p-1.5 text-foreground hover:text-[#1DB954] transition-colors">
                <SkipForward className="w-5 h-5 fill-current" />
              </button>

              <button
                onClick={async () => {
                  const next = nextRepeat();
                  setState(s => s ? { ...s, repeat_state: next } : s);
                  await api('/player/repeat', 'PUT', { state: next });
                }}
                className={`p-1.5 rounded-full transition-colors ${state?.repeat_state !== 'off' ? 'text-[#1DB954]' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {state?.repeat_state === 'track' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
              </button>
            </div>

            {/* ── Volume ── */}
            <div className="flex items-center gap-2 px-5 pb-3">
              <button
                onClick={() => handleVolume(muted ? volume : 0)}
                className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
              >
                {muted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range" min={0} max={100} value={muted ? 0 : volume}
                className="flex-1 h-1 accent-[#1DB954] cursor-pointer"
                onChange={e => handleVolume(Number(e.target.value))}
              />
              <span className="text-[10px] text-muted-foreground w-7 text-right shrink-0">{muted ? 0 : volume}%</span>
            </div>

            {/* ── Footer ── */}
            <div className="flex items-center gap-2 px-4 pb-4 border-t border-border pt-3">
              {track && (
                <>
                  <button
                    onClick={async () => {
                      const next = !liked;
                      setLiked(next);
                      await api('/player/save', next ? 'PUT' : 'DELETE', { id: track.id });
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors
                      ${liked ? 'bg-[#1DB954]/10 border-[#1DB954] text-[#1DB954]' : 'border-border text-muted-foreground hover:text-foreground'}`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-current' : ''}`} />
                    {liked ? 'Guardada' : 'Guardar'}
                  </button>
                  <a href={track.external_urls.spotify} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-border text-muted-foreground hover:text-foreground transition-colors">
                    <ExternalLink className="w-3.5 h-3.5" /> Abrir
                  </a>
                </>
              )}
              <button
                onClick={async () => {
                  if (!window.confirm('¿Desconectar tu cuenta de Spotify? Tendrás que volver a vincularla.')) return;
                  sdkPlayerRef.current?.disconnect();
                  await api('/logout', 'POST');
                  setConnected(false); setState(null); setOpen(false); setSdkReady(false); setDeviceId(null);
                }}
                className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border border-border text-muted-foreground hover:text-destructive hover:border-destructive transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" /> Desconectar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      , document.body)}
    </>
  );
}
