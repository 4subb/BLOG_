import type { SportKey } from "./media";

export type Moment = { year: string; tag: "Leyenda" | "Drama" | "Récord" | "Origen" | "México"; title: string; body: string; why: string };
export type Trivia = { q: string; a: string };
export type Record_ = { value: number; suffix?: string; label: string; who: string };

export type SportHistory = { intro: string; moments: Moment[]; trivia: Trivia[]; records: Record_[] };

export const HISTORY: Record<SportKey, SportHistory> = {
  f1: {
    intro: "Más de 75 años de velocidad: de los Alfa Romeo de posguerra a los híbridos de 2026.",
    moments: [
      {
        year: "1950", tag: "Origen", title: "Silverstone, 13 de mayo",
        body: "Se corre la primera carrera del Mundial de Fórmula 1, en un antiguo aeródromo militar inglés. Giuseppe «Nino» Farina gana con Alfa Romeo y a final de año se convierte en el primer campeón del mundo.",
        why: "El primer campeón de la historia fue italiano.",
      },
      {
        year: "1953", tag: "Leyenda", title: "Ascari, el bicampeón",
        body: "Alberto Ascari gana su segundo título seguido con Ferrari, tras una racha de nueve victorias consecutivas entre 1952 y 1953 que no se igualó en 60 años.",
        why: "Fue el último italiano campeón del mundo de pilotos… hasta 2026.",
      },
      {
        year: "1976", tag: "Drama", title: "Lauda vuelve del fuego",
        body: "Niki Lauda sufre un accidente brutal y su Ferrari se incendia en Nürburgring el 1 de agosto. Apenas 42 días después vuelve a correr en Monza, con las heridas aún vendadas, y termina cuarto. Pierde el título ante James Hunt por un solo punto en la lluvia de Fuji.",
        why: "Es uno de los regresos más valientes de la historia del deporte.",
      },
      {
        year: "1988", tag: "Récord", title: "McLaren casi perfecto",
        body: "Con Ayrton Senna y Alain Prost, el McLaren MP4/4 gana 15 de las 16 carreras del año. Senna se lleva su primer título y nace la rivalidad más famosa de la F1.",
        why: "Durante décadas fue la temporada más dominante jamás vista.",
      },
      {
        year: "2008", tag: "Drama", title: "Brasil, la última curva",
        body: "En la última vuelta del último GP, Felipe Massa ya celebraba el título en Interlagos. En las curvas finales, Lewis Hamilton adelanta a Timo Glock, termina quinto y gana el campeonato por un punto.",
        why: "El título se decidió a segundos de la bandera a cuadros.",
      },
      {
        year: "2020", tag: "Drama", title: "Grosjean y el halo",
        body: "En Baréin, el Haas de Romain Grosjean atraviesa las barreras, se parte en dos y estalla en llamas. Grosjean sale por su propio pie tras unos 27 segundos dentro del fuego. El halo, criticado por feo cuando llegó en 2018, le salvó la vida.",
        why: "Cambió para siempre la conversación sobre seguridad.",
      },
      {
        year: "2021", tag: "Drama", title: "Abu Dabi, una vuelta",
        body: "Hamilton y Verstappen llegan empatados a puntos a la última carrera. Un coche de seguridad final deja una sola vuelta de carrera: Verstappen, con neumáticos nuevos, adelanta y gana su primer título.",
        why: "La definición más polémica de la era moderna.",
      },
    ],
    trivia: [
      { q: "¿Podría un F1 rodar boca abajo?", a: "En teoría sí: a alta velocidad genera más carga aerodinámica que su propio peso, así que podría sostenerse en el techo de un túnel." },
      { q: "¿Por qué el premio de Mónaco sigue en el calendario si casi no se puede adelantar?", a: "Por historia y prestigio: se corre desde 1950 (con pausas) y ganar entre sus guardarraíles es de los triunfos más valorados." },
      { q: "¿Qué italiano tiene más títulos de F1?", a: "Alberto Ascari, bicampeón con Ferrari en 1952 y 1953. Nino Farina (1950) y, desde 2026, Kimi Antonelli tienen uno." },
    ],
    records: [
      { value: 7, label: "Títulos de pilotos", who: "Schumacher y Hamilton" },
      { value: 16, label: "Títulos de constructores", who: "Ferrari" },
      { value: 15, suffix: "/16", label: "Victorias en un año", who: "McLaren, 1988" },
      { value: 1950, label: "Primer Mundial", who: "Silverstone" },
    ],
  },

  ciclismo: {
    intro: "Desde 1903, el deporte del sufrimiento: puertos, adoquines y segundos que deciden carreras de tres semanas.",
    moments: [
      {
        year: "1903", tag: "Origen", title: "Nace el Tour",
        body: "El periódico L'Auto organiza la primera Vuelta a Francia para vender más ejemplares: seis etapas y unos 2,400 km, con tramos que duraban toda la noche. Gana Maurice Garin.",
        why: "Un truco de marketing creó la carrera ciclista más famosa del mundo.",
      },
      {
        year: "1969", tag: "Leyenda", title: "El Caníbal",
        body: "En su primer Tour, Eddy Merckx gana la general, la montaña y la regularidad a la vez. Le llamaron «El Caníbal» porque no dejaba nada para los demás. Terminó con cinco Tours, cinco Giros y una Vuelta.",
        why: "Para muchos, el mejor ciclista de todos los tiempos.",
      },
      {
        year: "1989", tag: "Drama", title: "Ocho segundos",
        body: "Laurent Fignon llega a la contrarreloj final en París con 50 segundos de ventaja. Greg LeMond, con un manillar de triatlón entonces novedoso, le saca 58 y gana el Tour por 8 segundos.",
        why: "Es la diferencia más pequeña de la historia del Tour.",
      },
      {
        year: "1998", tag: "Leyenda", title: "Pantani, el Pirata",
        body: "Marco Pantani gana el Giro y el Tour en el mismo año con ataques en montaña que hoy siguen en los videos más vistos del ciclismo.",
        why: "Nadie volvió a lograr el doblete Giro-Tour en 26 años.",
      },
      {
        year: "2024", tag: "Récord", title: "Pogačar, Triple Corona",
        body: "Tadej Pogačar gana Giro y Tour (el primer doblete desde Pantani) y remata con el Mundial en Zúrich tras un ataque a 100 km de meta.",
        why: "Solo Merckx (1974) y Stephen Roche (1987) lo habían hecho antes.",
      },
      {
        year: "2025", tag: "México", title: "«Torito» de rosa",
        body: "Isaac del Toro, de Ensenada, Baja California, viste la maglia rosa del Giro de Italia durante buena parte de la carrera y termina segundo con solo 21 años.",
        why: "El mejor resultado de un mexicano en una gran vuelta.",
      },
    ],
    trivia: [
      { q: "¿Qué recibe el ganador de la París-Roubaix?", a: "Un adoquín. La carrera cruza unos 30 tramos de pavés y el trofeo es una piedra de esos caminos." },
      { q: "¿Cuántas curvas tiene el Alpe d'Huez?", a: "21. Cada una tiene una placa con el nombre de ganadores de la etapa." },
      { q: "¿Por qué el líder del Tour viste de amarillo?", a: "Por el color del papel del periódico L'Auto, que organizó la primera edición." },
    ],
    records: [
      { value: 11, label: "Grandes vueltas", who: "Eddy Merckx (5 Tours, 5 Giros, 1 Vuelta)" },
      { value: 8, suffix: "s", label: "Tour más ajustado", who: "LeMond vs Fignon, 1989" },
      { value: 21, label: "Curvas del Alpe d'Huez", who: "con nombre de ganadores" },
      { value: 1903, label: "Primer Tour", who: "Maurice Garin" },
    ],
  },

  tenis: {
    intro: "De los jardines de Wimbledon en 1877 a la era de Sinner y Alcaraz.",
    moments: [
      {
        year: "1877", tag: "Origen", title: "Primer Wimbledon",
        body: "El All England Croquet Club organiza un torneo de «lawn tennis» para pagar un rodillo para el césped. Lo gana Spencer Gore ante unos 200 espectadores.",
        why: "El torneo de tenis más antiguo del mundo nació para financiar jardinería.",
      },
      {
        year: "1973", tag: "Leyenda", title: "La Batalla de los Sexos",
        body: "Billie Jean King derrota a Bobby Riggs en el Astrodome de Houston, ante millones de televidentes. Ese mismo año impulsa la creación de la WTA y la igualdad de premios en el US Open.",
        why: "Un partido de exhibición que cambió el deporte femenino.",
      },
      {
        year: "1988", tag: "Récord", title: "El Golden Slam",
        body: "Steffi Graf gana los cuatro Grand Slams y el oro olímpico de Seúl en el mismo año.",
        why: "Nadie más, hombre o mujer, lo ha conseguido en individuales.",
      },
      {
        year: "2008", tag: "Drama", title: "La mejor final",
        body: "Rafael Nadal vence a Roger Federer en la final de Wimbledon tras 4 horas y 48 minutos y dos interrupciones por lluvia. Termina casi a oscuras.",
        why: "Muchos la consideran el mejor partido de la historia.",
      },
      {
        year: "2010", tag: "Récord", title: "Isner–Mahut: 11 horas",
        body: "John Isner y Nicolas Mahut juegan en Wimbledon durante tres días: 11 horas y 5 minutos, con un quinto set de 70–68. El marcador electrónico dejó de funcionar.",
        why: "El partido más largo de la historia del tenis.",
      },
      {
        year: "2024", tag: "Leyenda", title: "Sinner reina en Turín",
        body: "Jannik Sinner gana las ATP Finals en casa sin ceder un solo set, y se convierte en el primer italiano campeón del torneo de maestros.",
        why: "Turín pasó a ser la capital del tenis italiano.",
      },
    ],
    trivia: [
      { q: "¿Por qué en tenis se cuenta 15, 30, 40?", a: "Nadie lo sabe con certeza. La teoría más citada habla de un reloj con cuartos (15, 30, 45) en el que «45» se acortó a 40." },
      { q: "¿Qué son las ATP Finals?", a: "El torneo de fin de año con solo los 8 mejores del ranking: dos grupos, todos contra todos, y luego eliminatorias. La primera edición fue en Tokio en 1970." },
      { q: "¿Por qué Wimbledon exige vestir de blanco?", a: "Tradición del siglo XIX: el sudor se notaba menos en ropa blanca, lo que se consideraba más decoroso." },
    ],
    records: [
      { value: 24, label: "Grand Slams (récord masculino al 2023)", who: "Novak Djokovic" },
      { value: 70, suffix: "–68", label: "Set más largo", who: "Isner vs Mahut, 2010" },
      { value: 1988, label: "Único Golden Slam", who: "Steffi Graf" },
      { value: 1877, label: "Primer Wimbledon", who: "Spencer Gore" },
    ],
  },
};
