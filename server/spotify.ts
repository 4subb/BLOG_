import { Router } from 'express';
import type { Request, Response as ExpressResponse } from 'express';
import { randomBytes } from 'crypto';
import { catchAsyncErrors } from './asyncErrors';
import { storage } from './storage';
import { encryptSecret, decryptSecret } from './crypto';

type FetchResponse = Awaited<ReturnType<typeof fetch>>;

declare module 'express-session' {
  interface SessionData {
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

// ── Tokens persistentes ─────────────────────────────────────────────
// La conexión con Spotify vive en BD (tabla spotify_tokens), no en la sesión: se conecta una vez
// y sigue conectada en cualquier dispositivo y tras cerrar sesión, hasta pulsar "Desconectar"
// o revocar el acceso desde la cuenta de Spotify.

type TokenResponse = { access_token: string; expires_in: number; refresh_token?: string };

async function requestToken(params: Record<string, string>): Promise<{ ok: true; data: TokenResponse } | { ok: false; revoked: boolean }> {
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
    },
    body: new URLSearchParams(params),
  });
  if (res.ok) return { ok: true, data: (await res.json()) as TokenResponse };
  const body = await res.text();
  console.error('Spotify token error:', res.status, body.slice(0, 200));
  // invalid_grant = el usuario revocó el acceso (o el refresh token ya no es válido)
  return { ok: false, revoked: body.includes('invalid_grant') };
}

async function saveTokens(userId: string, accessToken: string, refreshToken: string, expiresIn: number) {
  await storage.upsertSpotifyToken({
    userId,
    accessToken: encryptSecret(accessToken),
    refreshToken: encryptSecret(refreshToken),
    expiresAt: new Date(Date.now() + expiresIn * 1000),
  });
}

// Evita refrescos simultáneos del mismo usuario (el reproductor hace polling)
const refreshing = new Map<string, Promise<string | null>>();

async function getAccessToken(userId: string): Promise<string | null> {
  const row = await storage.getSpotifyToken(userId);
  if (!row) return null;

  const accessToken = decryptSecret(row.accessToken);
  if (accessToken && row.expiresAt.getTime() - 60_000 > Date.now()) return accessToken;

  const pending = refreshing.get(userId);
  if (pending) return pending;

  const task = (async () => {
    const refreshToken = decryptSecret(row.refreshToken);
    if (!refreshToken) {
      // No se puede descifrar (p. ej. cambió SESSION_SECRET): hay que reconectar
      await storage.deleteSpotifyToken(userId);
      return null;
    }
    const result = await requestToken({ grant_type: 'refresh_token', refresh_token: refreshToken });
    if (!result.ok) {
      if (result.revoked) await storage.deleteSpotifyToken(userId);
      return null;
    }
    // Spotify a veces rota el refresh token: si llega uno nuevo, se guarda
    await saveTokens(userId, result.data.access_token, result.data.refresh_token || refreshToken, result.data.expires_in);
    return result.data.access_token;
  })().finally(() => refreshing.delete(userId));

  refreshing.set(userId, task);
  return task;
}

// Helper: llamada a la API de Spotify con el token del usuario logueado
async function spotifyFetch(req: Request, path: string, options: RequestInit = {}): Promise<FetchResponse | null> {
  if (!req.session.userId) return null;
  const token = await getAccessToken(req.session.userId);
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

// --- AUTH ROUTES ---

// Paso 1: redirigir a Spotify (requiere estar logueado en el blog)
router.get('/login', (req: Request, res: ExpressResponse) => {
  if (!req.session.userId) return res.redirect('/login');
  if (!CLIENT_ID || !CLIENT_SECRET) {
    return res.status(500).json({ error: 'Spotify no está configurado en el servidor' });
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
  req.session.save(() => res.redirect(`https://accounts.spotify.com/authorize?${params}`));
});

// Paso 2: Spotify vuelve aquí con ?code=
router.get('/callback', async (req: Request, res: ExpressResponse) => {
  const { code, error, state } = req.query;
  const expectedState = req.session.spotify_oauth_state;
  delete req.session.spotify_oauth_state;

  const userId = req.session.userId;
  if (!userId || error || typeof code !== 'string' || !expectedState || state !== expectedState) {
    return res.redirect('/?spotify=error');
  }

  const result = await requestToken({ grant_type: 'authorization_code', code, redirect_uri: REDIRECT_URI });
  if (!result.ok || !result.data.refresh_token) return res.redirect('/?spotify=error');

  await saveTokens(userId, result.data.access_token, result.data.refresh_token, result.data.expires_in);
  res.redirect('/?spotify=connected');
});

// Desconectar: borra los tokens guardados
router.post('/logout', async (req: Request, res: ExpressResponse) => {
  if (req.session.userId) await storage.deleteSpotifyToken(req.session.userId);
  res.json({ ok: true });
});

// --- STATUS / USER ---

router.get('/status', async (req: Request, res: ExpressResponse) => {
  const connected = !!req.session.userId && !!(await storage.getSpotifyToken(req.session.userId));
  res.json({ connected });
});

// Token de acceso para el Web Playback SDK
router.get('/token', async (req: Request, res: ExpressResponse) => {
  const token = req.session.userId ? await getAccessToken(req.session.userId) : null;
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  res.json({ access_token: token });
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
