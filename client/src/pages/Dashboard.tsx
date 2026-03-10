import React, { useState, useEffect } from 'react';
import { postCategoryEnum, type Post, type User } from '@shared/schema';
import { Link, useLocation } from 'wouter'; 

import ReactQuill, { Quill } from 'react-quill';
const Font = Quill.import('formats/font');
Font.whitelist = ['arial', 'courier-new', 'georgia', 'lucida', 'roboto', 'verdana', 'montserrat', 'playfair', 'playwrite'];
Quill.register(Font, true);
import 'react-quill/dist/quill.snow.css';

import Header from "@/components/Header";
import Footer from "@/components/Footer";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit, Eye, EyeOff } from 'lucide-react'; 
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

import { type User as SchemaUser } from '@shared/schema'; 
import { useAuth } from '@/context/AuthContext'; 

type Category = (typeof postCategoryEnum.enumValues)[number];
type SafeUser = Pick<SchemaUser, 'id' | 'email' | 'role'>;

function DashboardPage() {
  const [, setLocation] = useLocation();
  const { user: adminUser, isAdmin, isLoading } = useAuth();

  const [currentTab, setCurrentTab] = useState(() => localStorage.getItem('dashboardTab') || "manage-posts");
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
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

  // 1. EL PORTERO: Si no es admin, lo expulsamos al inicio
  useEffect(() => {
    if (!isLoading && !isAdmin) {
      setLocation("/");
    }
  }, [isLoading, isAdmin, setLocation]);

  // 2. CORRECCIÓN CLAVE: Agregamos 'if (!isAdmin) return;'
  // Esto evita que se disparen las peticiones que causan el error 403
  useEffect(() => {
    if (!isAdmin) return; // <--- ¡ESTO DETIENE LOS ERRORES!

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
  }, [isAdmin]); // Se ejecuta solo cuando sabemos si es admin o no

  // Mientras cargamos o decidimos si echarlo, no mostramos nada
  if (isLoading || !isAdmin) return null;

  // ... (El resto del código de handlers y renderizado sigue igual)
  // COPIA EL RESTO DE TUS FUNCIONES ABAJO (handleSubmit, etc...)
  
  // (Para ahorrar espacio aquí, usa las mismas funciones handleSubmit, etc. que ya tenías. 
  // Lo importante son los useEffect de arriba).
  
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
        setTitle(''); setContent(''); setImageUrl(''); setCountry(''); setTags('');
        setPosts(prev => [data.post, ...prev]);
        setCurrentTab("manage-posts");
      } else {
        setIsPostError(true);
        setPostMessage(`Error: ${data.message}`);
      }
    } catch (error) { setIsPostError(true); setPostMessage('Error de red.'); }
  };

  const handleTogglePublish = async (post: Post) => {
    const newStatus = !post.isPublished;
    try {
      const res = await fetch(`/api/posts/${post.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isPublished: newStatus }) });
      if (res.ok) setPosts(prev => prev.map(p => p.id === post.id ? { ...p, isPublished: newStatus } : p));
    } catch (err) { setPostMessage("Error de red."); }
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm("¿Borrar post?")) return;
    try {
      const res = await fetch(`/api/posts/${postId}`, { method: 'DELETE' });
      if (res.ok) setPosts(prev => prev.filter(p => p.id !== postId));
    } catch (err) { setPostMessage("Error de red."); }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("¿Seguro?")) return;
    try {
      const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' });
      if (res.ok) setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (err) { setUserMessage("Error de red."); }
  };

  const modules = {
    toolbar: [
        [{ 'font': Font.whitelist }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{'list': 'ordered'}, {'list': 'bullet'}],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'align': [] }],
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
          
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full mt-6">
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
                <div className="flex flex-col"> <Label htmlFor="title">Título</Label> <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} /> </div>
                <div className="flex flex-col"> <Label htmlFor="imageUrl">Imagen URL</Label> <Input id="imageUrl" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} /> </div>
                <div className="flex flex-col"> 
                  <Label className="mb-2">Contenido</Label> 
                  <div className="bg-white text-black rounded-md">
                    <ReactQuill theme="snow" value={content} onChange={setContent} modules={modules} className="h-64 mb-12" />
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