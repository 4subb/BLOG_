import { Router } from 'express';
import { catchAsyncErrors } from './asyncErrors';
import type { NewsItem } from '@shared/news';

/**
 * Titulares recientes por deporte a partir de RSS públicos. Solo se guardan título, enlace,
 * fecha e imagen: el lector va a la fuente original para leer la nota completa.
 */
const FEEDS: Record<string, { source: string; url: string }[]> = {
  f1: [
    { source: 'Formula1.com', url: 'https://www.formula1.com/en/latest/all.xml' },
    { source: 'BBC Sport', url: 'https://feeds.bbci.co.uk/sport/formula1/rss.xml' },
  ],
  ciclismo: [
    { source: 'Cyclingnews', url: 'https://www.cyclingnews.com/feeds/all' },
    { source: 'BBC Sport', url: 'https://feeds.bbci.co.uk/sport/cycling/rss.xml' },
  ],
  tenis: [
    { source: 'BBC Sport', url: 'https://feeds.bbci.co.uk/sport/tennis/rss.xml' },
  ],
};

const TTL_MS = 20 * 60 * 1000;
const MAX_ITEMS = 12;

const decode = (s: string) =>
  s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .trim();

const tag = (xml: string, name: string) => {
  const m = xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, 'i'));
  return m ? decode(m[1]) : '';
};

const attr = (xml: string, name: string, attribute: string) => {
  const m = xml.match(new RegExp(`<${name}[^>]*\\s${attribute}="([^"]+)"`, 'i'));
  return m ? decode(m[1]) : null;
};

// Solo enlaces http(s): el feed es contenido externo y acaba en un href
const safeUrl = (u: string | null) => (u && /^https?:\/\//i.test(u) ? u : null);

function parseRss(xml: string, source: string): NewsItem[] {
  return (xml.match(/<item[\s>][\s\S]*?<\/item>/gi) ?? []).flatMap((item) => {
    const link = safeUrl(tag(item, 'link') || attr(item, 'guid', 'isPermaLink'));
    const title = tag(item, 'title');
    if (!link || !title) return [];
    const date = new Date(tag(item, 'pubDate') || tag(item, 'dc:date'));
    const image = safeUrl(
      attr(item, 'media:thumbnail', 'url') ?? attr(item, 'media:content', 'url') ?? attr(item, 'enclosure', 'url'),
    );
    return [{ title, link, source, date: isNaN(date.getTime()) ? null : date.toISOString(), image }];
  });
}

async function fetchFeed({ source, url }: { source: string; url: string }): Promise<NewsItem[]> {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; personal-blog-news/1.0)', Accept: 'application/rss+xml, application/xml, text/xml' },
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`${url} → ${res.status}`);
  return parseRss(await res.text(), source);
}

const cache = new Map<string, { items: NewsItem[]; at: number }>();

async function getNews(sport: string): Promise<NewsItem[]> {
  const hit = cache.get(sport);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.items;

  const results = await Promise.allSettled(FEEDS[sport].map(fetchFeed));
  // Cada feed ya viene del más nuevo al más viejo, pero no todos traen fecha (formula1.com no):
  // se intercalan las fuentes en vez de ordenar por fecha, para que ninguna quede fuera.
  const lists = results.map((r) => (r.status === 'fulfilled' ? r.value : []));
  const items: NewsItem[] = [];
  for (let i = 0; lists.some((l) => i < l.length); i++) {
    for (const l of lists) if (l[i]) items.push(l[i]);
  }
  // Mismo titular en dos fuentes → uno solo
  const seen = new Set<string>();
  const unique = items.filter((i) => {
    const key = i.title.toLowerCase().replace(/\W+/g, ' ').trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, MAX_ITEMS);

  if (unique.length === 0 && hit) return hit.items; // todas las fuentes fallaron: copia anterior
  cache.set(sport, { items: unique, at: Date.now() });
  return unique;
}

const router = Router();
catchAsyncErrors(router);

router.get('/:sport', async (req, res) => {
  const { sport } = req.params;
  if (!FEEDS[sport]) return res.status(404).json({ message: 'Deporte desconocido' });
  try {
    res.set('Cache-Control', 'public, max-age=300');
    res.json(await getNews(sport));
  } catch (err) {
    console.error('[news] Error cargando titulares:', err);
    res.status(502).json({ message: 'No se pudieron cargar las noticias' });
  }
});

export default router;
