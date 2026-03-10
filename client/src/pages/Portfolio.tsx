import { Link } from "wouter";
import { useTranslation } from "react-i18next"; 
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { 
  Github, Linkedin, Mail, FileText, Code, Database, ExternalLink,
  Wrench, Globe, Award, Server, Users 
} from "lucide-react";

import miFoto from "@/assets/perfil.png";

export default function Portfolio() {
  // 🗑️ LIMPIEZA: Quitamos 'i18n' y la función 'toggleLanguage' porque ya están en tu componente global
  const { t } = useTranslation(); 

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="bg-slate-900 text-white py-20 px-4">
          <div className="container mx-auto max-w-5xl flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1 space-y-6 text-center md:text-left">
              <h2 className="text-primary font-bold tracking-widest uppercase text-sm flex items-center justify-center md:justify-start gap-2">
                <Globe className="h-4 w-4" /> {t('hero.badge')}
              </h2>
              <h1 className="text-5xl md:text-7xl font-bold font-heading leading-tight">
                {t('hero.greeting')} <span className="text-blue-400">José Ángel Subías</span>
              </h1>
              <p className="text-xl text-slate-300 max-w-2xl leading-relaxed">
                {t('hero.description')}
              </p>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-4">
                <a href="/CV.pdf" download="Jose_Angel_CV.pdf">
                  <Button className="bg-blue-500 hover:bg-blue-600 text-white gap-2">
                    <FileText className="h-4 w-4" /> {t('hero.cv')}
                  </Button>
                </a>
                
                <a href="mailto:21030382@itcelaya.edu.mx">
                  <Button variant="outline" className="text-white border-white hover:bg-white/10 gap-2">
                    <Mail className="h-4 w-4" /> {t('hero.contact')}
                  </Button>
                </a>
              </div>

              <div className="flex justify-center md:justify-start gap-6 pt-6 text-slate-400">
                <a href="https://github.com/4subb/BLOG_" target="_blank" rel="noreferrer" className="hover:text-white transition-colors"><Github className="h-6 w-6" /></a>
                <a href="https://www.linkedin.com/in/jos%C3%A9-%C3%A1ngel-sub%C3%ADas-tovar-a74874278/" target="_blank" rel="noreferrer" className="hover:text-white transition-colors"><Linkedin className="h-6 w-6" /></a>
              </div>
            </div>
            
            <div className="w-64 h-64 md:w-80 md:h-80 rounded-full border-4 border-slate-700 overflow-hidden shadow-2xl bg-slate-800 shrink-0">
              <img src={miFoto} alt="José Ángel Subías Tovar" className="w-full h-full object-cover" />
            </div>
          </div>
        </section>

        {/* TECHNICAL SKILLS */}
        <section className="py-16 px-4 bg-slate-100 border-b border-slate-200">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-3xl font-bold font-heading mb-8 text-slate-900 flex items-center gap-3">
              <Wrench className="text-blue-500" /> {t('skills.title')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-800 mb-3 border-b pb-2">{t('skills.auto')}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{t('skills.autoDesc')}</p>
              </div>
              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-800 mb-3 border-b pb-2">{t('skills.hard')}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{t('skills.hardDesc')}</p>
              </div>
              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-800 mb-3 border-b pb-2">{t('skills.soft')}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{t('skills.softDesc')}</p>
              </div>
              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-800 mb-3 border-b pb-2">{t('skills.manu')}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{t('skills.manuDesc')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURED PROJECTS */}
        <section className="py-20 px-4 bg-white">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-3xl font-bold font-heading mb-12 text-slate-900 flex items-center gap-3">
              <Code className="text-blue-500" /> {t('projects.title')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* ➕ MEJORA: Agregamos Link al proyecto 1 y animaciones 'hover:-translate-y-1' a las tarjetas */}
              <div className="border border-slate-200 rounded-xl p-6 shadow-sm bg-slate-50 flex flex-col hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                <h3 className="text-2xl font-bold mb-3 text-slate-900">{t('projects.p1Title')}</h3>
                <p className="text-slate-600 mb-6 leading-relaxed flex-1">{t('projects.p1Desc')}</p>
                {/* 👇 AQUI FALTA TU LINK AL POST DE LA MULETA CUANDO LO CRIES 👇 */}
                <Link href="/post/ID_DEL_POST_MULETA">
                  <Button variant="outline" className="gap-2 w-full sm:w-auto"><ExternalLink className="h-4 w-4" /> {t('projects.viewDetails')}</Button>
                </Link>
              </div>

              <div className="border border-slate-200 rounded-xl p-6 shadow-sm bg-slate-50 flex flex-col hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                <h3 className="text-2xl font-bold mb-3 text-slate-900">{t('projects.p2Title')}</h3>
                <p className="text-slate-600 mb-6 leading-relaxed flex-1">{t('projects.p2Desc')}</p>
                <Link href="/post/ff6720b2-1340-46ba-ba8b-095a1a7ade15">
                  <Button variant="outline" className="gap-2 w-full sm:w-auto"><ExternalLink className="h-4 w-4" /> {t('projects.viewProject')}</Button>
                </Link>
              </div>

              <div className="border border-slate-200 rounded-xl p-6 shadow-sm bg-slate-50 flex flex-col md:col-span-2 lg:col-span-1 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                <h3 className="text-2xl font-bold mb-3 text-slate-900">{t('projects.p3Title')}</h3>
                <p className="text-slate-600 mb-6 leading-relaxed flex-1">{t('projects.p3Desc')}</p>
                <Link href="/blog">
                  <Button variant="outline" className="gap-2 w-full sm:w-auto"><ExternalLink className="h-4 w-4" /> {t('projects.liveDemo')}</Button>
                </Link>
              </div>

            </div>
          </div>
        </section>

        {/* EDUCATION & GLOBAL EXPERIENCE */}
        <section className="py-20 px-4 bg-slate-50 border-t border-slate-200">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-3xl font-bold font-heading mb-12 text-slate-900 flex items-center gap-3">
              <Database className="text-blue-500" /> {t('edu.title')}
            </h2>
            <div className="space-y-6">
              <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-blue-500"></div>
                <h3 className="text-2xl font-bold text-slate-900">{t('edu.itcTitle')}</h3>
                <p className="text-slate-600 mt-2">{t('edu.itcDesc')}</p>
              </div>
              <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500"></div>
                <h3 className="text-2xl font-bold text-slate-900">{t('edu.fraTitle')}</h3>
                <p className="text-slate-600 mt-2">{t('edu.fraDesc')}</p>
              </div>
              <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-cyan-500"></div>
                <h3 className="text-2xl font-bold text-slate-900">{t('edu.argTitle')}</h3>
                <p className="text-slate-600 mt-2">{t('edu.argDesc')}</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* CERTIFICATIONS & AWARDS */}
        <section className="py-20 px-4 bg-white border-t border-slate-200">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-3xl font-bold font-heading mb-12 text-slate-900 flex items-center gap-3">
              <Award className="text-blue-500" /> {t('certs.title')}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border border-slate-200 p-6 rounded-xl shadow-sm bg-slate-50 hover:border-blue-300 hover:-translate-y-1 hover:shadow-md transition-all duration-300 group">
                <Award className="h-8 w-8 text-blue-500 mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">{t('certs.toefl')}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{t('certs.toeflDesc')}</p>
              </div>

              <div className="border border-slate-200 p-6 rounded-xl shadow-sm bg-slate-50 hover:border-indigo-300 hover:-translate-y-1 hover:shadow-md transition-all duration-300 group">
                <Database className="h-8 w-8 text-indigo-500 mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">{t('certs.ibm1')}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{t('certs.ibm1Desc')}</p>
              </div>

              <div className="border border-slate-200 p-6 rounded-xl shadow-sm bg-slate-50 hover:border-cyan-300 hover:-translate-y-1 hover:shadow-md transition-all duration-300 group">
                <Server className="h-8 w-8 text-cyan-500 mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">{t('certs.ibm2')}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{t('certs.ibm2Desc')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* LEADERSHIP SECTION */}
        <section className="py-20 px-4 bg-slate-50 border-t border-slate-200">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-3xl font-bold font-heading mb-12 text-slate-900 flex items-center gap-3">
              <Users className="text-blue-500" /> {t('leadership.title')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-slate-700">
              <ul className="list-disc list-inside space-y-4">
                <li><strong className="text-slate-900">{t('leadership.role1')}</strong> {t('leadership.desc1')}</li>
                <li><strong className="text-slate-900">{t('leadership.role2')}</strong> {t('leadership.desc2')}</li>
              </ul>
              <ul className="list-disc list-inside space-y-4">
                <li><strong className="text-slate-900">{t('leadership.role3')}</strong> {t('leadership.desc3')}</li>
                <li><strong className="text-slate-900">{t('leadership.role4')}</strong> {t('leadership.desc4')}</li>
              </ul>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}