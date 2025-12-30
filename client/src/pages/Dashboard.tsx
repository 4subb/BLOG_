// Contenido NUEVO (con Editor Rico) para client/src/pages/Dashboard.tsx

import React, { useState, useEffect } from 'react';
import { postCategoryEnum, type Post, type User } from '@shared/schema';
import { Link } from 'wouter'; 

// 1. ¡IMPORTAMOS EL EDITOR Y SUS ESTILOS!
// Importamos ReactQuill Y la clase base Quill para configurarla
import ReactQuill, { Quill } from 'react-quill';

// 1. Registramos las fuentes en Quill
const Font = Quill.import('formats/font');
// ¡Importante! Estos nombres deben coincidir con los del CSS (.ql-font-arial -> 'arial')
Font.whitelist = ['arial', 'courier-new', 'georgia', 'lucida', 'roboto', 'verdana', 'montserrat', 'playfair', 'playwrite'];
Quill.register(Font, true);
import 'react-quill/dist/quill.snow.css'; // Estilos de "nieve" (el tema bonito)

import Header from "@/components/Header";
import Footer from "@/components/Footer";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit, Eye, EyeOff, ArrowUpCircle, ArrowDownCircle } from 'lucide-react'; 
import { Input } from '@/components/ui/input';
// import { Textarea } from '@/components/ui/textarea'; // YA NO LA NECESITAMOS
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

import { type User as SchemaUser } from '@shared/schema'; 
import { useAuth } from '@/context/AuthContext'; 

type Category = (typeof postCategoryEnum.enumValues)[number];
type SafeUser = Pick<SchemaUser, 'id' | 'email' | 'role'>;

