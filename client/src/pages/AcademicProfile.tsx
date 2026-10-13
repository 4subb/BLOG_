import { Link } from "wouter";
import { useTranslation } from "react-i18next"; 
import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { 
  Github, Linkedin, Mail, FileText, Code, Database, ExternalLink,
  Wrench, Globe, Award, Server, Users, Camera 
} from "lucide-react";

import miFoto from "@/assets/perfil.jpg";
import { MagneticParticles } from "@/components/magic/MagneticParticles";
import { BorderGlowCard } from "@/components/magic/BorderGlowCard";
import { BounceCards } from "@/components/magic/BounceCards";
import ScrollExpand from "@/components/magic/ScrollExpand";
import { TravelCarousel, TravelCard } from "@/components/magic/TravelCarousel";

export default function Portfolio() {
  const { t } = useTranslation(); 
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // --- SLIDE TIMINGS (6 Slides Total) ---
  
  // SLIDE 1: Hero (0 to 0.16)
  const heroOpacity = useTransform(scrollYProgress, [0, 0.1, 0.16], [1, 1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.16], [0, -100]);
  const heroPointerEvents = useTransform(scrollYProgress, [0, 0.1], ["auto", "none"]);

  // SLIDE 2: Skills (0.1 to 0.33)
  const skillsOpacity = useTransform(scrollYProgress, [0.1, 0.16, 0.26, 0.33], [0, 1, 1, 0]);
  const skillsScale = useTransform(scrollYProgress, [0.1, 0.16, 0.26, 0.33], [0.8, 1, 1, 1.1]);
  const skillsPointerEvents = useTransform(scrollYProgress, [0.1, 0.16, 0.26, 0.33], ["none", "auto", "auto", "none"]);

  // SLIDE 3: Projects (0.26 to 0.5)
  const projectsOpacity = useTransform(scrollYProgress, [0.26, 0.33, 0.43, 0.5], [0, 1, 1, 0]);
  const projectsY = useTransform(scrollYProgress, [0.26, 0.33, 0.43, 0.5], [100, 0, 0, -100]);
  const projectsPointerEvents = useTransform(scrollYProgress, [0.26, 0.33, 0.43, 0.5], ["none", "auto", "auto", "none"]);

  // SLIDE 4: Education (0.43 to 0.66)
  const eduOpacity = useTransform(scrollYProgress, [0.43, 0.5, 0.6, 0.66], [0, 1, 1, 0]);
  const eduScale = useTransform(scrollYProgress, [0.43, 0.5, 0.6, 0.66], [0.8, 1, 1, 1.1]);
  const eduPointerEvents = useTransform(scrollYProgress, [0.43, 0.5, 0.6, 0.66], ["none", "auto", "auto", "none"]);

  // SLIDE 5: Certifications & Leadership (0.6 to 0.83)
  const certsOpacity = useTransform(scrollYProgress, [0.6, 0.66, 0.76, 0.83], [0, 1, 1, 0]);
  const certsY = useTransform(scrollYProgress, [0.6, 0.66, 0.76, 0.83], [100, 0, 0, -100]);
  const certsPointerEvents = useTransform(scrollYProgress, [0.6, 0.66, 0.76, 0.83], ["none", "auto", "auto", "none"]);

  // SLIDE 6: Photography / Gallery (0.76 to 0.87)
  const photoOpacity = useTransform(scrollYProgress, [0.76, 0.83, 0.86, 0.87], [0, 1, 1, 0]);
  const photoY = useTransform(scrollYProgress, [0.76, 0.83, 0.86, 0.87], [100, 0, 0, -80]);
  const photoPointerEvents = useTransform(scrollYProgress, [0.76, 0.83, 0.86, 0.87], ["none", "auto", "auto", "none"]);

  // SLIDE 7: Travel Cards Carousel (0.86 to 1.0)
  const travelOpacity = useTransform(scrollYProgress, [0.86, 0.92, 1], [0, 1, 1]);
  const travelY = useTransform(scrollYProgress, [0.86, 0.92], [80, 0]);
  const travelPointerEvents = useTransform(scrollYProgress, [0.86, 0.92], ["none", "auto"]);

  // Sample placeholder images for the BounceCards
  const galleryImages = [
    "https://images.unsplash.com/photo-1506744626753-1fa44df14c28?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1449034446853-66c86144b0ad?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1494548162494-384bba4ab999?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=600&auto=format&fit=crop",
  ];

  // Travel cards data
  const travelCards: TravelCard[] = [
    {
      image: "https://images.unsplash.com/photo-1506744626753-1fa44df14c28?q=80&w=1200&auto=format&fit=crop",
      tag: "Naturaleza • Argentina",
      title: "Patagonia — La frontera del mundo",
      description: "Explorando la inmensidad del sur argentino: glaciares, montañas y silencio. Un viaje de residencia profesional que se convirtió en la aventura de mi vida.",
      location: "Patagonia, Argentina",
    },
    {
      image: "https://images.unsplash.com/photo-1449034446853-66c86144b0ad?q=80&w=1200&auto=format&fit=crop",
      tag: "Ciudad • USA",
      title: "San Francisco — Capital tecnológica",
      description: "Recorriendo la bahía, el puente Golden Gate y el corazón de Silicon Valley durante mi intercambio académico. Donde el futuro ya es presente.",
      location: "San Francisco, California",
    },
    {
      image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1200&auto=format&fit=crop",
      tag: "Aventura • México",
      title: "Sierra Gorda — Biodiversidad en cada rincón",
      description: "Un fin de semana fuera del campus que descubrió cañadas, cascadas y comunidades indígenas a pocas horas de Celaya, Guanajuato.",
      location: "Querétaro, México",
    },
    {
      image: "https://images.unsplash.com/photo-1494548162494-384bba4ab999?q=80&w=1200&auto=format&fit=crop",
      tag: "Cultura • México",
      title: "Amanecer en Guanajuato",
      description: "Callejones de colores, momias y la Alhóndiga. La ciudad más hermosa del Bajío vista desde los miradores al amanecer antes de ir a clases.",
      location: "Guanajuato, México",
    },
    {
      image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1200&auto=format&fit=crop",
      tag: "Descanso • México",
      title: "Valle de Bravo — Agua y montañas",
      description: "Un lago rodeado de bosques de pino donde el tiempo se detiene. Escapada entre semestres para recargar energías y desconectar del código.",
      location: "Valle de Bravo, Estado de México",
    },
  ];

  return (
    <div className="bg-background relative">

      {/* 700vh = 7 cinematic slides */}
      <div ref={containerRef} className="h-[700vh] relative w-full">
        
        <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
          
          {/* 🪄 Interactive Magnetic Particles Background */}
          <MagneticParticles
            particleCount={90}
            interactionRadius={180}
            repelStrength={7}
            connectionDistance={150}
          />

          {/* SLIDE 1: Hero */}
          <motion.section 
            style={{ opacity: heroOpacity, y: heroY, pointerEvents: heroPointerEvents as any }} 
            className="absolute inset-0 z-10 flex items-center justify-center px-6 pt-20 pb-6"
          >
            <div className="container mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-10 w-full">
              <div className="flex-1 space-y-5 text-center md:text-left">
                <h2 className="text-primary font-bold tracking-widest uppercase text-sm flex items-center justify-center md:justify-start gap-2 mt-8">
                  <Globe className="h-4 w-4" /> {t('hero.badge')}
                </h2>
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold font-heading leading-tight tracking-tighter">
                  {t('hero.greeting')} <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
                    José Ángel Subías
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed mx-auto md:mx-0">
                  {t('hero.description')}
                </p>
                
                <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-4">
                  <a href="/Jose_Angel_Subias_Resume_2026.pdf" download="Jose_Angel_CV.pdf">
                    <Button size="lg" className="gap-2 rounded-full px-8">
                      <FileText className="h-5 w-5" /> {t('hero.cv')}
                    </Button>
                  </a>
                  <a href="mailto:21030382@itcelaya.edu.mx">
                    <Button size="lg" variant="outline" className="gap-2 rounded-full px-8 backdrop-blur-md bg-background/50">
                      <Mail className="h-5 w-5" /> {t('hero.contact')}
                    </Button>
                  </a>
                </div>

                <div className="flex justify-center md:justify-start gap-6 pt-4 text-muted-foreground">
                  <a href="https://github.com/4subb/BLOG_" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors p-2 rounded-full hover:bg-primary/10"><Github className="h-6 w-6" /></a>
                  <a href="https://www.linkedin.com/in/jos%C3%A9-%C3%A1ngel-sub%C3%ADas-tovar-a74874278/" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors p-2 rounded-full hover:bg-primary/10"><Linkedin className="h-6 w-6" /></a>
                </div>
              </div>
              
              {/* ScrollExpand photo — small frame that expands to full image on scroll */}
              <div className="w-64 h-72 md:w-80 md:h-96 shrink-0">
                <ScrollExpand
                  src={miFoto}
                  alt={t('hero.greeting')}
                  title={t('hero.scrollReveal')}
                  scrollHint=""
                  startWidth={55}
                  startHeight={55}
                  startRadius={20}
                  endRadius={6}
                  mediaZoom={1.2}
                  scrollDistance={0.9}
                  holdDistance={0.2}
                  smoothing={0.12}
                  overlayScrim={0.3}
                  useWindowScroll={false}
                  style={{ width: '100%', height: '100%' }}
                />
              </div>
            </div>
          </motion.section>

          {/* SLIDE 2: Skills */}
          <motion.section 
            style={{ opacity: skillsOpacity, scale: skillsScale, pointerEvents: skillsPointerEvents as any }} 
            className="absolute inset-0 z-20 flex flex-col items-center justify-center px-4 pt-16"
          >
            <div className="container mx-auto max-w-5xl">
              <div className="text-center mb-12">
                <Wrench className="text-primary h-12 w-12 mx-auto mb-4 opacity-80" />
                <h2 className="text-4xl md:text-5xl font-bold font-heading text-foreground tracking-tight">
                  {t('skills.title')}
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <BorderGlowCard glowColor="hsl(var(--primary))">
                  <h3 className="text-xl font-bold border-b border-border/50 pb-2 mb-4">{t('skills.auto')}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t('skills.autoDesc')}</p>
                </BorderGlowCard>

                <BorderGlowCard glowColor="hsl(var(--primary))">
                  <h3 className="text-xl font-bold border-b border-border/50 pb-2 mb-4">{t('skills.hard')}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t('skills.hardDesc')}</p>
                </BorderGlowCard>

                <BorderGlowCard glowColor="hsl(var(--primary))">
                  <h3 className="text-xl font-bold border-b border-border/50 pb-2 mb-4">{t('skills.soft')}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t('skills.softDesc')}</p>
                </BorderGlowCard>

                <BorderGlowCard glowColor="hsl(var(--primary))">
                  <h3 className="text-xl font-bold border-b border-border/50 pb-2 mb-4">{t('skills.manu')}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t('skills.manuDesc')}</p>
                </BorderGlowCard>
              </div>
            </div>
          </motion.section>

          {/* SLIDE 3: Projects */}
          <motion.section 
            style={{ opacity: projectsOpacity, y: projectsY, pointerEvents: projectsPointerEvents as any }} 
            className="absolute inset-0 z-30 flex flex-col items-center justify-center px-4 pt-16"
          >
            <div className="container mx-auto max-w-6xl">
              <div className="text-center mb-12">
                <Code className="text-primary h-12 w-12 mx-auto mb-4 opacity-80" />
                <h2 className="text-4xl md:text-5xl font-bold font-heading text-foreground tracking-tight">
                  {t('projects.title')}
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <BorderGlowCard className="flex flex-col h-[350px]">
                  <h3 className="text-2xl font-bold mb-4">{t('projects.p1Title')}</h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed flex-1">{t('projects.p1Desc')}</p>
                  <Link href="/post/538e2184-a1e1-4183-8e81-e934917b5df6">
                    <Button variant="outline" className="gap-2 w-full backdrop-blur-md bg-background/50"><ExternalLink className="h-4 w-4" /> {t('projects.viewDetails')}</Button>
                  </Link>
                </BorderGlowCard>

                <BorderGlowCard className="flex flex-col h-[350px]">
                  <h3 className="text-2xl font-bold mb-4">{t('projects.p2Title')}</h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed flex-1">{t('projects.p2Desc')}</p>
                  <Link href="/post/3af569c4-9866-4485-9d26-8c4ea0489743">
                    <Button variant="outline" className="gap-2 w-full backdrop-blur-md bg-background/50"><ExternalLink className="h-4 w-4" /> {t('projects.viewProject')}</Button>
                  </Link>
                </BorderGlowCard>

                <BorderGlowCard className="flex flex-col h-[350px]">
                  <h3 className="text-2xl font-bold mb-4">{t('projects.p3Title')}</h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed flex-1">{t('projects.p3Desc')}</p>
                  <Link href="/post/802be6cd-ba91-4367-93e2-653e204ba3e6">
                    <Button variant="outline" className="gap-2 w-full backdrop-blur-md bg-background/50"><ExternalLink className="h-4 w-4" /> {t('projects.liveDemo')}</Button>
                  </Link>
                </BorderGlowCard>
              </div>
            </div>
          </motion.section>

          {/* SLIDE 4: Education */}
          <motion.section 
            style={{ opacity: eduOpacity, scale: eduScale, pointerEvents: eduPointerEvents as any }} 
            className="absolute inset-0 z-40 flex flex-col items-center justify-center px-4 pt-16"
          >
            <div className="container mx-auto max-w-4xl">
              <div className="text-center mb-12">
                <Database className="text-primary h-12 w-12 mx-auto mb-4 opacity-80" />
                <h2 className="text-4xl md:text-5xl font-bold font-heading text-foreground tracking-tight">
                  {t('edu.title')}
                </h2>
              </div>
              
              <div className="space-y-6">
                <BorderGlowCard className="border-l-4 border-l-primary" glowColor="hsl(var(--primary))">
                  <h3 className="text-2xl font-bold mb-2">{t('edu.itcTitle')}</h3>
                  <p className="text-muted-foreground">{t('edu.itcDesc')}</p>
                </BorderGlowCard>
                <BorderGlowCard className="border-l-4 border-l-primary/60" glowColor="hsl(var(--primary))">
                  <h3 className="text-2xl font-bold mb-2">{t('edu.fraTitle')}</h3>
                  <p className="text-muted-foreground">{t('edu.fraDesc')}</p>
                </BorderGlowCard>
                <BorderGlowCard className="border-l-4 border-l-muted-foreground" glowColor="hsl(var(--muted-foreground))">
                  <h3 className="text-2xl font-bold mb-2">{t('edu.argTitle')}</h3>
                  <p className="text-muted-foreground">{t('edu.argDesc')}</p>
                </BorderGlowCard>
              </div>
            </div>
          </motion.section>

          {/* SLIDE 5: Certifications & Leadership */}
          <motion.section 
            style={{ opacity: certsOpacity, y: certsY, pointerEvents: certsPointerEvents as any }} 
            className="absolute inset-0 z-50 flex flex-col items-center justify-center px-4 pt-20 pb-6"
          >
            <div className="container mx-auto max-w-6xl w-full">
              
              <div className="mb-16">
                <div className="text-center mb-12">
                  <Award className="text-primary h-12 w-12 mx-auto mb-4 opacity-80" />
                  <h2 className="text-4xl md:text-5xl font-bold font-heading text-foreground tracking-tight">
                    {t('certs.title')}
                  </h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <a href="/TOEFL ITP.pdf" download="Jose_Angel_TOEFL ITP.pdf" className="block h-full cursor-pointer">
                    <BorderGlowCard className="group h-full hover:-translate-y-2 transition-transform duration-500">
                      <Award className="h-10 w-10 text-primary mb-6 group-hover:scale-110 transition-transform" />
                      <h3 className="text-xl font-bold text-foreground mb-3">{t('certs.toefl')}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{t('certs.toeflDesc')}</p>
                    </BorderGlowCard>
                  </a>

                  <a href="/IBM DB2 Database Administration.pdf" download="Jose_Angel_IBM_Administration.pdf" className="block h-full cursor-pointer">
                    <BorderGlowCard className="group h-full hover:-translate-y-2 transition-transform duration-500">
                      <Database className="h-10 w-10 text-primary/80 mb-6 group-hover:scale-110 transition-transform" />
                      <h3 className="text-xl font-bold text-foreground mb-3">{t('certs.ibm1')}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{t('certs.ibm1Desc')}</p>
                    </BorderGlowCard>
                  </a>

                  <a href="/Intelligent Database Extraction with IBM DB2.pdf" download="Jose_Angel_IBM_Extraction.pdf" className="block h-full cursor-pointer">
                    <BorderGlowCard className="group h-full hover:-translate-y-2 transition-transform duration-500">
                      <Server className="h-10 w-10 text-muted-foreground mb-6 group-hover:scale-110 transition-transform" />
                      <h3 className="text-xl font-bold text-foreground mb-3">{t('certs.ibm2')}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{t('certs.ibm2Desc')}</p>
                    </BorderGlowCard>
                  </a>
                </div>
              </div>

              <div className="pt-10 border-t border-border/50">
                <div className="text-center mb-8">
                  <Users className="text-primary h-12 w-12 mx-auto mb-4 opacity-80" />
                  <h2 className="text-3xl font-bold font-heading text-foreground tracking-tight">
                    {t('leadership.title')}
                  </h2>
                </div>
                
                <BorderGlowCard glowColor="hsl(var(--primary))">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-muted-foreground">
                    <ul className="list-disc list-inside space-y-4">
                      <li><strong className="text-foreground">{t('leadership.role1')}</strong> {t('leadership.desc1')}</li>
                      <li><strong className="text-foreground">{t('leadership.role2')}</strong> {t('leadership.desc2')}</li>
                    </ul>
                    <ul className="list-disc list-inside space-y-4">
                      <li><strong className="text-foreground">{t('leadership.role3')}</strong> {t('leadership.desc3')}</li>
                      <li><strong className="text-foreground">{t('leadership.role4')}</strong> {t('leadership.desc4')}</li>
                    </ul>
                  </div>
                </BorderGlowCard>
              </div>

            </div>
          </motion.section>

          {/* SLIDE 6: Photography & Gallery using BounceCards */}
          <motion.section 
            style={{ opacity: photoOpacity, y: photoY, pointerEvents: photoPointerEvents as any }} 
            className="absolute inset-0 z-50 flex flex-col items-center justify-center px-4 pt-16"
          >
            <div className="container mx-auto max-w-6xl flex flex-col items-center">
              <div className="text-center mb-16">
                <Camera className="text-primary h-12 w-12 mx-auto mb-4 opacity-80" />
                <h2 className="text-4xl md:text-5xl font-bold font-heading text-foreground tracking-tight">
                  Viajes y Fotografía
                </h2>
                <p className="text-muted-foreground mt-4 text-lg">Hover to reveal the memories</p>
              </div>
              
              <div className="w-full flex justify-center pb-20">
                <BounceCards images={galleryImages} />
              </div>

              <Link href="/viajes">
                <Button size="lg" className="rounded-full mt-10">
                  Explorar la Galería Completa
                </Button>
              </Link>
            </div>
          </motion.section>

          {/* SLIDE 7: Travel Cards Carousel */}
          <motion.section
            style={{ opacity: travelOpacity, y: travelY, pointerEvents: travelPointerEvents as any }}
            className="absolute inset-0 z-50 flex flex-col justify-center px-6 pt-20 pb-10"
          >
            <div className="container mx-auto max-w-6xl w-full">
              <div className="flex items-end justify-between mb-8">
                <div>
                  <h2 className="text-4xl md:text-5xl font-bold font-heading text-foreground tracking-tight">
                    Mis Viajes
                  </h2>
                  <p className="text-muted-foreground mt-2 text-base">
                    Cada destino, una historia que vale la pena contar.
                  </p>
                </div>
                <Link href="/viajes">
                  <Button variant="outline" className="rounded-full gap-2 backdrop-blur-md bg-background/50">
                    <Camera className="h-4 w-4" /> Ver todos
                  </Button>
                </Link>
              </div>

              <TravelCarousel
                cards={travelCards}
                sectionTitle="Viajes • Experiencias • Fotografía"
              />
            </div>
          </motion.section>

        </div>
      </div>

    </div>
  );
}