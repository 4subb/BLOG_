import { Link } from "wouter"; // Importante: Link de wouter
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg border border-gray-100">
        
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Iniciar Sesión</h2>
          <p className="mt-2 text-sm text-gray-600">Bienvenido de nuevo</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input 
                type="email" 
                required 
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-black focus:border-black"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Contraseña</label>
              <div className="relative mt-1">
                <input 
                  type={showPassword ? "text" : "password"} 
                  required 
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md pr-10 focus:ring-black focus:border-black"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 transition-colors"
          >
            {isLoading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        {/* 👇 AQUÍ ESTÁ EL ENLACE AL REGISTRO 👇 */}
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            ¿No tienes cuenta?{' '}
            <Link href="/register">
              <span className="font-medium text-black hover:underline cursor-pointer">
                Regístrate aquí
              </span>
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}

export default LoginPage;