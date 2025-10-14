import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

interface CountryFilterProps {
  countries: string[];
  selectedCountry: string | null;
  onSelectCountry: (country: string | null) => void;
}

export default function CountryFilter({ countries, selectedCountry, onSelectCountry }: CountryFilterProps) {
  return (
    <Card className="p-4">
      <h3 className="text-lg font-heading font-semibold mb-4 flex items-center gap-2" data-testid="text-filter-title">
        <Globe className="h-5 w-5" />
        Filtrar por País
      </h3>
      <div className="space-y-1">
        <Button
          variant={selectedCountry === null ? "secondary" : "ghost"}
          className="w-full justify-start"
          onClick={() => onSelectCountry(null)}
          data-testid="button-filter-all"
        >
          Todos los países
        </Button>
        {countries.map((country) => (
          <Button
            key={country}
            variant={selectedCountry === country ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => onSelectCountry(country)}
            data-testid={`button-filter-${country.toLowerCase().replace(/\s+/g, '-')}`}
          >
            {country}
          </Button>
        ))}
      </div>
    </Card>
  );
}
