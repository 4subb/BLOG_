import { Link } from "wouter"; // Importante: Link de wouter
import AuthShell from "@/components/layout/AuthShell";
import { useAuth } from '../context/AuthContext';
import React, { useState } from 'react';
import { Eye, EyeOff } from "lucide-react";

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const { login, isLoading } = useAuth();

  const handleSubmit = async (evento: React.FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    try {
      await login({ email, password });
      // Si el login funciona, el AuthContext te redirige solo.
    } catch (error: any) {
      alert("Error: " + (error.message || "Credenciales incorrectas"));
    }
  };

  return (
    <AuthShell>
        
        <div className="text-center">
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-foreground">Iniciar Sesión</h2>
          <p className="mt-2 text-sm text-muted-foreground">Bienvenido de nuevo</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground/90">Email</label>
              <input 
                type="email" 
                required 
                className="mt-1 block w-full h-10 px-3 bg-background text-sm border border-input rounded-md outline-none transition-[border-color,box-shadow] focus:border-foreground/40 focus:ring-4 focus:ring-ring/15"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/90">Contraseña</label>
              <div className="relative mt-1">
                <input 
                  type={showPassword ? "text" : "password"} 
                  required 
                  className="block w-full h-10 px-3 bg-background text-sm border border-input rounded-md pr-10 outline-none transition-[border-color,box-shadow] focus:border-foreground/40 focus:ring-4 focus:ring-ring/15"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full h-10 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-[background-color,transform] duration-200 active:scale-[0.98] disabled:opacity-60"
          >
            {isLoading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        {/* 👇 AQUÍ ESTÁ EL ENLACE AL REGISTRO 👇 */}
        <div className="text-center mt-4">
          <p className="text-sm text-muted-foreground">
            ¿No tienes cuenta?{' '}
            <Link href="/register">
              <span className="font-medium text-foreground underline-offset-4 hover:underline cursor-pointer">
                Regístrate aquí
              </span>
            </Link>
          </p>
        </div>

    </AuthShell>
  );
}

export default LoginPage;