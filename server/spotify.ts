import { Router } from 'express';
import type { Request, Response as ExpressResponse } from 'express';
import { randomBytes } from 'crypto';
import { catchAsyncErrors } from './asyncErrors';

type FetchResponse = Awaited<ReturnType<typeof fetch>>;

declare module 'express-session' {
  interface SessionData {
    spotify_access_token?: string;
    spotify_refresh_token?: string;
    spotify_token_expires?: number;
    spotify_oauth_state?: string;
  }
}

const router = Router();
catchAsyncErrors(router);

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || '';
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || '';
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI || 'http://localhost:5000/api/spotify/callback';

const SCOPES = [
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing',
  'streaming',
  'user-read-email',
  'user-read-private',
  'user-library-read',
  'user-library-modify',
  'playlist-read-private',
  'playlist-read-collaborative',
].join(' ');

// Helper: call Spotify API with auto token refresh
async function spotifyFetch(req: Request, path: string, options: RequestInit = {}): Promise<FetchResponse | null> {
  let token = req.session.spotify_access_token;
  const expires = req.session.spotify_token_expires || 0;

  // Refresh token if expired
  if (Date.now() > expires - 30_000 && req.session.spotify_refresh_token) {
    const refreshed = await refreshAccessToken(req.session.spotify_refresh_token);
    if (refreshed) {
      req.session.spotify_access_token = refreshed.access_token;
      req.session.spotify_token_expires = Date.now() + refreshed.expires_in * 1000;
      token = refreshed.access_token;
    }
  }

  if (!token) return null;

  return fetch(`https://api.spotify.com/v1${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  }) as unknown as Response;
}

async function refreshAccessToken(refreshToken: string) {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
  });

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!res.ok) return null;
  return res.json() as Promise<{ access_token: string; expires_in: number }>;
}

// --- AUTH ROUTES ---

// Step 1: Redirect user to Spotify login
router.get('/login', (req: Request, res: ExpressResponse) => {
  if (!CLIENT_ID) {
    return res.status(500).json({ error: 'SPOTIFY_CLIENT_ID not configured' });
  }
  // `state` anti-CSRF: impide que un tercero vincule su cuenta de Spotify a tu sesión
  const state = randomBytes(16).toString('hex');
  req.session.spotify_oauth_state = state;
  const params = new URLSearchParams({
    state,
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
    show_dialog: 'false',
  });
  res.redirect(`https://accounts.spotify.com/authorize?${params}`);
});

// Step 2: Spotify redirects back here with ?code=
router.get('/callback', async (req: Request, res: ExpressResponse) => {
  const { code, error, state } = req.query;
  const expectedState = req.session.spotify_oauth_state;
  delete req.session.spotify_oauth_state;

  if (error || !code || !expectedState || state !== expectedState) {
    return res.redirect('/?spotify=error');
  }

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code: code as string,
    redirect_uri: REDIRECT_URI,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
  });

  try {
    const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });

    if (!tokenRes.ok) {
      console.error('Spotify token exchange failed:', await tokenRes.text());
      return res.redirect('/?spotify=error');
    }

    const data = await tokenRes.json() as {
      access_token: string;
      refresh_token: string;
      expires_in: number;
    };

    req.session.spotify_access_token = data.access_token;
    req.session.spotify_refresh_token = data.refresh_token;
    req.session.spotify_token_expires = Date.now() + data.expires_in * 1000;

    await new Promise<void>((resolve, reject) => req.session.save(err => err ? reject(err) : resolve()));
    res.redirect('/?spotify=connected');
  } catch (err) {
    console.error('Spotify callback error:', err);
    res.redirect('/?spotify=error');
  }
});

// Disconnect / logout
router.post('/logout', (req: Request, res: ExpressResponse) => {
  delete req.session.spotify_access_token;
  delete req.session.spotify_refresh_token;
  delete req.session.spotify_token_expires;
  req.session.save(() => res.json({ ok: true }));
});

// --- STATUS / USER ---

router.get('/status', (req: Request, res: ExpressResponse) => {
  const connected = !!req.session.spotify_access_token;
  res.json({ connected });
});

// Return access token for Web Playback SDK (only when authenticated)
router.get('/token', async (req: Request, res: ExpressResponse) => {
  if (!req.session.spotify_access_token) return res.status(401).json({ error: 'Not authenticated' });

  // Auto-refresh if needed
  const expires = req.session.spotify_token_expires || 0;
  if (Date.now() > expires - 30_000 && req.session.spotify_refresh_token) {
    const refreshed = await refreshAccessToken(req.session.spotify_refresh_token);
    if (refreshed) {
      req.session.spotify_access_token = refreshed.access_token;
      req.session.spotify_token_expires = Date.now() + refreshed.expires_in * 1000;
      await new Promise<void>((resolve, reject) => req.session.save(err => err ? reject(err) : resolve()));
    }
  }

  res.json({ access_token: req.session.spotify_access_token });
});

router.get('/me', async (req: Request, res: ExpressResponse) => {
  const r = await spotifyFetch(req, '/me');
  if (!r) return res.status(401).json({ error: 'Not authenticated' });
  const data = await r.json();
  res.json(data);
});

// --- PLAYER STATE ---

router.get('/player/state', async (req: Request, res: ExpressResponse) => {
  const r = await spotifyFetch(req, '/me/player?additional_types=track');
  if (!r) return res.status(401).json({ error: 'Not authenticated' });
  if (r.status === 204) return res.json({ is_playing: false, item: null });
  if (!r.ok) return res.status(r.status).json({ error: 'Spotify error' });
  const data = await r.json();
  res.json(data);
});

