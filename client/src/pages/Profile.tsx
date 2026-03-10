import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type Post } from "@shared/schema";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Camera, Upload } from "lucide-react"; // Iconos nuevos

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [bookmarks, setBookmarks] = useState<Post[]>([]);
  const [loadingBookmarks, setLoadingBookmarks] = useState(false);

  // Referencia para el input de archivo oculto
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) setLocation("/login");
  }, [isLoading, isAuthenticated, setLocation]);

  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
      setAvatarUrl(user.avatarUrl || "");
    }
  }, [user]);

  useEffect(() => {
    if (isAuthenticated) {
      setLoadingBookmarks(true);
      fetch('/api/users/me/bookmarks')
        .then(res => res.json())
        .then(data => setBookmarks(data))
        .catch(console.error)
        .finally(() => setLoadingBookmarks(false));
    }
  }, [isAuthenticated]);

  // --- NUEVA LÓGICA: Convertir imagen a Base64 ---
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tamaño (máx 5MB para no saturar la base de datos)
      if (file.size > 5 * 1024 * 1024) {
        alert("La imagen es muy pesada. Máximo 5MB.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        // El resultado es una cadena larga: "data:image/png;base64,iVBORw..."
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, avatarUrl }),
      });
      if (res.ok) {
        alert("Perfil actualizado correctamente.");
        window.location.reload(); 
      } else {
        alert("Error al guardar.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !user) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto py-10 px-4">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* COLUMNA IZQUIERDA: Tarjeta de Identidad */}
          <div className="w-full md:w-1/3">
            <Card>
              <CardHeader>
                <CardTitle>Mi Perfil</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* ZONA DE AVATAR */}
                <div className="flex flex-col items-center">
                  <div className="relative group w-32 h-32 mb-4">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary bg-gray-200 shadow-lg">
                      <img 
                        src={avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} 
                        alt="Avatar" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* Botón superpuesto al pasar el mouse */}
                    <div 
                      className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Camera className="text-white h-8 w-8" />
                    </div>
                  </div>
                  
                  {/* Botón visible para móviles o si no pasan el mouse */}
                  <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="w-4 h-4 mr-2" />
                    Cambiar Foto
                  </Button>
                  
                  {/* Input invisible real */}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={handleImageUpload}
                  />
                </div>
                
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Username</Label>
                    <Input 
                      value={username} 
                      onChange={(e) => setUsername(e.target.value)} 
                      placeholder="Ej. JuanDev"
                    />
                    <p className="text-xs text-muted-foreground">Este nombre será público.</p>
                  </div>

                  {/* El campo de URL manual lo ocultamos o dejamos como solo lectura si quieres */}
                  
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={user.email} disabled className="bg-muted" />
                  </div>

                  <Button type="submit" className="w-full" disabled={isSaving}>
                    {isSaving ? "Guardando..." : "Actualizar Perfil"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* COLUMNA DERECHA: Contenido Guardado */}
          <div className="w-full md:w-2/3">
            <Tabs defaultValue="bookmarks">
              <TabsList>
                <TabsTrigger value="bookmarks">Guardados ({bookmarks.length})</TabsTrigger>
                <TabsTrigger value="activity">Actividad Reciente</TabsTrigger>
              </TabsList>
              
              <TabsContent value="bookmarks" className="mt-6">
                {loadingBookmarks ? (
                  <p>Cargando favoritos...</p>
                ) : bookmarks.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {bookmarks.map(post => (
                      <div key={post.id} className="border rounded p-4 flex flex-col justify-between">
                         <div>
                           <h3 className="font-bold line-clamp-1">{post.title}</h3>
                           <p className="text-sm text-muted-foreground mb-2">{post.category}</p>
                         </div>
                         <Button 
                           variant="ghost" 
                           onClick={() => setLocation(`/post/${post.id}`)}
                           className="text-primary p-0 h-auto font-bold hover:bg-transparent self-start"
                         >
                           Leer más
                         </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-muted-foreground">
                    No has guardado ningún post todavía.
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="activity">
                <p className="text-muted-foreground py-10">Historial de comentarios no disponible aún.</p>
              </TabsContent>
            </Tabs>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}