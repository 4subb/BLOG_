import type { Bi } from "@/lib/lang";
/*
 * Fotos de Wikimedia Commons (licencias libres CC BY / CC BY-SA / CC0). La licencia exige mostrar
 * autor + licencia + enlace: <PhotoCredit> lo hace en cada lugar donde aparece una foto.
 * Para añadir más: busca en commons.wikimedia.org, copia la URL "thumb" de 1920px y los datos de autor.
 */
export type SportKey = "f1" | "ciclismo" | "tenis";

export type Photo = {
  sport: SportKey;
  src: string;      // miniatura de 1920px servida por Wikimedia
  page: string;     // página del archivo (crédito)
  author: string;
  license: string;
  title: string;
};

export const PHOTOS: Photo[] = [
  { sport: "f1", src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7b/2026_Chinese_GP_-_Mercedes_-_Kimi_Antonelli_-_Qualifying.jpg/1920px-2026_Chinese_GP_-_Mercedes_-_Kimi_Antonelli_-_Qualifying.jpg", page: "https://commons.wikimedia.org/wiki/File:2026_Chinese_GP_-_Mercedes_-_Kimi_Antonelli_-_Qualifying.jpg", author: "Liauzh", license: "CC BY 4.0", title: "2026 Chinese GP - Mercedes - Kimi Antonelli - Qualifying" },
  { sport: "f1", src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/ce/2026_Bahrain_GP_-_Mercedes_-_Kimi_Antonelli_-_Race.jpg/1920px-2026_Bahrain_GP_-_Mercedes_-_Kimi_Antonelli_-_Race.jpg", page: "https://commons.wikimedia.org/wiki/File:2026_Bahrain_GP_-_Mercedes_-_Kimi_Antonelli_-_Race.jpg", author: "Liauzh", license: "CC BY-SA 4.0", title: "2026 Bahrain GP - Mercedes - Kimi Antonelli - Race" },
  { sport: "f1", src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fb/Andrea_Kimi_Antonelli_2025_Italian_Grand_Prix_FP3.jpg/1920px-Andrea_Kimi_Antonelli_2025_Italian_Grand_Prix_FP3.jpg", page: "https://commons.wikimedia.org/wiki/File:Andrea_Kimi_Antonelli_2025_Italian_Grand_Prix_FP3.jpg", author: "Eustace Bagge", license: "CC BY 4.0", title: "Andrea Kimi Antonelli 2025 Italian Grand Prix FP3" },
  { sport: "f1", src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/cd/2026_Chinese_GP_-_Mercedes_-_Kimi_Antonelli_-_Post_Race_Celebration.jpg/1920px-2026_Chinese_GP_-_Mercedes_-_Kimi_Antonelli_-_Post_Race_Celebration.jpg", page: "https://commons.wikimedia.org/wiki/File:2026_Chinese_GP_-_Mercedes_-_Kimi_Antonelli_-_Post_Race_Celebration.jpg", author: "Liauzh", license: "CC BY 4.0", title: "2026 Chinese GP - Mercedes - Kimi Antonelli - Post Race Celebration" },
  { sport: "ciclismo", src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ac/Peloton_during_Simacourbe_climb_of_Tour_de_France_2024_stage_13.jpg/1920px-Peloton_during_Simacourbe_climb_of_Tour_de_France_2024_stage_13.jpg", page: "https://commons.wikimedia.org/wiki/File:Peloton_during_Simacourbe_climb_of_Tour_de_France_2024_stage_13.jpg", author: "Hugo LUC", license: "CC BY-SA 4.0", title: "Peloton during Simacourbe climb of Tour de France 2024 stage 13" },
  { sport: "ciclismo", src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7b/Tadej_Pogacar_in_the_descent_of_Tourmalet_pass_during_stage_14_of_TDF_24.jpg/1920px-Tadej_Pogacar_in_the_descent_of_Tourmalet_pass_during_stage_14_of_TDF_24.jpg", page: "https://commons.wikimedia.org/wiki/File:Tadej_Pogacar_in_the_descent_of_Tourmalet_pass_during_stage_14_of_TDF_24.jpg", author: "Hugo LUC", license: "CC BY-SA 4.0", title: "Tadej Pogacar in the descent of Tourmalet pass during stage 14 of TDF 24" },
  { sport: "ciclismo", src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7e/Isaac_del_Toro_maglia_rosa.jpg/1920px-Isaac_del_Toro_maglia_rosa.jpg", page: "https://commons.wikimedia.org/wiki/File:Isaac_del_Toro_maglia_rosa.jpg", author: "filip bossuyt", license: "CC BY 2.0", title: "Isaac del Toro maglia rosa" },
  { sport: "ciclismo", src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ef/Jonas_Vinegaard_and_Tadej_Pogacar_on_stage_14_of_the_2025_Tour_de_France.jpg/1920px-Jonas_Vinegaard_and_Tadej_Pogacar_on_stage_14_of_the_2025_Tour_de_France.jpg", page: "https://commons.wikimedia.org/wiki/File:Jonas_Vinegaard_and_Tadej_Pogacar_on_stage_14_of_the_2025_Tour_de_France.jpg", author: "Skyebble", license: "CC BY 4.0", title: "Jonas Vinegaard and Tadej Pogacar on stage 14 of the 2025 Tour de France" },
  { sport: "tenis", src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/48/Centre_Court_%282%29.jpg/1920px-Centre_Court_%282%29.jpg", page: "https://commons.wikimedia.org/wiki/File:Centre_Court_(2).jpg", author: "Marc Di Luzio from Bournemouth, England", license: "CC BY 2.0", title: "Centre Court (2)" },
  { sport: "tenis", src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/be/Jannik_Sinner_after_winning_NextGen_ATP_Finals_in_Milan%2C_2019.jpg/1920px-Jannik_Sinner_after_winning_NextGen_ATP_Finals_in_Milan%2C_2019.jpg", page: "https://commons.wikimedia.org/wiki/File:Jannik_Sinner_after_winning_NextGen_ATP_Finals_in_Milan,_2019.jpg", author: "Thekingross", license: "CC BY-SA 4.0", title: "Jannik Sinner after winning NextGen ATP Finals in Milan, 2019" },
  { sport: "tenis", src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/ba/Jannik_Sinner_vs_Richard_Gasquet%2C_2025_Roland_Garros%2C_2025-05-29_%2876%29.jpg/1920px-Jannik_Sinner_vs_Richard_Gasquet%2C_2025_Roland_Garros%2C_2025-05-29_%2876%29.jpg", page: "https://commons.wikimedia.org/wiki/File:Jannik_Sinner_vs_Richard_Gasquet,_2025_Roland_Garros,_2025-05-29_(76).jpg", author: "Like tears in rain", license: "CC BY-SA 4.0", title: "Jannik Sinner vs Richard Gasquet, 2025 Roland Garros, 2025-05-29 (76)" },
  { sport: "tenis", src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d7/Jannik_Sinner_vs_Richard_Gasquet%2C_2025_Roland_Garros%2C_2025-05-29_%28564%29.jpg/1920px-Jannik_Sinner_vs_Richard_Gasquet%2C_2025_Roland_Garros%2C_2025-05-29_%28564%29.jpg", page: "https://commons.wikimedia.org/wiki/File:Jannik_Sinner_vs_Richard_Gasquet,_2025_Roland_Garros,_2025-05-29_(564).jpg", author: "Like tears in rain", license: "CC BY-SA 4.0", title: "Jannik Sinner vs Richard Gasquet, 2025 Roland Garros, 2025-05-29 (564)" },
  { sport: "tenis", src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/40/Aryna_Sabalenka_at_2025_Miami_Open_02.jpg/1920px-Aryna_Sabalenka_at_2025_Miami_Open_02.jpg", page: "https://commons.wikimedia.org/wiki/File:Aryna_Sabalenka_at_2025_Miami_Open_02.jpg", author: "Vbrunophotog", license: "CC BY-SA 4.0", title: "Aryna Sabalenka at 2025 Miami Open 02" },];

export const photosFor = (sport: SportKey) => PHOTOS.filter((p) => p.sport === sport);

/** Miniatura más pequeña (Wikimedia sirve anchos estándar: 330, 500, 960, 1280, 1920…). */
export const sized = (p: Photo, width: 500 | 960 | 1280 | 1920) => p.src.replace("/1920px-", `/${width}px-`);

const byTitle = (title: string) => {
  const p = PHOTOS.find((x) => x.title === title);
  if (!p) throw new Error(`Foto no encontrada: ${title}`);
  return p;
};

/**
 * Fotos de la escena-cómic del campeón, por driverId de Jolpica. Si el campeón (o líder) no tiene
 * entrada aquí, se usa la ilustración SVG genérica.
 */
export const CHAMPION_ART: Record<string, { car: Photo; celebrate: Photo; carFacing: "left" | "right"; shout: string; celebrateCaption: Bi }> = {
  antonelli: {
    car: byTitle("2026 Chinese GP - Mercedes - Kimi Antonelli - Qualifying"),
    celebrate: byTitle("2026 Chinese GP - Mercedes - Kimi Antonelli - Post Race Celebration"),
    carFacing: "left",
    shout: "¡Campione del mondo!",
    celebrateCaption: { es: "GP de China · su primera victoria de 2026", en: "Chinese GP · his first win of 2026" },
  },
};
