import React, { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter'; // 🟢 CORRECCIÓN 1: Hook nativo de Wouter
import { postCategoryEnum, type Post } from '@shared/schema';

import ReactQuill, { Quill } from 'react-quill';
const Font = Quill.import('formats/font');
Font.whitelist = ['arial', 'courier-new', 'georgia', 'lucida', 'roboto', 'verdana', 'montserrat', 'playfair', 'playwrite'];
Quill.register(Font, true);
import 'react-quill/dist/quill.snow.css';

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

type Category = (typeof postCategoryEnum.enumValues)[number];

export default function EditPostPage() {
  // 🟢 CORRECCIÓN 1: Extracción segura del ID
  const [match, params] = useRoute("/post/:id/edit");
  const postId = params?.id;
  const [, setLocation] = useLocation();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<Category>(postCategoryEnum.enumValues[0]);
  const [imageUrl, setImageUrl] = useState('');
  const [country, setCountry] = useState('');
  const [tags, setTags] = useState('');
  const [isPublished, setIsPublished] = useState(true); 
  
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Si Wouter aún no resuelve el ID, no dispares el fetch
    if (!postId) return;
    
    const fetchPostData = async () => {
      try {
        // CORRECCIÓN 2: Regresamos al endpoint de administrador para que pueda ver borradores
        const res = await fetch(`/api/posts/${postId}/admin`, { credentials: 'include' });
        
        if (!res.ok) throw new Error("Error cargando la información del post.");
        const data = await res.json();
        
        // CORRECCIÓN 3: Seguridad en el parseo del JSON (por si viene envuelto en { post: {} })
        const post = data.post ? data.post : data;
        
        setTitle(post.title || '');
        setContent(post.content || ''); 
        setCategory(post.category || postCategoryEnum.enumValues[0]);
        setImageUrl(post.imageUrl || '');
        setCountry(post.country || '');
        setTags(post.tags ? post.tags.join(', ') : '');
        setIsPublished(post.isPublished ?? true); 
        
      } catch (err: any) { 
        setIsError(true); 
        setMessage(err.message); 
      } finally { 
        setIsLoading(false); 
      }
    };
    
    fetchPostData();
  }, [postId]);

  const handleSubmit = async (evento: React.FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    setIsError(false); setMessage('Guardando...');
    const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'PUT',
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
      if (response.ok) {
        setIsError(false); setMessage(`¡Actualizado!`);
        setTimeout(() => setLocation(`/post/${postId}`), 1000);
      } else {
        const data = await response.json();
        setIsError(true); setMessage(`Error: ${data.message}`);
      }
    } catch (error) { 
      setIsError(true); 
      setMessage('Error de red al intentar guardar.'); 
    }
  };

  // ACTUALIZACIÓN: Igualamos los módulos del editor con los del Dashboard
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

  if (isLoading) return <div className="p-8 text-center mt-20 font-bold text-slate-500">Conectando con la base de datos...</div>;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12 px-4 md:px-8 mt-10">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold font-heading mb-6">Editar Post</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div><Label>Título</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} required/></div>
            <div><Label>Imagen URL</Label><Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} /></div>
            
            <div className="flex flex-col">
              <Label className="mb-2">Contenido</Label>
              <div className="bg-white text-black rounded-md border">
                <ReactQuill 
                  theme="snow" 
                  value={content} 
                  onChange={setContent} 
                  modules={modules}
                  className="h-64 mb-12"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-8">
              <div className="flex-1">
                <Label>Categoría</Label>
                <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {postCategoryEnum.enumValues.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1"><Label>País</Label><Input value={country} onChange={(e) => setCountry(e.target.value)} /></div>
            </div>
            <div><Label>Etiquetas (Separadas por coma)</Label><Input value={tags} onChange={(e) => setTags(e.target.value)} /></div>
            <div className="flex items-center space-x-2"><Checkbox id="pub" checked={isPublished} onCheckedChange={(c) => setIsPublished(!!c)} /><Label htmlFor="pub">Publicar</Label></div>
            <Button type="submit" size="lg" className="w-full">Guardar Cambios</Button>
            {message && <p className={isError ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold'}>{message}</p>}
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}