import React, { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter'; 
import { postCategoryEnum, type Post } from '@shared/schema';

import ReactQuill, { Quill } from 'react-quill';
const Font = Quill.import('formats/font');
Font.whitelist = ['arial', 'courier-new', 'georgia', 'lucida', 'roboto', 'verdana', 'montserrat', 'playfair', 'playwrite'];
Quill.register(Font, true);
import 'react-quill/dist/quill.snow.css';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { SmartMedia } from "@/components/SmartMedia"; // 🟢 CONEXIÓN CDN: Importamos el componente inteligente

type Category = (typeof postCategoryEnum.enumValues)[number];

export default function EditPostPage() {
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
    if (!postId) return;
    
    const fetchPostData = async () => {
      try {
        const res = await fetch(`/api/posts/${postId}/admin`, { credentials: 'include' });
        if (!res.ok) throw new Error("Error cargando la información del post.");
        const data = await res.json();
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

  if (isLoading) return <div className="flex flex-1 items-center justify-center py-24 text-sm text-muted-foreground animate-pulse">Cargando post…</div>;

  return (
    <div className="flex-1">
      <main className="px-5 py-14 sm:px-8 sm:py-20">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-semibold tracking-[-0.03em] mb-8">Editar Post</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div><Label>Título</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} required/></div>
            
            {/* 🟢 SECCIÓN MULTIMEDIA ACTUALIZADA CON SMARTMEDIA */}
            <div className="space-y-3">
              <Label>Ruta / URL Multimedia (Imagen o Video de tu Servidor)</Label>
              <Input 
                value={imageUrl} 
                onChange={(e) => setImageUrl(e.target.value)} 
                placeholder="Ej: /maquinados/electroerosion.mp4 o URL completa"
              />
              {imageUrl && (
                <div className="mt-2 border rounded-md p-2 bg-slate-50">
                  <p className="text-xs text-muted-foreground mb-1 font-medium">Vista previa desde tu CDN:</p>
                  <div className="max-h-[250px] overflow-hidden flex items-center justify-center">
                    <SmartMedia src={imageUrl} className="max-h-[230px] w-auto object-contain rounded" />
                  </div>
                </div>
              )}
            </div>
            
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
    </div>
  );
}