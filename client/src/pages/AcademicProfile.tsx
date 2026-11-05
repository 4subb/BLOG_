import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { ArrowDownToLine, Github, Linkedin, Mail } from "lucide-react";

import MissionHero from "@/components/mission/MissionHero";
import IndexList from "@/components/mission/IndexList";
import { Rule, SectionHead } from "@/components/mission/primitives";
import { SlideshowSignature, type Slide } from "@/components/mission/signatures";
import { Button } from "@/components/ui/button";
import { easeOutExpo, fadeUp, staggerContainer } from "@/lib/motion";
import { pad, usePosts } from "@/lib/posts";
import { cn } from "@/lib/utils";
import miFoto from "@/assets/perfil.jpg";

const LINKS = {
  cv: "/CV.pdf",
  email: "mailto:angel.subias.tovar@gmail.com",
  github: "https://github.com/4subb/BLOG_",
  linkedin: "https://www.linkedin.com/in/jos%C3%A9-%C3%A1ngel-sub%C3%ADas-tovar-a74874278/",
};

// Posts de Ingeniería que documentan cada proyecto (su portada alimenta el fondo del hero)
const PROJECTS = [
  { id: "538e2184-a1e1-4183-8e81-e934917b5df6", key: "p1", meta: "PM · Tarbes, FR" },
  { id: "3af569c4-9866-4485-9d26-8c4ea0489743", key: "p2", meta: "PM · ESP32" },
  { id: "802be6cd-ba91-4367-93e2-653e204ba3e6", key: "p3", meta: "± 0.03 mm" },
];

// Bandas de color de cada etapa. El blanco de las banderas se sustituye por el gris cálido `rock`
// para que no desaparezca sobre el fondo crema. `dir` = orientación de las franjas.
const ROCK = "hsl(var(--rock))";
const FLAGS = {
  BMW: { bands: ["#1C69D4", ROCK, "#1C69D4", ROCK], dir: "90deg" },
  MX: { bands: ["#006847", ROCK, "#CE1126"], dir: "90deg" },
  AR: { bands: ["#74ACDF", ROCK, "#74ACDF"], dir: "180deg" },
  FR: { bands: ["#0055A4", ROCK, "#EF4135"], dir: "90deg" },
} as const;
type Flag = (typeof FLAGS)[keyof typeof FLAGS];

/** Franjas duras (sin degradado) para la tira de color bajo el código de la etapa. */
const stripes = ({ bands, dir }: Flag) =>
  `linear-gradient(${dir}, ${bands.map((c, i) => `${c} ${(i / bands.length) * 100}% ${((i + 1) / bands.length) * 100}%`).join(", ")})`;

// Trayectoria, de lo más reciente a lo más antiguo; el código es la firma del panel fijo
const STAGES = [
  { n: 1, code: "BMW", flag: FLAGS.BMW, coords: "22.15°N 100.98°W", current: true },
  { n: 2, code: "MX", flag: FLAGS.MX, coords: "20.52°N 100.81°W" },
  { n: 3, code: "AR", flag: FLAGS.AR, coords: "27.47°S 58.83°W" },
  { n: 4, code: "FR", flag: FLAGS.FR, coords: "43.23°N 0.07°E" },
];


const SKILLS = ["auto", "hard", "soft", "manu"] as const;

const CERTS = [
  { key: "toefl", href: "/TOEFL ITP.pdf", file: "Jose_Angel_TOEFL_ITP.pdf" },
  { key: "ibm1", href: "/IBM DB2 Database Administration.pdf", file: "Jose_Angel_IBM_Administration.pdf" },
  { key: "ibm2", href: "/Intelligent Database Extraction with IBM DB2.pdf", file: "Jose_Angel_IBM_Extraction.pdf" },
];

