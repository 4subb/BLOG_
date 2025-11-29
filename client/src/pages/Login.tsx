// 1. IMPORTAMOS 'useState'
import { useLocation, Link } from "wouter";
import { useAuth } from '../context/AuthContext';
import React, { useState, useEffect } from 'react';

// Esta es tu página: una función que devuelve HTML (JSX)
function LoginPage() {
  
  // 2. CREAMOS EL "ESTADO" (La memoria del componente)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Tu 'useLocation' para redirigir
  const [location, setLocation] = useLocation();
// 2. AÑADE ESTA LÍNEA (Obtén la función 'login' del contexto)
  const { login, isAuthenticated, isAdmin } = useAuth();

  // 3. CREAMOS LA FUNCIÓN "MANEJADORA" (Handler)
  // 1. MARCAMOS LA FUNCIÓN COMO "ASYNC" (ASÍNCRONA)
  const handleSubmit = async (evento: React.FormEvent<HTMLFormElement>) => {
    // Evita que la página se recargue
    evento.preventDefault(); 
    
    console.log('Enviando datos al backend...');
    console.log('Email:', email);
    console.log('Password:', password);

    // 2. USAMOS TRY...CATCH PARA MANEJAR ERRORES
    try {
      // 3. ESTA ES LA "LLAMADA API" (API CALL)
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST', // 4. El método: Estamos ENVIANDO datos
        headers: {
          // 5. Los "headers": Le decimos al backend qué tipo de datos enviamos
          'Content-Type': 'application/json',
        },
        // 6. El "body": Los datos en sí, convertidos a texto JSON
        body: JSON.stringify({ 
          email: email, 
          password: password 
        }),

        credentials: 'include'

      });

      // 7. MANEJAMOS LA RESPUESTA DEL SERVIDOR
      // ...
      if (response.ok) {
        // Si el login fue exitoso
        const data = await response.json();
        console.log('Respuesta del servidor (éxito):', data);
        
        // 3. ¡AQUÍ ESTÁ LA MAGIA!
        // Informamos al "Estado Global" sobre el nuevo usuario
        login(data.user); 

      } else {
        // Si el login falló (ej. contraseña incorrecta)
        const errorData = await response.json();
        console.log('Respuesta del servidor (error):', errorData);
        alert(`Error al iniciar sesión: ${errorData.message}`);
      }

    } catch (error) {
      // 8. MANEJAMOS ERRORES DE RED
      console.error('Error de red o al conectar con el servidor:', error);
      alert('No se pudo conectar con el servidor. ¿Está funcionando?');
    }
  };

  // ...
// ... fin de tu función handleSubmit

// ¡AÑADE ESTO!
// Este "Hook de Efecto" se ejecutará CADA VEZ que
// 'isAuthenticated' o 'isAdmin' cambien.
useEffect(() => {
  // Si el estado global nos dice que el login fue exitoso...
  if (isAuthenticated) {

    // ...entonces decidimos a dónde ir.
    if (isAdmin) {
      setLocation('/dashboard'); // ¡Los Admins van al Dashboard!
    } else {
      setLocation('/'); // ¡Los Usuarios Normales van al Inicio!
    }
  }
}, [isAuthenticated, isAdmin, setLocation]); // "Dependencias"

// return ( ... tu JSX ... )

  // Esto es lo que se va a "dibujar" en la pantalla
  return (
    <div style={{ padding: '2rem', maxWidth: '400px', margin: '0 auto' }}>
      <h1>Página de Login</h1>
      
      {/* 4. CREAMOS EL FORMULARIO */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        {/* CAMPO DE EMAIL */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label htmlFor="email">Email</label>
          <input 
            type="email" 
            id="email"
            value={email} // 5. Conectamos el valor al "estado"
            onChange={(e) => setEmail(e.target.value)} // 6. Conectamos el cambio al "estado"
          />
        </div>
        
        {/* CAMPO DE CONTRASEÑA */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label htmlFor="password">Contraseña</label>
          <input 
            type="password" 
            id="password"
            value={password} // 5. Conectamos el valor al "estado"
            onChange={(e) => setPassword(e.target.value)} // 6. Conectamos el cambio al "estado"
          />
        </div>

        {/* BOTÓN DE ENVÍO */}
        <button type="submit" style={{ padding: '0.5rem', background: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}>
          Entrar
        </button>
      </form>

      <p style={{ marginTop: '1rem', textAlign: 'center' }}>
        ¿No tienes una cuenta? <Link href="/register" style={{ color: '#007bff' }}>Regístrate aquí</Link>
      </p>

    </div>
  );
}

// Esto "exporta" tu página para que App.tsx pueda importarla
export default LoginPage;