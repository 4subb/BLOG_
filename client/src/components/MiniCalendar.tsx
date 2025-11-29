// client/src/components/MiniCalendar.tsx

import React from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale'; 
import { ChevronLeft, ChevronRight, Circle, Calendar as CalendarIcon } from 'lucide-react'; // Importamos icono
import { Button } from "@/components/ui/button";

type SportEvent = {
  id: string;
  eventName: string;
  date: string;
  location?: string;
  sport?: string;
};

interface MiniCalendarProps {
  events: SportEvent[];
  currentDate: Date;           // Mes que se está viendo
  onDateChange: (date: Date) => void; // Función para cambiar mes
  
  // 1. ¡NUEVAS PROPS! El padre controla la selección
  selectedDate: Date | null;   
  onSelectDate: (date: Date) => void;
}

export default function MiniCalendar({ 
  events, 
  currentDate, 
  onDateChange, 
  selectedDate, 
  onSelectDate 
}: MiniCalendarProps) {

  // Generar los días
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { locale: es });
  const endDate = endOfWeek(monthEnd, { locale: es });
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  // Filtrar eventos del día seleccionado
  const selectedEvents = events.filter(e => 
    selectedDate && isSameDay(new Date(e.date), selectedDate)
  );

  const hasEvent = (day: Date) => {
    return events.some(e => isSameDay(new Date(e.date), day));
  };

  // 2. Función para el botón "Hoy"
  const goToToday = () => {
    const today = new Date();
    onDateChange(today);  // Mueve la vista al mes actual
    onSelectDate(today);  // Selecciona el día de hoy
  };

  return (
    <div className="bg-card border rounded-lg shadow-sm overflow-hidden">
      {/* Cabecera */}
      <div className="p-4 flex items-center justify-between bg-muted/30 border-b">
        <div className="flex items-center gap-2">
           <span className="font-heading font-bold capitalize text-sm">
            {format(currentDate, 'MMMM yyyy', { locale: es })}
          </span>
          {/* 3. BOTÓN HOY */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 px-2 text-xs text-muted-foreground hover:text-primary"
            onClick={goToToday}
            title="Ir a hoy"
          >
            Hoy
          </Button>
        </div>

        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onDateChange(subMonths(currentDate, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onDateChange(addMonths(currentDate, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Días Semana */}
      <div className="grid grid-cols-7 text-center text-xs font-medium text-muted-foreground p-2 bg-muted/10">
        {['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'].map(day => (
          <div key={day} className="py-1">{day}</div>
        ))}
      </div>

      {/* Rejilla */}
      <div className="grid grid-cols-7 p-2 gap-1">
        {calendarDays.map((day) => {
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, monthStart);
          const dayHasEvent = hasEvent(day);
          const isToday = isSameDay(day, new Date()); // Para marcar hoy visualmente

          return (
            <button
              key={day.toString()}
              // 4. Usamos la prop del padre al hacer click
              onClick={() => onSelectDate(day)}
              className={`
                h-8 w-8 mx-auto flex items-center justify-center rounded-full text-sm transition-all relative
                ${!isCurrentMonth ? 'text-muted-foreground/30' : ''}
                ${isSelected ? 'bg-primary text-primary-foreground font-bold shadow-md scale-105' : 'hover:bg-muted'}
                ${dayHasEvent && !isSelected ? 'font-bold text-primary' : ''}
                ${isToday && !isSelected ? 'border border-primary/50' : ''} 
              `}
            >
              {format(day, 'd')}
              {dayHasEvent && !isSelected && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full"></span>
              )}
            </button>
          );
        })}
      </div>

      {/* Lista de eventos */}
      <div className="p-4 border-t bg-muted/10 min-h-[100px]">
        <p className="text-xs font-semibold text-muted-foreground mb-2 capitalize">
          Eventos del {selectedDate ? format(selectedDate, 'd MMMM', { locale: es }) : 'Día'}
        </p>
        
        {selectedEvents.length > 0 ? (
          <div className="space-y-2">
            {selectedEvents.map(e => (
              <div key={e.id} className="flex items-start gap-2 text-sm animate-in slide-in-from-left-2 duration-300">
                <Circle className="h-2 w-2 mt-1.5 fill-current text-primary flex-shrink-0" />
                <div>
                  <p className="font-medium leading-none">{e.eventName}</p>
                  {e.location && <span className="text-xs text-muted-foreground">{e.location}</span>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground italic">No hay eventos programados.</p>
        )}
      </div>
    </div>
  );
}