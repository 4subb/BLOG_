import PageIntro from "@/components/mission/PageIntro";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type PostSummary } from "@shared/schema";
import { Camera, KeyRound, Upload } from "lucide-react"; // Iconos nuevos
import { toast } from "@/hooks/use-toast";
import { useLang } from "@/lib/lang";

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { L } = useLang();
  const [, setLocation] = useLocation();

  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [bookmarks, setBookmarks] = useState<PostSummary[]>([]);
  const [loadingBookmarks, setLoadingBookmarks] = useState(false);

  // Cambio de contraseña
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

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

  // Reduce la imagen a 256x256 (recorte centrado) antes de guardarla como data URL:
  // el avatar se pinta en el header y en cada comentario, no necesita más resolución.
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: L("Selecciona un archivo de imagen", "Choose an image file"), variant: "destructive" });
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      toast({ title: L("La imagen es muy pesada", "The image is too large"), description: L("Máximo 15 MB.", "15 MB max."), variant: "destructive" });
      return;
    }

    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const size = 256;
      const side = Math.min(img.width, img.height);
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      canvas.getContext("2d")!.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size);
      setAvatarUrl(canvas.toDataURL("image/jpeg", 0.85));
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      toast({ title: L("No se pudo leer la imagen", "Couldn't read the image"), variant: "destructive" });
    };
    img.src = url;
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
        toast({ title: L("Perfil actualizado", "Profile updated") });
        window.location.reload(); 
      } else {
        toast({ title: L("No se pudo guardar el perfil", "Couldn't save the profile"), variant: "destructive" });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast({ title: L("La nueva contraseña debe tener al menos 8 caracteres", "The new password must be at least 8 characters"), variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: L("Las contraseñas no coinciden", "Passwords don't match"), variant: "destructive" });
      return;
    }
    setIsChangingPassword(true);
    try {
      const res = await fetch("/api/users/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        toast({ title: L("Contraseña actualizada", "Password updated") });
        setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      } else {
        toast({ title: data.message || L("No se pudo cambiar la contraseña", "Couldn't change the password"), variant: "destructive" });
      }
    } catch {
      toast({ title: L("Error de conexión", "Connection error"), variant: "destructive" });
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoading || !user) return null;

  return (
    <div className="flex-1">
      <main className="page-container pb-24 pt-8 sm:pt-10">
        <PageIntro index="U1" label={L("Perfil", "Profile")} title={user.username || user.email.split("@")[0]} />
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* COLUMNA IZQUIERDA: Tarjeta de Identidad */}
          <div className="w-full md:w-1/3">
            <Card>
              <CardHeader>
                <CardTitle>{L("Mi perfil", "My profile")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* ZONA DE AVATAR */}
                <div className="flex flex-col items-center">
                  <div className="relative group w-32 h-32 mb-4">
                    <div className="w-32 h-32 rounded-full overflow-hidden border border-border bg-muted shadow-md">
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
                    <Label>{L("Nombre de usuario", "Username")}</Label>
                    <Input 
                      value={username} 
                      onChange={(e) => setUsername(e.target.value)} 
                      placeholder={L("Ej. JuanDev", "e.g. JohnDev")}
                    />
                    <p className="text-xs text-muted-foreground">{L("Este nombre será público.", "This name will be public.")}</p>
                  </div>

                  {/* El campo de URL manual lo ocultamos o dejamos como solo lectura si quieres */}
                  
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={user.email} disabled className="bg-muted" />
                  </div>

                  <Button type="submit" className="w-full" disabled={isSaving}>
                    {isSaving ? L("Guardando...", "Saving...") : L("Actualizar perfil", "Update profile")}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><KeyRound className="h-5 w-5" /> {L("Seguridad", "Security")}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">{L("Contraseña actual", "Current password")}</Label>
                    <Input id="current-password" type="password" autoComplete="current-password" required
                      value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">{L("Nueva contraseña", "New password")}</Label>
                    <Input id="new-password" type="password" autoComplete="new-password" required minLength={8}
                      value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                    <p className="text-xs text-muted-foreground">{L("Mínimo 8 caracteres.", "At least 8 characters.")}</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">{L("Confirmar nueva contraseña", "Confirm new password")}</Label>
                    <Input id="confirm-password" type="password" autoComplete="new-password" required
                      value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                  </div>
                  <Button type="submit" variant="outline" className="w-full" disabled={isChangingPassword}>
                    {isChangingPassword ? L("Cambiando...", "Changing...") : L("Cambiar contraseña", "Change password")}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* COLUMNA DERECHA: Contenido Guardado */}
          <div className="w-full md:w-2/3">
            <Tabs defaultValue="bookmarks">
              <TabsList>
                <TabsTrigger value="bookmarks">{L("Guardados", "Saved")} ({bookmarks.length})</TabsTrigger>
                <TabsTrigger value="activity">{L("Actividad reciente", "Recent activity")}</TabsTrigger>
              </TabsList>
              
              <TabsContent value="bookmarks" className="mt-6">
                {loadingBookmarks ? (
                  <p>{L("Cargando favoritos...", "Loading saved posts...")}</p>
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
                           {L("Leer más", "Read more")}
                         </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-muted-foreground">
                    {L("No has guardado ningún post todavía.", "You haven't saved any posts yet.")}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="activity">
                <p className="text-muted-foreground py-10">{L("Historial de comentarios no disponible aún.", "Comment history isn't available yet.")}</p>
              </TabsContent>
            </Tabs>
          </div>

        </div>
      </main>
    </div>
  );
}