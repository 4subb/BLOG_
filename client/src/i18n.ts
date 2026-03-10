import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      hero: {
        badge: "Professional Portfolio",
        greeting: "Hi, I'm",
        description: "Mechatronics Engineering student in final semester. Bridging the gap between advanced manufacturing, robotics, and software development. Available for a full-time international internship starting August 2026.",
        cv: "Download CV",
        contact: "Contact Me"
      },
      skills: {
        title: "Technical Skills",
        auto: "Automation & Robotics",
        autoDesc: "Siemens S7-1200 PLCs, TIA Portal, Fanuc LR Mate 200iD Robot Programming, ESP32.",
        hard: "Manufacturing & Metrology",
        hardDesc: "Mitsubishi CNC Milling, CHMER EDM, Precision Grinding, Mitutoyo Instruments. Tolerances up to ±0.03mm.",
        soft: "Software & Web Dev",
        softDesc: "Full-Stack Development (React, Node.js, PostgreSQL), IBM DB2 Database Administration.",
        manu: "Digital Manufacturing",
        manuDesc: "2D vector designs in Inkscape (Laser) and 3D CAD models in SolidWorks (Additive Manufacturing)."
      },
      projects: {
        title: "Featured Projects",
        viewDetails: "View Details",
        viewProject: "View Project",
        liveDemo: "Live Demo",
        p1Title: "EASYMOTION: Soft Robotics Crutch (EPS)",
        p1Desc: "Acted as Student Project Manager and Mechanical Co-designer for an international team in France. Directed project execution by developing the WBS and managed CAD integration.",
        p2Title: "Automated Laser Cutting Cell",
        p2Desc: "Project Manager & Documentation Lead. Upgraded a Two Trees TTS-20 Pro Max using an ESP32, NEMA 17 motors, and a modular Pass-Through design for continuous flow.",
        p3Title: "Advanced Precision Manufacturing",
        p3Desc: "Fabricate high-precision parts and industrial molds from scratch. Perform high-precision grinding ensuring strict quality control up to ±0.03mm tolerances."
      },
      edu: {
        title: "Education & Global Experience",
        itcTitle: "B.S. in Mechatronics Engineering",
        itcDesc: "Instituto Tecnológico de Celaya, Mexico | Expected May 2026. Final semester student. Active participant in research groups and student representation.",
        fraTitle: "European Project Semester (EPS)",
        fraDesc: "UTTOP/ENIT - Tarbes, France | Sep 2024 - Jan 2025. Achieved Grade A (17.03/20) in Communication. Developed a soft robotics crutch working alongside an international team.",
        argTitle: "PILA Academic Exchange Program",
        argDesc: "UNNE - Corrientes, Argentina | Aug - Dec 2025. Outstanding grades in Databases II (Distinguido 9) and Data Networks (Muy Bueno 8)."
      },
      certs: {
        title: "Certifications & Awards",
        toefl: "TOEFL ITP (Score: 553 / CEFR B2)",
        toeflDesc: "Professional working proficiency in English. ETS Certified.",
        ibm1: "IBM DB2 Database Administration",
        ibm1Desc: "Universidad Nacional del Nordeste. Advanced training in relational database management.",
        ibm2: "Intelligent Database Extraction",
        ibm2Desc: "Universidad Nacional del Nordeste. Specialized in intelligent data querying with IBM DB2."
      },
      leadership: {
        title: "Leadership & Experience",
        role1: "Precision Manufacturing Apprentice:",
        desc1: "Operate Mitsubishi CNC machines and CHMER EDM for corporate clients in a high-pressure environment.",
        role2: "University Councilor:",
        desc2: "Represented the student body and organized cultural/academic events within the university community.",
        role3: "UAV Maintenance Technician:",
        desc3: "Provided technical support and preventive maintenance for a fleet of heavy-duty agricultural drones.",
        role4: "Digital Manufacturer Founder:",
        desc4: "Manage an independent 3D printing and laser cutting business, leading the end-to-end manufacturing process."
      },
      footer: {
        subtitle: "Mechatronics Engineering student. Bridging the gap between hardware and software.",
        sectionsTitle: "Sections",
        engineering: "Engineering",
        sports: "Sports",
        travel: "Travel",
        connectTitle: "Connect",
        rights: "All rights reserved."
      },
      blog: {
        explore: "Explore Sections",
        exploreDesc: "Discover content organized by topics.",
        latest: "Latest Posts",
        loading: "Loading...",
        empty: "Empty...",
        engTitle: "Engineering",
        engDesc: "Innovation & code.",
        sportsTitle: "Sports",
        sportsDesc: "F1, Tennis & Cycling.",
        travelTitle: "Travel",
        travelDesc: "Adventures around the world."
      },
      pages: {
        engTitle: "Engineering",
        engSubtitle: "Projects, code, and technical documentation",
        sportsTitle: "Sports",
        sportsSubtitle: "Cycling, Tennis and Formula One",
        travelTitle: "Travel & Photography",
        travelSubtitle: "Adventures, amazing destinations and world chronicles"
      }
    }
  },
  es: {
    translation: {
      hero: {
        badge: "Portafolio Profesional",
        greeting: "Hola, soy",
        description: "Estudiante de Ingeniería Mecatrónica en último semestre. Conectando la manufactura avanzada, robótica y desarrollo de software. Disponible para residencia profesional internacional a tiempo completo a partir de agosto de 2026.",
        cv: "Descargar CV",
        contact: "Contáctame"
      },
      skills: {
        title: "Habilidades Técnicas",
        auto: "Automatización y Robótica",
        autoDesc: "PLCs Siemens S7-1200, TIA Portal, Programación de Robots Fanuc LR Mate 200iD, ESP32.",
        hard: "Manufactura y Metrología",
        hardDesc: "Fresado CNC Mitsubishi, Electroerosión CHMER, Rectificado de Precisión. Tolerancias de hasta ±0.03mm.",
        soft: "Software y Desarrollo Web",
        softDesc: "Desarrollo Full-Stack (React, Node.js, PostgreSQL), Administración de Bases de Datos IBM DB2.",
        manu: "Manufactura Digital",
        manuDesc: "Diseños vectoriales 2D en Inkscape (Láser) y modelos CAD 3D en SolidWorks (Manufactura Aditiva)."
      },
      projects: {
        title: "Proyectos Destacados",
        viewDetails: "Ver Detalles",
        viewProject: "Ver Proyecto",
        liveDemo: "Ver Demo",
        p1Title: "EASYMOTION: Muleta de Robótica Blanda (EPS)",
        p1Desc: "Project Manager Estudiantil y Co-diseñador Mecánico para un equipo internacional en Francia. Dirigí la ejecución desarrollando la WBS y gestioné la integración CAD.",
        p2Title: "Celda Automatizada de Corte Láser",
        p2Desc: "Project Manager. Actualización de una cortadora Two Trees mediante un ESP32, motores NEMA 17 y un diseño Pass-Through modular para flujo continuo.",
        p3Title: "Manufactura de Alta Precisión",
        p3Desc: "Fabricación de piezas y moldes industriales. Rectificado de alta precisión asegurando un estricto control de calidad con tolerancias de hasta ±0.03mm."
      },
      edu: {
        title: "Educación y Experiencia Global",
        itcTitle: "Ingeniería Mecatrónica",
        itcDesc: "Instituto Tecnológico de Celaya, México | Esperado Mayo 2026. Estudiante de último semestre. Participante activo en representación estudiantil.",
        fraTitle: "European Project Semester (EPS)",
        fraDesc: "UTTOP/ENIT - Tarbes, Francia | Sep 2024 - Ene 2025. Calificación A (17.03/20) en Comunicación. Desarrollo de muleta de robótica blanda con equipo internacional.",
        argTitle: "Intercambio Académico PILA",
        argDesc: "UNNE - Corrientes, Argentina | Ago - Dic 2025. Calificaciones sobresalientes en Bases de Datos II (Distinguido 9) y Redes de Datos (Muy Bueno 8)."
      },
      certs: {
        title: "Certificaciones y Reconocimientos",
        toefl: "TOEFL ITP (Puntaje: 553 / CEFR B2)",
        toeflDesc: "Competencia profesional en el idioma inglés. Certificado por ETS.",
        ibm1: "IBM DB2 Database Administration",
        ibm1Desc: "Universidad Nacional del Nordeste. Formación avanzada en gestión de bases de datos relacionales.",
        ibm2: "Intelligent Database Extraction",
        ibm2Desc: "Universidad Nacional del Nordeste. Especialización en consulta inteligente de datos con IBM DB2."
      },
      leadership: {
        title: "Liderazgo y Experiencia",
        role1: "Aprendiz de Manufactura de Precisión:",
        desc1: "Operación de fresadoras CNC Mitsubishi y EDM CHMER para clientes corporativos bajo alta presión.",
        role2: "Consejero Universitario:",
        desc2: "Representante del cuerpo estudiantil y organizador de eventos culturales/académicos en la universidad.",
        role3: "Mantenimiento de Drones (UAV):",
        desc3: "Soporte técnico y mantenimiento preventivo para una flota de drones agrícolas de uso rudo.",
        role4: "Fundador de Manufactura Digital:",
        desc4: "Gestión de un negocio independiente de impresión 3D y corte láser, liderando todo el proceso de fabricación."
      },
      footer: {
        subtitle: "Estudiante de Ingeniería Mecatrónica. Conectando el mundo del hardware y el software.",
        sectionsTitle: "Secciones",
        engineering: "Ingeniería",
        sports: "Deportes",
        travel: "Viajes",
        connectTitle: "Conecta",
        rights: "Todos los derechos reservados."
      },
      blog: {
        explore: "Explora las Secciones",
        exploreDesc: "Descubre contenido organizado por temas.",
        latest: "Últimas Publicaciones",
        loading: "Cargando...",
        empty: "Vacío...",
        engTitle: "Ingeniería",
        engDesc: "Innovación y código.",
        sportsTitle: "Deportes",
        sportsDesc: "F1, Tenis y Ciclismo.",
        travelTitle: "Viajes",
        travelDesc: "Aventuras por el mundo."
      },
      pages: {
        engTitle: "Ingeniería",
        engSubtitle: "Proyectos, código y documentación técnica",
        sportsTitle: "Deportes",
        sportsSubtitle: "Ciclismo, Tenis y Fórmula Uno",
        travelTitle: "Viajes y Fotografía",
        travelSubtitle: "Aventuras, destinos increíbles y crónicas del mundo"
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: { escapeValue: false }
  });

export default i18n;