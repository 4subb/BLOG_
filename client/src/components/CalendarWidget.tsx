// client/src/components/CalendarWidget.tsx

import React from 'react';
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale'; // Puedes cambiar a 'es' si instalas date-fns/locale/es
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Configuración del localizador
const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({
  format, parse, startOfWeek, getDay, locales,
});

// Tipos (Coinciden con lo que usa SportsTabs)
export type WidgetEvent = {
  id: string;
  eventName: string;
  date: string; // Viene como string de la API
  location?: string;
};

interface CalendarWidgetProps {
  events: WidgetEvent[];
  sportType?: 'ciclismo' | 'tenis' | 'f1' | 'all';
  height?: number; // Altura opcional
}

export default function CalendarWidget({ events, sportType = 'all', height = 500 }: CalendarWidgetProps) {

  // 1. Transformamos los datos para el calendario
  const calendarEvents = events.map(e => {
    const date = new Date(e.date);
    return {
      id: e.id,
      title: e.eventName, // El calendario requiere 'title'
      start: date,
      end: date, // Eventos de un día
      allDay: true,
      resource: { location: e.location }
    };
  });

  // 2. Colores según deporte
  const eventStyleGetter = () => {
    let backgroundColor = '#3174ad';
    if (sportType === 'f1') backgroundColor = '#e10600';
    if (sportType === 'tenis') backgroundColor = '#2a75bb';
    if (sportType === 'ciclismo') backgroundColor = '#facc15';
    
    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: sportType === 'ciclismo' ? 'black' : 'white',
        border: '0px',
        display: 'block',
        fontSize: '0.85em'
      }
    };
  };

  return (
    <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg border shadow-sm" style={{ height: height }}>
      <Calendar
        localizer={localizer}
        events={calendarEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        eventPropGetter={eventStyleGetter}
        views={['month', 'agenda']} // Limitamos las vistas para que sea más simple
        defaultView="month"
        messages={{
          next: ">", previous: "<", today: "Hoy",
          month: "Mes", agenda: "Lista"
        }}
        onSelectEvent={(event) => alert(`${event.title}\n${event.resource.location || ''}`)}
      />
    </div>
  );
}