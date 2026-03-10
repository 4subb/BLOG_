import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

export default function LanguageToggle() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    // Detecta el idioma actual y lo cambia al contrario
    const newLang = i18n.language.startsWith('es') ? 'en' : 'es';
    i18n.changeLanguage(newLang);
  };

  return (
    <div className="fixed top-20 right-4 z-50">
      <Button 
        onClick={toggleLanguage} 
        variant="outline" 
        size="sm" 
        className="bg-white shadow-md rounded-full text-slate-900 hover:bg-slate-100"
      >
         <Globe className="h-4 w-4 mr-2" />
         {i18n.language.startsWith('es') ? 'EN' : 'ES'}
      </Button>
    </div>
  );
}