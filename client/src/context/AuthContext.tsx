// Contenido NUEVO (actualizado) para client/src/context/AuthContext.tsx

import React, { createContext, useState, useContext, useEffect } from 'react';

// 1. (ACTUALIZADO) Definimos la "forma" del usuario para incluir el 'role'
interface User {
  id: string;
  email: string;
  role: 'admin' | 'user'; // <-- ¡NUEVO!
}

// 2. (ACTUALIZADO) Definimos la "forma" de nuestro Contexto
interface IAuthContext {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean; // <-- ¡NUEVO! Un atajo para saber si el usuario es admin
  login: (userData: User) => void;
  logout: () => Promise<void>;
}

// 3. (ACTUALIZADO) Creamos el Contexto con los nuevos valores por defecto
const AuthContext = createContext<IAuthContext>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isAdmin: false, // <-- ¡NUEVO!
  login: () => {},
  logout: async () => {},
});

// 4. Creamos el "Proveedor" (El "Guardia" de nuestra App)
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // El tipo <User | null> ahora incluye el 'role' gracias al cambio de la Interfaz 1
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 5. Esta función (useEffect) ¡YA FUNCIONA!
  // Como llama a /api/auth/me y guarda la respuesta (data.user),
  // y esa respuesta AHORA incluye el 'role', el 'user' en nuestro
  // estado automáticamente tendrá el 'role'. ¡No hay que cambiar nada aquí!
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/auth/me', { credentials: 'include'});

        if (response.ok) {
          const data = await response.json();
          setUser(data.user); // data.user (que viene del backend) ya tiene el 'role'
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error al comprobar la sesión:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // 6. Esta función (login) ¡TAMBIÉN YA FUNCIONA!
  // LoginPage le pasa el 'data.user' (que viene del backend)
  // y ese 'data.user' ya incluye el 'role'.
  const login = (userData: User) => {
    setUser(userData);
  };

  // 7. Esta función (logout) no cambia.
  const logout = async () => {
    try {
      await fetch('http://localhost:5000/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      setUser(null);
    }
  };

  // 8. (ACTUALIZADO) El "Valor" que compartiremos con toda la app
  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    isAdmin: user?.role === 'admin', // <-- ¡NUEVO! El atajo de Admin
    login,
    logout
  };

  // 9. Devolvemos el "Proveedor"
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// 10. (Sin cambios) Nuestro Hook personalizado
export function useAuth() {
  return useContext(AuthContext);
}