// Forma de /api/sports/news/:sport (server/news.ts).
export type NewsItem = {
  title: string;
  link: string;
  source: string;
  date: string | null;
  image: string | null;
};
