// Contenido para client/src/pages/Register.tsx

import React, { useState } from 'react';
import { useLocation } from "wouter"; // Importamos el hook de redirección

function RegisterPage() {
  // Estados para el email y la contraseña
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [location, setLocation] = useLocation(); // Hook para redirigir

  // Manejador del formulario
  const handleSubmit = async (evento: React.FormEvent<HTMLFormElement>) => {
    evento.preventDefault();

    // Validación simple (en un proyecto real sería más robusta)
    if (!email || !password) {
      alert('Por favor, completa todos los campos.');
      return;
    }

    console.log('Enviando datos de registro al backend...');

    try {
      // ¡NUEVA RUTA DE API!
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password // Enviamos la contraseña en texto plano (el backend la cifrará)
        }),

        credentials: 'include'

      });

      const data = await response.json();

      if (response.ok) {
        // ¡Éxito!
        console.log('Respuesta del servidor (éxito):', data);
        alert('¡Registro exitoso! Ahora puedes iniciar sesión.');
        setLocation('/login'); // Redirigimos al usuario a la página de login
      } else {
        // Error (ej. "el email ya existe")
        console.log('Respuesta del servidor (error):', data);
        alert(`Error en el registro: ${data.message}`);
      }

    } catch (error) {
      console.error('Error de red o al conectar con el servidor:', error);
      alert('No se pudo conectar con el servidor. ¿Está funcionando?');
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '400px', margin: '0 auto' }}>
      <h1>Página de Registro</h1>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label htmlFor="email">Email</label>
          <input 
            type="email" 
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label htmlFor="password">Contraseña</label>
          <input 
            type="password" 
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit" style={{ padding: '0.5rem', background: '#28a745', color: 'white', border: 'none', cursor: 'pointer' }}>
          Crear Cuenta
        </button>
      </form>
    </div>
  );
}

export default RegisterPage;