import { Link } from "wouter";
import AuthShell from "@/components/layout/AuthShell";
import { useAuth } from "@/context/AuthContext";
import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle } from "lucide-react"; // Icono de alerta
import { cn } from "@/lib/utils"; // Utilidad de Tailwind para mezclar clases

function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // ESTADOS DE ERROR ESPECÍFICOS
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirm?: string;
    general?: string;
  }>({});

  const { register, isLoading } = useAuth();

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (evento: React.FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    setErrors({}); // Limpiar errores previos

    let newErrors: any = {};
    let hasError = false;

    // 1. Validaciones Locales
    if (!isValidEmail(email)) {
      newErrors.email = "El formato del correo no es válido.";
      hasError = true;
    }
    if (password.length < 6) {
      newErrors.password = "Mínimo 6 caracteres.";
      hasError = true;
    }
    if (password !== confirmPassword) {
      newErrors.confirm = "Las contraseñas no coinciden.";
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    // 2. Envío al Backend
    try {
      await register({ email, password, username });
    } catch (error: any) {
      // Manejo inteligente de errores del servidor
      const msg = error.message || "";
      
      if (msg.includes("ya está registrado") || msg.includes("Existe") || msg.includes("duplicate")) {
        setErrors({ 
          email: "duplicate" // Marca especial para mostrar el link de login
        });
      } else {
        setErrors({ general: "Error al registrar: " + msg });
      }
    }
  };

  return (
    <AuthShell>
        
        <div className="text-center">
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-foreground">Crear Cuenta</h2>
          <p className="mt-2 text-sm text-muted-foreground">Únete a nuestra comunidad</p>
        </div>

        {/* Error General (si falla el servidor por otra cosa) */}
        {errors.general && (
          <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {errors.general}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            
            {/* USUARIO */}
            <div>
              <label className="block text-sm font-medium text-foreground/90">Nombre de Usuario</label>
              <input 
                type="text" 
                required 
                className="mt-1 block w-full h-10 px-3 bg-background text-sm border border-input rounded-md outline-none transition-[border-color,box-shadow] focus:border-foreground/40 focus:ring-4 focus:ring-ring/15"
                placeholder="Ej. JuanDev"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            {/* EMAIL CON MANEJO DE ERROR INTELIGENTE */}
            <div>
              <label className="block text-sm font-medium text-foreground/90">Email</label>
              <input 
                type="email" 
                required 
                // Si hay error, borde rojo y texto rojo
                className={cn(
                  "mt-1 block w-full h-10 px-3 bg-background text-sm border rounded-md outline-none transition-[border-color,box-shadow] focus:border-foreground/40 focus:ring-4 focus:ring-ring/15 transition-colors",
                  errors.email ? "border-destructive bg-destructive/5" : "border-input"
                )}
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors({...errors, email: undefined}); // Limpiar error al escribir
                }}
              />
              
              {/* MENSAJE DE ERROR PERSONALIZADO */}
              {errors.email === "duplicate" ? (
                <p className="mt-2 text-sm text-destructive flex items-center gap-1 animate-in slide-in-from-left-2">
                   <AlertCircle className="w-4 h-4" />
                   Este correo ya existe. 
                   <Link href="/login" className="font-bold underline ml-1 hover:opacity-80">
                     ¿Deseas iniciar sesión?
                   </Link>
                </p>
              ) : errors.email && (
                <p className="mt-1 text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            {/* CONTRASEÑA */}
            <div>
              <label className="block text-sm font-medium text-foreground/90">Contraseña</label>
              <div className="relative mt-1">
                <input 
                  type={showPassword ? "text" : "password"} 
                  required 
                  className={cn(
                    "block w-full h-10 px-3 bg-background text-sm border rounded-md pr-10 outline-none transition-[border-color,box-shadow] focus:border-foreground/40 focus:ring-4 focus:ring-ring/15",
                    errors.password ? "border-destructive bg-destructive/5" : "border-input"
                  )}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors({...errors, password: undefined});
                  }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors">
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-destructive">{errors.password}</p>}
            </div>

            {/* CONFIRMAR */}
            <div>
              <label className="block text-sm font-medium text-foreground/90">Confirmar Contraseña</label>
              <div className="relative mt-1">
                <input 
                  type={showConfirm ? "text" : "password"} 
                  required 
                  className={cn(
                    "block w-full h-10 px-3 bg-background text-sm border rounded-md pr-10 outline-none transition-[border-color,box-shadow] focus:border-foreground/40 focus:ring-4 focus:ring-ring/15",
                    errors.confirm ? "border-destructive bg-destructive/5" : "border-input"
                  )}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setErrors({...errors, confirm: undefined});
                  }}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors">
                  {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirm && <p className="mt-1 text-sm text-destructive">{errors.confirm}</p>}
            </div>

          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full h-10 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-[background-color,transform] duration-200 active:scale-[0.98] disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring"
          >
            {isLoading ? "Creando cuenta..." : "Registrarse"}
          </button>
        </form>

        <div className="text-center text-sm">
          <p className="text-muted-foreground">
            ¿Ya tienes cuenta? <Link href="/login" className="font-medium text-foreground underline-offset-4 hover:underline">Inicia Sesión aquí</Link>
          </p>
        </div>

    </AuthShell>
  );
}

export default RegisterPage;