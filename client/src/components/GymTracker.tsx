import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dumbbell, Plus, User as UserIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext"; 

// Solo necesitamos el tipo de dato, nada de base de datos
type GymLog = { id: string; date: string; exercise: string; weight: number; sets: number; reps: number; };

// Algoritmo para calcular discos en barra olímpica (20kg)
const calculatePlates = (totalWeight: number) => {
  let weightToDistribute = (totalWeight - 20) / 2; 
  if (weightToDistribute <= 0) return [];
  
  const plateTypes = [25, 20, 15, 10, 5, 2.5, 1.25];
  const platesOnOneSide: number[] = [];
  
  for (let plate of plateTypes) {
    while (weightToDistribute >= plate) {
      platesOnOneSide.push(plate);
      weightToDistribute -= plate;
    }
  }
  return platesOnOneSide;
};

// Componente Visual de la Barra
const BarbellVisualizer = ({ weight }: { weight: number }) => {
  const plates = calculatePlates(weight);
  
  // Colores estándar de powerlifting
  const getColor = (p: number) => {
    if (p === 25) return "bg-red-600";
    if (p === 20) return "bg-blue-600";
    if (p === 15) return "bg-yellow-500";
    if (p === 10) return "bg-green-600";
    return "bg-slate-800"; 
  };

  return (
    <div className="flex items-center justify-center my-4 h-16 w-full max-w-sm mx-auto">
      {/* Lado Izquierdo */}
      <div className="flex items-center flex-row-reverse">
        {plates.map((p, i) => <div key={`l-${i}`} className={`w-3 h-${p >= 15 ? '12' : '8'} ${getColor(p)} border border-black mx-[1px] rounded-sm`}></div>)}
      </div>
      {/* Manga de la barra */}
      <div className="w-8 h-4 bg-gray-300 border-y border-black"></div>
      {/* Centro de la barra */}
      <div className="w-32 h-2 bg-gray-400 border border-black relative flex items-center justify-center">
        <span className="absolute -top-6 font-mono font-bold text-xs">{weight} KG</span>
      </div>
      {/* Manga de la barra */}
      <div className="w-8 h-4 bg-gray-300 border-y border-black"></div>
      {/* Lado Derecho */}
      <div className="flex items-center">
        {plates.map((p, i) => <div key={`r-${i}`} className={`w-3 h-${p >= 15 ? '12' : '8'} ${getColor(p)} border border-black mx-[1px] rounded-sm`}></div>)}
      </div>
    </div>
  );
};

export default function GymTracker() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<GymLog[]>([]);
  const [exercise, setExercise] = useState("");
  const [weight, setWeight] = useState("");
  const [sets, setSets] = useState("3");
  const [reps, setReps] = useState("10");

  useEffect(() => {
    if (user) {
      fetch('/api/gym/me').then(res => res.json()).then(data => setLogs(Array.isArray(data) ? data : []));
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/gym', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ exercise, weight: parseInt(weight), sets: parseInt(sets), reps: parseInt(reps) })
    });
    if (res.ok) {
      const savedLog = await res.json();
      setLogs([savedLog, ...logs]);
      setWeight("");
    }
  };

  const totalTonnage = logs.reduce((acc, log) => acc + (log.weight * log.sets * log.reps), 0);
  const powerLevel = Math.floor(totalTonnage / 5000) + 1;
  const muscleDensityOpacity = Math.min((powerLevel * 10) + 20, 100); 

  if (!user) return <Card className="p-8 text-center font-mono mt-8 border-destructive text-destructive">SISTEMA BLOQUEADO. REQUIERE AUTENTICACIÓN PARA TRACKING FÍSICO.</Card>;

  return (
    <Card className="mt-8 font-mono">
      <CardHeader className="flex flex-row justify-between items-center border-b pb-4 mb-6">
        <CardTitle className="text-2xl font-black uppercase flex items-center gap-2">
          <Dumbbell className="h-6 w-6 text-primary" /> Hipertrofia & Metadatos
        </CardTitle>
        <div className="text-right">
          <div className="text-xs text-muted-foreground uppercase">Tonelaje Total</div>
          <div className="text-xl font-black text-primary">{totalTonnage.toLocaleString()} KG</div>
        </div>
      </CardHeader>

      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* PANEL IZQUIERDO: AVATAR DINÁMICO */}
        <div className="col-span-1 border border-border p-4 flex flex-col items-center justify-center relative bg-muted/30 overflow-hidden rounded-md">
          <div className="absolute top-2 left-2 text-xs font-bold uppercase border border-border px-2 bg-background rounded-sm">Lvl. {powerLevel}</div>
          
          <div className="relative w-32 h-48 border-2 border-dashed border-muted-foreground/30 mt-4 flex items-end justify-center rounded-md">
            <UserIcon className="absolute inset-0 w-full h-full text-muted-foreground/20" />
            
            <div 
               className="absolute bottom-0 w-full bg-primary transition-all duration-1000 ease-out"
               style={{ height: `${muscleDensityOpacity}%`, opacity: muscleDensityOpacity / 100 }}
            >
               <UserIcon className="absolute bottom-0 w-full h-48 text-background mix-blend-overlay" />
            </div>
          </div>
          <div className="mt-4 text-xs font-bold uppercase text-center text-muted-foreground">
            Densidad Muscular: <span className="text-foreground">{muscleDensityOpacity}%</span> <br/>
            Género Base: <span className="text-foreground">{user.gender === 'female' ? 'Femenino' : 'Masculino'}</span>
          </div>
        </div>

        {/* PANEL DERECHO: FORMULARIO Y BARRA */}
        <div className="col-span-1 md:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
            <div className="col-span-2"><Label>Ejercicio</Label><Input required placeholder="Press Banca, Sentadilla..." value={exercise} onChange={e => setExercise(e.target.value)} /></div>
            <div><Label>Peso (kg)</Label><Input type="number" required value={weight} onChange={e => setWeight(e.target.value)} /></div>
            <div className="col-span-2 md:col-span-1"><Button type="submit" className="w-full font-bold"><Plus className="h-4 w-4 mr-1"/> Log</Button></div>
          </form>

          {parseInt(weight) >= 20 && (
            <div className="border border-border p-2 bg-muted/30 rounded-md">
              <div className="text-xs text-center uppercase font-bold text-muted-foreground mb-2">Carga en Barra</div>
              <BarbellVisualizer weight={parseInt(weight)} />
            </div>
          )}

          <div className="h-40 overflow-y-auto border-t border-border pt-2">
            {logs.map(log => (
              <div key={log.id} className="flex justify-between items-center text-sm py-2 border-b border-border/50 hover:bg-muted/50 px-2 cursor-default transition-colors">
                <div className="font-bold w-1/3 truncate">{log.exercise}</div>
                <div className="w-1/3 text-center text-muted-foreground">{log.weight} kg</div>
                <div className="w-1/3 text-right text-muted-foreground">{log.sets}x{log.reps}</div>
              </div>
            ))}
          </div>

        </div>
      </CardContent>
    </Card>
  );
}