export default function AcademicProfile() {
  const { t } = useTranslation();
  const { posts } = usePosts("ingenieria");
  const cover = (id: string) => posts.find((p) => p.id === id)?.imageUrl;

  const slides: Slide[] = [
    { src: miFoto, caption: "San Luis Potosí · MX" },
    ...PROJECTS.flatMap(({ id, key }) => {
      const src = cover(id);
      return src ? [{ src, caption: t(`projects.${key}Title`) }] : [];
    }),
  ];

  return (
    <>
      <MissionHero
        index="02"
        label={t("nav.academic")}
        title={t("academic.title")}
        description={t("hero.description")}
        signature={<SlideshowSignature slides={slides} />}
        actions={
          <>
            <Button asChild size="lg" className="h-12 rounded-full px-6">
              <a href={LINKS.cv} download="Jose_Angel_Subias_CV.pdf">
                <ArrowDownToLine /> {t("hero.cv")}
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 rounded-full border-rock px-6">
              <a href={LINKS.email}>
                <Mail /> {t("academic.contact")}
              </a>
            </Button>
            <Button asChild size="icon" variant="ghost" className="h-12 w-12 rounded-full">
              <a href={LINKS.github} target="_blank" rel="noreferrer" aria-label="GitHub"><Github /></a>
            </Button>
            <Button asChild size="icon" variant="ghost" className="h-12 w-12 rounded-full">
              <a href={LINKS.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn"><Linkedin /></a>
            </Button>
          </>
        }
        specs={[
          { label: t("academic.countries"), value: 3, pad: 2 },
          { label: t("academic.projects"), value: PROJECTS.length, pad: 2 },
          { label: t("academic.certs"), value: CERTS.length, pad: 2 },
          { label: t("academic.english"), value: "B2", unit: "TOEFL 553" },
        ]}
        ghost="Curriculum"
      />

      {/* (01) Trayectoria */}
      <section className="page-container py-20 sm:py-28">
        <SectionHead index="01" title={t("academic.journey")} aside={`${pad(STAGES.length)} · ${t("academic.chapter")}s`} className="mb-6" />
        <Timeline />
      </section>

      {/* (02) Capacidades */}
      <section className="page-container pb-20 sm:pb-28">
        <SectionHead index="02" title={t("academic.capabilities")} className="mb-12" />
        <motion.div
          variants={staggerContainer(0.08)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="grid gap-x-10 gap-y-14 sm:grid-cols-2"
        >
          {SKILLS.map((key, i) => (
            <motion.article key={key} variants={fadeUp} className="group">
              <Rule />
              <p className="label-mono pt-4 text-muted-foreground transition-colors group-hover:text-signal">{pad(i + 1)}</p>
              <h3 className="font-display mt-4 text-[clamp(1.6rem,2.6vw,2.4rem)] leading-[1.05]">{t(`skills.${key}`)}</h3>
              <p className="mt-4 max-w-md leading-relaxed text-muted-foreground">{t(`skills.${key}Desc`)}</p>
            </motion.article>
          ))}
        </motion.div>
      </section>

      {/* (03) Proyectos */}
      <section className="page-container pb-20 sm:pb-28">
        <SectionHead index="03" title={t("academic.featured")} aside={`${pad(PROJECTS.length)} ${t("academic.projects")}`} className="mb-6" />
        <IndexList
          size="md"
          rows={PROJECTS.map(({ id, key, meta }, i) => ({
            key: id,
            href: `/post/${id}`,
            index: pad(i + 1),
            title: t(`projects.${key}Title`),
            meta,
            image: cover(id),
          }))}
        />
      </section>

      {/* (04) Certificaciones */}
      <section className="page-container pb-20 sm:pb-28">
        <SectionHead index="04" title={t("academic.certifications")} aside={`${pad(CERTS.length)} ${t("academic.certs")}`} className="mb-6" />
        <motion.ul variants={staggerContainer(0.06)} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
          {CERTS.map(({ key, href, file }, i) => (
            <motion.li key={key} variants={fadeUp}>
              <a
                href={href}
                download={file}
                className="group relative grid grid-cols-12 items-baseline gap-x-4 border-t border-rock/50 py-6 outline-none sm:py-8"
              >
                <span aria-hidden className="absolute inset-0 -z-10 origin-bottom scale-y-0 bg-muted transition-transform duration-500 ease-out-expo group-hover:scale-y-100 group-focus-visible:scale-y-100" />
                <span className="label-mono col-span-2 text-muted-foreground transition-colors group-hover:text-signal sm:col-span-1">{pad(i + 1)}</span>
                <span className="col-span-10 sm:col-span-9">
                  <span className="font-display block text-[clamp(1.35rem,2.4vw,2rem)] leading-tight transition-transform duration-500 ease-out-expo group-hover:translate-x-2">
                    {t(`certs.${key}`)}
                  </span>
                  <span className="mt-2 block text-sm text-muted-foreground">{t(`certs.${key}Desc`)}</span>
                </span>
                <span className="label-mono col-span-10 col-start-3 mt-3 text-muted-foreground transition-colors group-hover:text-signal sm:col-span-2 sm:col-start-auto sm:mt-0 sm:text-right">
                  {t("academic.download")}
                </span>
              </a>
            </motion.li>
          ))}
        </motion.ul>
        <div className="border-t border-rock/50" />
      </section>

      {/* (05) Liderazgo */}
      <section className="page-container pb-24 sm:pb-32">
        <SectionHead index="05" title={t("academic.leadership")} className="mb-12" />
        <motion.div
          variants={staggerContainer(0.08)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="grid gap-x-10 gap-y-12 sm:grid-cols-2"
        >
          {[1, 2, 3, 4].map((n) => (
            <motion.div key={n} variants={fadeUp}>
              <Rule />
              <h3 className="mt-4 text-lg font-medium">{t(`leadership.role${n}`).replace(/:$/, "")}</h3>
              <p className="mt-2 max-w-md leading-relaxed text-muted-foreground">{t(`leadership.desc${n}`)}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </>
  );
}

/* ───────────── Trayectoria: panel fijo que cambia según la etapa que se está leyendo ───────────── */
function Timeline() {
  const { t } = useTranslation();
  const [active, setActive] = useState(0);
  const stage = STAGES[active];

  return (
    <div className="grid gap-x-12 lg:grid-cols-12">
      {/* Panel fijo (escritorio) */}
      <div className="hidden lg:col-span-5 lg:block">
        <div className="sticky top-28 pt-10">
          <p className="label-mono text-muted-foreground">
            {t("academic.chapter")} <span className="text-foreground">{pad(active + 1)}</span> / {pad(STAGES.length)}
          </p>
          <div className="relative mt-6 h-[clamp(8rem,15vw,14rem)] overflow-hidden">
            <AnimatePresence initial={false}>
              <motion.p
                key={active}
                className={cn(
                  "font-display absolute inset-x-0 bottom-0 leading-[0.85]", // apoyado sobre la franja, mida lo que mida el código
                  stage.code.length > 2 ? "text-[clamp(6rem,11vw,11rem)]" : "text-[clamp(8rem,16vw,15rem)]",
                )}
                initial={{ y: "100%" }}
                animate={{ y: "0%" }}
                exit={{ y: "-100%" }}
                transition={{ duration: 0.8, ease: easeOutExpo }}
              >
                {stage.code}
                {stage.current && <span className="text-signal">.</span>}
              </motion.p>
            </AnimatePresence>
          </div>
          <div className="relative mt-6 h-px bg-rock/70">
            <motion.div
              key={active}
              className="absolute left-0 top-[-1px] h-[3px] w-24 origin-left"
              style={{ backgroundImage: stripes(stage.flag) }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.9, ease: easeOutExpo, delay: 0.2 }}
            />
          </div>
          <dl className="label-mono mt-4 grid grid-cols-2 gap-4 text-muted-foreground">
            <div>
              <dt>Lat · Long</dt>
              <dd className="mt-1 text-foreground">{stage.coords}</dd>
            </div>
            <div>
              <dt>{t("ui.date")}</dt>
              <dd className="mt-1 text-foreground">{t(`academic.t${stage.n}Dates`)}</dd>
            </div>
          </dl>
          <div className="mt-8 flex gap-1.5">
            {STAGES.map((s, i) => (
              <span key={s.n} className={cn("h-px w-8 transition-colors duration-700", i === active ? "bg-signal" : "bg-rock")} />
            ))}
          </div>
        </div>
      </div>

      <ol className="lg:col-span-6 lg:col-start-7">
        {STAGES.map((s, i) => (
          <StageItem key={s.n} stage={s} active={i === active} onActive={() => setActive(i)} />
        ))}
      </ol>
    </div>
  );
}

function StageItem({ stage, active, onActive }: { stage: (typeof STAGES)[number]; active: boolean; onActive: () => void }) {
  const { t } = useTranslation();
  const ref = useRef<HTMLLIElement>(null);
  // Activa la etapa cuando cruza la franja central de la pantalla
  const inView = useInView(ref, { margin: "-45% 0px -45% 0px" });
  useEffect(() => { if (inView) onActive(); }, [inView, onActive]);

  return (
    <li
      ref={ref}
      className={cn(
        "border-t border-rock/50 py-12 transition-opacity duration-700 sm:py-16 lg:min-h-[52vh]",
        active ? "lg:opacity-100" : "lg:opacity-35",
      )}
    >
      <p className="label-mono flex items-center gap-2 text-muted-foreground">
        {stage.current && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-signal" />}
        <span className="text-foreground">{t(`academic.t${stage.n}Dates`)}</span>
        <span>·</span>
        <span>{t(`academic.t${stage.n}Place`)}</span>
      </p>
      <h3 className="font-display mt-6 text-[clamp(2rem,4vw,3.5rem)] leading-[1.02]">{t(`academic.t${stage.n}Title`)}</h3>
      <p className="mt-4 text-lg">{t(`academic.t${stage.n}Org`)}</p>
      <p className="mt-4 max-w-lg leading-relaxed text-muted-foreground">{t(`academic.t${stage.n}Desc`)}</p>
    </li>
  );
}
