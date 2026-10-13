import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function LanguageToggle() {
  const { i18n } = useTranslation();
  const isSpanish = i18n.language.startsWith("es");

  const toggleLanguage = () => {
    i18n.changeLanguage(isSpanish ? "en" : "es");
  };

  return (
    <Button
      onClick={toggleLanguage}
      variant="ghost"
      size="icon"
      className="w-9 overflow-hidden font-mono text-[11px] font-medium"
      aria-label={isSpanish ? "Switch to English" : "Cambiar a español"}
      data-testid="button-language-toggle"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isSpanish ? "es" : "en"}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -10, opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          {isSpanish ? "EN" : "ES"}
        </motion.span>
      </AnimatePresence>
    </Button>
  );
}
