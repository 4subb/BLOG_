import type { SportKey } from "./media";
import type { Moment, SportHistory } from "./history";

/** Etiquetas de los momentos en inglés (las claves de `tag` siguen en español). */
export const TAG_EN: Record<Moment["tag"], string> = { Leyenda: "Legend", Drama: "Drama", "Récord": "Record", Origen: "Origin", "México": "Mexico" };

/** Versión en inglés de HISTORY: misma estructura y orden. */
export const HISTORY_EN: Record<SportKey, SportHistory> = {
  f1: {
    intro: "Over 75 years of speed: from post-war Alfa Romeos to the 2026 hybrids.",
    moments: [
      {
        year: "1950", tag: "Origen", title: "Silverstone, 13 May",
        body: "The first Formula 1 World Championship race is held on a former RAF airfield in England. Giuseppe \"Nino\" Farina wins with Alfa Romeo and by the end of the year becomes the first world champion.",
        why: "The first champion in history was Italian.",
      },
      {
        year: "1953", tag: "Leyenda", title: "Ascari, two-time champion",
        body: "Alberto Ascari wins his second straight title with Ferrari, after a run of nine consecutive victories across 1952 and 1953 that went unmatched for 60 years.",
        why: "He was the last Italian drivers' champion… until 2026.",
      },
      {
        year: "1976", tag: "Drama", title: "Lauda returns from the fire",
        body: "Niki Lauda suffers a brutal crash and his Ferrari bursts into flames at the Nürburgring on 1 August. Just 42 days later he races again at Monza, wounds still bandaged, and finishes fourth. He loses the title to James Hunt by a single point in the rain at Fuji.",
        why: "One of the bravest comebacks in sporting history.",
      },
      {
        year: "1988", tag: "Récord", title: "An almost perfect McLaren",
        body: "With Ayrton Senna and Alain Prost, the McLaren MP4/4 wins 15 of the year's 16 races. Senna takes his first title and F1's most famous rivalry is born.",
        why: "For decades it was the most dominant season ever seen.",
      },
      {
        year: "2008", tag: "Drama", title: "Brazil, the final corner",
        body: "On the last lap of the last Grand Prix, Felipe Massa was already celebrating the title at Interlagos. In the final corners, Lewis Hamilton passes Timo Glock, finishes fifth and wins the championship by one point.",
        why: "The title was decided seconds from the chequered flag.",
      },
      {
        year: "2020", tag: "Drama", title: "Grosjean and the halo",
        body: "In Bahrain, Romain Grosjean's Haas pierces the barriers, splits in two and explodes in flames. Grosjean walks out on his own after some 27 seconds in the fire. The halo, mocked as ugly when it arrived in 2018, saved his life.",
        why: "It changed the conversation about safety forever.",
      },
      {
        year: "2021", tag: "Drama", title: "Abu Dhabi, one lap",
        body: "Hamilton and Verstappen arrive level on points at the final race. A late safety car leaves a single racing lap: Verstappen, on fresh tyres, overtakes and wins his first title.",
        why: "The most controversial title decider of the modern era.",
      },
    ],
    trivia: [
      { q: "Could an F1 car drive upside down?", a: "In theory, yes: at high speed it generates more downforce than its own weight, so it could stick to the roof of a tunnel." },
      { q: "Why is Monaco still on the calendar if you can barely overtake?", a: "History and prestige: it has been raced since 1950 (with breaks) and winning between its barriers is one of the most prized victories." },
      { q: "Which Italian has the most F1 titles?", a: "Alberto Ascari, champion with Ferrari in 1952 and 1953. Nino Farina (1950) and, since 2026, Kimi Antonelli have one each." },
    ],
    records: [
      { value: 7, label: "Drivers' titles", who: "Schumacher & Hamilton" },
      { value: 16, label: "Constructors' titles", who: "Ferrari" },
      { value: 15, suffix: "/16", label: "Wins in one season", who: "McLaren, 1988" },
      { value: 1950, label: "First World Championship", who: "Silverstone" },
    ],
  },

  ciclismo: {
    intro: "Since 1903, the sport of suffering: mountain passes, cobbles and seconds that decide three-week races.",
    moments: [
      {
        year: "1903", tag: "Origen", title: "The Tour is born",
        body: "The newspaper L'Auto organises the first Tour de France to sell more copies: six stages and some 2,400 km, with legs that lasted all night. Maurice Garin wins.",
        why: "A marketing stunt created the most famous bike race in the world.",
      },
      {
        year: "1969", tag: "Leyenda", title: "The Cannibal",
        body: "In his first Tour, Eddy Merckx wins the general, mountains and points classifications at once. They called him \"The Cannibal\" because he left nothing for anyone else. He finished with five Tours, five Giros and one Vuelta.",
        why: "For many, the greatest cyclist of all time.",
      },
      {
        year: "1989", tag: "Drama", title: "Eight seconds",
        body: "Laurent Fignon starts the final time trial in Paris with a 50-second lead. Greg LeMond, on then-novel triathlon bars, gains 58 and wins the Tour by 8 seconds.",
        why: "The smallest winning margin in Tour history.",
      },
      {
        year: "1998", tag: "Leyenda", title: "Pantani, the Pirate",
        body: "Marco Pantani wins the Giro and the Tour in the same year with mountain attacks that remain among cycling's most-watched videos.",
        why: "Nobody managed the Giro–Tour double again for 26 years.",
      },
      {
        year: "2024", tag: "Récord", title: "Pogačar's Triple Crown",
        body: "Tadej Pogačar wins the Giro and the Tour (the first double since Pantani) and caps it with the World Championship in Zurich after an attack 100 km from the line.",
        why: "Only Merckx (1974) and Stephen Roche (1987) had done it before.",
      },
      {
        year: "2025", tag: "México", title: "\"Torito\" in pink",
        body: "Isaac del Toro, from Ensenada, Baja California, wears the Giro d'Italia's maglia rosa for much of the race and finishes second at just 21.",
        why: "The best result by a Mexican in a Grand Tour.",
      },
    ],
    trivia: [
      { q: "What does the winner of Paris–Roubaix receive?", a: "A cobblestone. The race crosses about 30 sectors of pavé and the trophy is a stone from those roads." },
      { q: "How many hairpins does Alpe d'Huez have?", a: "21. Each one carries a plaque with the names of stage winners." },
      { q: "Why does the Tour leader wear yellow?", a: "After the colour of the paper of L'Auto, the newspaper that organised the first edition." },
    ],
    records: [
      { value: 11, label: "Grand Tours", who: "Eddy Merckx (5 Tours, 5 Giros, 1 Vuelta)" },
      { value: 8, suffix: "s", label: "Closest Tour", who: "LeMond vs Fignon, 1989" },
      { value: 21, label: "Alpe d'Huez hairpins", who: "named after winners" },
      { value: 1903, label: "First Tour", who: "Maurice Garin" },
    ],
  },

  tenis: {
    intro: "From the lawns of Wimbledon in 1877 to the Sinner and Alcaraz era.",
    moments: [
      {
        year: "1877", tag: "Origen", title: "The first Wimbledon",
        body: "The All England Croquet Club holds a \"lawn tennis\" tournament to pay for a pony roller for the grass. Spencer Gore wins in front of about 200 spectators.",
        why: "The world's oldest tennis tournament was born to fund gardening.",
      },
      {
        year: "1973", tag: "Leyenda", title: "The Battle of the Sexes",
        body: "Billie Jean King beats Bobby Riggs at the Houston Astrodome in front of millions of TV viewers. That same year she drives the creation of the WTA and equal prize money at the US Open.",
        why: "An exhibition match that changed women's sport.",
      },
      {
        year: "1988", tag: "Récord", title: "The Golden Slam",
        body: "Steffi Graf wins all four Grand Slams and Olympic gold in Seoul in the same year.",
        why: "Nobody else, man or woman, has done it in singles.",
      },
      {
        year: "2008", tag: "Drama", title: "The greatest final",
        body: "Rafael Nadal beats Roger Federer in the Wimbledon final after 4 hours 48 minutes and two rain delays. It ends almost in darkness.",
        why: "Many consider it the greatest match ever played.",
      },
      {
        year: "2010", tag: "Récord", title: "Isner–Mahut: 11 hours",
        body: "John Isner and Nicolas Mahut play at Wimbledon over three days: 11 hours 5 minutes, with a fifth set of 70–68. The electronic scoreboard stopped working.",
        why: "The longest match in tennis history.",
      },
      {
        year: "2024", tag: "Leyenda", title: "Sinner rules Turin",
        body: "Jannik Sinner wins the ATP Finals at home without dropping a set, becoming the first Italian to win the season-ending championship.",
        why: "Turin became the capital of Italian tennis.",
      },
    ],
    trivia: [
      { q: "Why does tennis count 15, 30, 40?", a: "Nobody knows for sure. The most cited theory points to a clock face in quarters (15, 30, 45) where \"45\" was shortened to 40." },
      { q: "What are the ATP Finals?", a: "The year-end event with only the top 8 in the rankings: two round-robin groups, then knockouts. The first edition was in Tokyo in 1970." },
      { q: "Why does Wimbledon require all-white clothing?", a: "A 19th-century tradition: sweat showed less on white clothes, which was considered more decorous." },
    ],
    records: [
      { value: 24, label: "Grand Slams (men's record as of 2023)", who: "Novak Djokovic" },
      { value: 70, suffix: "–68", label: "Longest set", who: "Isner vs Mahut, 2010" },
      { value: 1988, label: "Only Golden Slam", who: "Steffi Graf" },
      { value: 1877, label: "First Wimbledon", who: "Spencer Gore" },
    ],
  },
};