// --- PLAYBACK CONTROLS ---

// Transfer playback to a specific device
router.put('/player/transfer', async (req: Request, res: ExpressResponse) => {
  const { device_id, play } = req.body;
  const r = await spotifyFetch(req, '/me/player', {
    method: 'PUT',
    body: JSON.stringify({ device_ids: [device_id], play: !!play }),
  });
  if (!r) return res.status(401).json({ error: 'Not authenticated' });
  res.json({ ok: r.ok || r.status === 204 });
});

router.post('/player/play', async (req: Request, res: ExpressResponse) => {
  const { device_id, context_uri, uris } = req.body || {};
  const url = device_id ? `/me/player/play?device_id=${device_id}` : '/me/player/play';

  // Build body: if context_uri or uris provided, use those; otherwise try empty resume
  const playBody: Record<string, any> = {};
  if (context_uri) playBody.context_uri = context_uri;
  if (uris) playBody.uris = uris;

  let r = await spotifyFetch(req, url, { method: 'PUT', body: JSON.stringify(playBody) });
  if (!r) return res.status(401).json({ error: 'Not authenticated' });

  // If resume failed (403 = no active context), try fetching recently played to start something
  if (r.status === 403 || r.status === 404) {
    const recentRes = await spotifyFetch(req, '/me/player/recently-played?limit=10');
    if (recentRes && recentRes.ok) {
      const recent = await recentRes.json() as { items: { track: { uri: string } }[] };
      const trackUris = recent.items?.map((i: { track: { uri: string } }) => i.track.uri).filter(Boolean);
      if (trackUris?.length) {
        r = await spotifyFetch(req, url, {
          method: 'PUT',
          body: JSON.stringify({ uris: trackUris }),
        });
        if (!r) return res.status(500).json({ error: 'Spotify retry failed' });
        return res.json({ ok: r.ok || r.status === 204, started_with: 'recently_played' });
      }
    }
  }

  res.json({ ok: r.ok || r.status === 204 });
});

router.post('/player/pause', async (req: Request, res: ExpressResponse) => {
  const r = await spotifyFetch(req, '/me/player/pause', { method: 'PUT' });
  if (!r) return res.status(401).json({ error: 'Not authenticated' });
  res.json({ ok: r.ok });
});

router.post('/player/next', async (req: Request, res: ExpressResponse) => {
  const r = await spotifyFetch(req, '/me/player/next', { method: 'POST' });
  if (!r) return res.status(401).json({ error: 'Not authenticated' });
  res.json({ ok: r.ok });
});

router.post('/player/prev', async (req: Request, res: ExpressResponse) => {
  const r = await spotifyFetch(req, '/me/player/previous', { method: 'POST' });
  if (!r) return res.status(401).json({ error: 'Not authenticated' });
  res.json({ ok: r.ok });
});

router.put('/player/volume', async (req: Request, res: ExpressResponse) => {
  const { volume_percent } = req.body;
  const val = Math.max(0, Math.min(100, Number(volume_percent)));
  const r = await spotifyFetch(req, `/me/player/volume?volume_percent=${val}`, { method: 'PUT' });
  if (!r) return res.status(401).json({ error: 'Not authenticated' });
  res.json({ ok: r.ok });
});

router.put('/player/seek', async (req: Request, res: ExpressResponse) => {
  const { position_ms } = req.body;
  const r = await spotifyFetch(req, `/me/player/seek?position_ms=${Math.max(0, Number(position_ms))}`, { method: 'PUT' });
  if (!r) return res.status(401).json({ error: 'Not authenticated' });
  res.json({ ok: r.ok });
});

router.put('/player/shuffle', async (req: Request, res: ExpressResponse) => {
  const { state } = req.body;
  const r = await spotifyFetch(req, `/me/player/shuffle?state=${!!state}`, { method: 'PUT' });
  if (!r) return res.status(401).json({ error: 'Not authenticated' });
  res.json({ ok: r.ok });
});

router.put('/player/repeat', async (req: Request, res: ExpressResponse) => {
  const { state } = req.body; // 'off' | 'track' | 'context'
  const r = await spotifyFetch(req, `/me/player/repeat?state=${state}`, { method: 'PUT' });
  if (!r) return res.status(401).json({ error: 'Not authenticated' });
  res.json({ ok: r.ok });
});

// --- LIBRARY ---

router.get('/player/saved', async (req: Request, res: ExpressResponse) => {
  const { ids } = req.query;
  const r = await spotifyFetch(req, `/me/tracks/contains?ids=${ids}`);
  if (!r) return res.status(401).json({ error: 'Not authenticated' });
  const data = await r.json();
  res.json(data);
});

router.put('/player/save', async (req: Request, res: ExpressResponse) => {
  const { id } = req.body;
  const r = await spotifyFetch(req, `/me/tracks?ids=${id}`, { method: 'PUT' });
  if (!r) return res.status(401).json({ error: 'Not authenticated' });
  res.json({ ok: r.ok });
});

router.delete('/player/save', async (req: Request, res: ExpressResponse) => {
  const { id } = req.body;
  const r = await spotifyFetch(req, `/me/tracks?ids=${id}`, { method: 'DELETE' });
  if (!r) return res.status(401).json({ error: 'Not authenticated' });
  res.json({ ok: r.ok });
});

export default router;