function DashboardPage() {
  
  const [currentTab, setCurrentTab] = useState(() => localStorage.getItem('dashboardTab') || "manage-posts");
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState(''); // Aquí se guardará el HTML del editor
  const [category, setCategory] = useState<Category>(postCategoryEnum.enumValues[0]);
  const [imageUrl, setImageUrl] = useState('');
  const [country, setCountry] = useState('');
  const [tags, setTags] = useState(''); 
  const [isPublished, setIsPublished] = useState(true);
  
  const [postMessage, setPostMessage] = useState<string | null>(null);
  const [isPostError, setIsPostError] = useState(false);
  const [userMessage, setUserMessage] = useState<string | null>(null);

  const [users, setUsers] = useState<SafeUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);

  const { user: adminUser } = useAuth();

  // --- useEffects (Carga de datos) ---
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoadingUsers(true);
        const res = await fetch('/api/users', { credentials: 'include' });
        if (res.ok) setUsers(await res.json());
        else { const d = await res.json(); throw new Error(d.message); }
      } catch (err: any) { setUserMessage(err.message || "Error cargando usuarios."); } 
      finally { setIsLoadingUsers(false); }
    };
    fetchUsers();
  }, []); 

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoadingPosts(true);
        const res = await fetch('/api/posts/admin', { credentials: 'include' });
        if (res.ok) setPosts(await res.json());
        else { const d = await res.json(); throw new Error(d.message); }
      } catch (err: any) { setPostMessage(err.message || "Error cargando posts."); }
      finally { setIsLoadingPosts(false); }
    };
    fetchPosts();
  }, []);

  // --- Handlers ---
  const handleSubmit = async (evento: React.FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    setIsPostError(false);
    setPostMessage('Creando post...');
    const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', 
        body: JSON.stringify({
          title, content, category,
          imageUrl: imageUrl || null,
          country: country || null,
          tags: tagsArray.length > 0 ? tagsArray : null,
          isPublished: isPublished
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setIsPostError(false);
        setPostMessage(`¡Éxito! Post "${title}" creado.`);
        // Limpiar formulario
        setTitle(''); setContent(''); setImageUrl(''); setCountry(''); setTags('');
        setPosts(prev => [data.post, ...prev]);
        setCurrentTab("manage-posts");
        localStorage.setItem('dashboardTab', 'manage-posts');
      } else {
        setIsPostError(true);
        setPostMessage(`Error: ${data.message || (data.errors && data.errors[0].message)}`);
      }
    } catch (error) {
      setIsPostError(true);
      setPostMessage('Error de red.');
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'user') => {
    if (!window.confirm(`¿Seguro?`)) return;
    try {
      const res = await fetch(`/api/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      else setUserMessage(`Error al cambiar rol.`);
    } catch (err) { setUserMessage("Error de red."); }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("¿Seguro?")) return;
    try {
      const res = await fetch(`/api/users/${userId}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) setUsers(prev => prev.filter(u => u.id !== userId));
      else setUserMessage(`Error al borrar usuario.`);
    } catch (err) { setUserMessage("Error de red."); }
  };

  const handleTogglePublish = async (post: Post) => {
    const newStatus = !post.isPublished;
    try {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isPublished: newStatus }),
      });
      if (res.ok) setPosts(prev => prev.map(p => p.id === post.id ? { ...p, isPublished: newStatus } : p));
      else setPostMessage("Error al actualizar.");
    } catch (err) { setPostMessage("Error de red."); }
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm("¿Borrar post?")) return;
    try {
      const res = await fetch(`/api/posts/${postId}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) setPosts(prev => prev.filter(p => p.id !== postId));
      else setPostMessage("Error al borrar.");
    } catch (err) { setPostMessage("Error de red."); }
  };

  const onTabChange = (val: string) => {
    setPostMessage(null); setUserMessage(null);
    setCurrentTab(val); localStorage.setItem('dashboardTab', val);
  }

  // Configuración de la barra de herramientas del editor
  const modules = {
  toolbar: [
    // ¡AQUÍ ESTÁ LA MAGIA! Añadimos el selector de fuente y tamaño
    [{ 'font': Font.whitelist }], 
    [{ 'size': ['small', false, 'large', 'huge'] }], 

    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{'list': 'ordered'}, {'list': 'bullet'}],
    [{ 'color': [] }, { 'background': [] }], // ¡También añadí color de texto y fondo!
    [{ 'align': [] }], // ¡Y alineación!
    ['link', 'image'],
    ['clean']
  ],
};

  return (
    <div className="min-h-screen flex flex-col">
      <Header /> 
      
      <main className="flex-1 py-12 px-4 md:px-8">
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h1 className="text-3xl font-bold font-heading">Panel de Administrador</h1>
          
          <Tabs value={currentTab} onValueChange={onTabChange} className="w-full mt-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="manage-posts">Gestionar Posts</TabsTrigger>
              <TabsTrigger value="create-post">Crear Post</TabsTrigger>
              <TabsTrigger value="manage-users">Gestionar Usuarios</TabsTrigger>
            </TabsList>

            <TabsContent value="manage-posts">
               <div className="mt-4 border rounded-lg">
                 <Table>
                    <TableHeader><TableRow><TableHead>Título</TableHead><TableHead>Categoría</TableHead><TableHead>Estado</TableHead><TableHead className="text-right">Acciones</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {posts.map((post) => (
                        <TableRow key={post.id}>
                          <TableCell>{post.title}</TableCell>
                          <TableCell>{post.category}</TableCell>
                          <TableCell><Badge variant={post.isPublished ? 'default' : 'secondary'}>{post.isPublished ? "Público" : "Borrador"}</Badge></TableCell>
                          <TableCell className="text-right flex gap-2 justify-end">
                            <Button variant="outline" size="sm" onClick={() => handleTogglePublish(post)}>{post.isPublished ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button>
                            <Link href={`/post/${post.id}/edit`}><Button variant="ghost" size="sm"><Edit className="h-4 w-4" /></Button></Link>
                            <Button variant="destructive" size="sm" onClick={() => handleDeletePost(post.id)}><Trash2 className="h-4 w-4" /></Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
               </div>
               {postMessage && <p className="text-red-600 mt-4 text-center">{postMessage}</p>}
            </TabsContent>

            <TabsContent value="create-post">
              <form onSubmit={handleSubmit} className="space-y-6 mt-4 p-4 border rounded-lg bg-card">
                {/* Campos normales */}
                <div className="flex flex-col"> <Label htmlFor="title">Título</Label> <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} /> </div>
                <div className="flex flex-col"> <Label htmlFor="imageUrl">Imagen URL</Label> <Input id="imageUrl" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} /> </div>
                
                {/* 2. ¡EL EDITOR DE TEXTO RICO! */}
                <div className="flex flex-col"> 
                  <Label className="mb-2">Contenido</Label> 
                  {/* Usamos ReactQuill en lugar de Textarea */}
                  <div className="bg-white text-black rounded-md">
                    <ReactQuill 
                      theme="snow" 
                      value={content} 
                      onChange={setContent} 
                      modules={modules}
                      className="h-64 mb-12" // mb-12 para dar espacio a la barra de herramientas
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-8"> 
                  <div className="flex-1"> <Label>Categoría</Label> <Select value={category} onValueChange={(v) => setCategory(v as Category)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{postCategoryEnum.enumValues.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select> </div>
                  <div className="flex-1"> <Label>País</Label> <Input value={country} onChange={(e) => setCountry(e.target.value)} /> </div>
                </div>
                <div className="flex flex-col"> <Label>Etiquetas</Label> <Input value={tags} onChange={(e) => setTags(e.target.value)} /> </div>
                <div className="flex items-center space-x-2"> <Checkbox id="pub" checked={isPublished} onCheckedChange={(c) => setIsPublished(!!c)} /> <Label htmlFor="pub">Publicar</Label> </div>
                <Button type="submit" size="lg" className="w-full">Guardar</Button>
                {postMessage && <p className={isPostError ? "text-red-600" : "text-green-600"}>{postMessage}</p>}
              </form>
            </TabsContent>

            <TabsContent value="manage-users">
               <div className="mt-4 border rounded-lg"><Table><TableHeader><TableRow><TableHead>Email</TableHead><TableHead>Rol</TableHead><TableHead className="text-right">Acciones</TableHead></TableRow></TableHeader><TableBody>{users.map(u => (<TableRow key={u.id}><TableCell>{u.email}</TableCell><TableCell>{u.role}</TableCell><TableCell className="text-right"><Button variant="destructive" size="sm" disabled={u.id === adminUser?.id} onClick={() => handleDeleteUser(u.id)}><Trash2 className="h-4 w-4" /></Button></TableCell></TableRow>))}</TableBody></Table></div>
               {userMessage && <p className="text-red-600 mt-4 text-center">{userMessage}</p>}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default DashboardPage;