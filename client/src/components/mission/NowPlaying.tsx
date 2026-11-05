import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

type NowPlayingData =
  | { status: "playing" | "recent"; track: { name: string; artists: string; image?: string; url?: string }; playedAt?: string }
  | { status: "off" };

/** Lo que suena en el Spotify del dueño del sitio (público, cacheado 15 s en el servidor). */
function useNowPlaying() {
  return useQuery<NowPlayingData>({
    queryKey: ["/api/spotify/now-playing"],
    queryFn: async () => {
      const res = await fetch("/api/spotify/now-playing");
      return res.ok ? res.json() : { status: "off" };
    },
    staleTime: 15_000,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
    retry: false,
  });
}

/** Tres barras de ecualizador en el color de acento (quietas si no está sonando). */
function Equalizer({ playing }: { playing: boolean }) {
  return (
    <span aria-hidden className="inline-flex h-2.5 items-end gap-[2px] align-middle">
      {[0, 0.25, 0.5].map((delay) => (
        <span
          key={delay}
          className={cn("h-full w-[2px] origin-bottom bg-signal", playing ? "animate-eq" : "scale-y-[0.35] opacity-60")}
          style={playing ? { animationDelay: `${delay}s` } : undefined}
        />
      ))}
    </span>
  );
}

function relativeTime(iso: string | undefined, lang: string) {
  if (!iso) return undefined;
  const minutes = Math.round((new Date(iso).getTime() - Date.now()) / 60_000);
  const rtf = new Intl.RelativeTimeFormat(lang, { numeric: "auto", style: "short" });
  if (Math.abs(minutes) < 60) return rtf.format(minutes, "minute");
  if (Math.abs(minutes) < 60 * 24) return rtf.format(Math.round(minutes / 60), "hour");
  return rtf.format(Math.round(minutes / 1440), "day");
}

/**
 * "Escuchando ahora": telemetría de lo que suena en el Spotify del autor.
 * `inline` va en la línea de telemetría junto a ciudad y hora; `card` en el footer con portada.
 * Si no hay nada que mostrar no renderiza nada.
 */
export default function NowPlaying({ variant = "inline", className }: { variant?: "inline" | "card"; className?: string }) {
  const { t, i18n } = useTranslation();
  const { data } = useNowPlaying();
  if (!data || data.status === "off") return null;

  const playing = data.status === "playing";
  const label = playing ? t("ui.nowPlaying") : t("ui.lastPlayed");
  const when = playing ? undefined : relativeTime(data.playedAt, i18n.language);
  const { track } = data;

  if (variant === "card") {
    return (
      <a
        href={track.url}
        target="_blank"
        rel="noreferrer"
        className={cn("group mt-6 flex items-center gap-3", className)}
        title={`${track.name} — ${track.artists}`}
      >
        {track.image && <img src={track.image} alt="" loading="lazy" className="h-12 w-12 shrink-0 object-cover grayscale transition-[filter] duration-500 group-hover:grayscale-0" />}
        <span className="min-w-0">
          <span className="label-mono flex items-center gap-2 whitespace-nowrap text-muted-foreground">
            <Equalizer playing={playing} /> {label}
          </span>
          <span className="mt-1 block truncate text-sm transition-colors group-hover:text-signal">{track.name}</span>
          <span className="block truncate text-xs text-muted-foreground">
            {track.artists}
            {when && <> · {when}</>}
          </span>
        </span>
      </a>
    );
  }

  return (
    <a
      href={track.url}
      target="_blank"
      rel="noreferrer"
      className={cn("inline-flex min-w-0 items-center gap-2 transition-colors hover:text-foreground", className)}
      title={`${label}: ${track.name} — ${track.artists}`}
    >
      <Equalizer playing={playing} />
      <span className="truncate">
        {track.name} <span className="opacity-60">— {track.artists}</span>
      </span>
    </a>
  );
}
