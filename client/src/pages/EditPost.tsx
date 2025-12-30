// Contenido NUEVO (con Editor Rico) para client/src/pages/EditPost.tsx

import React, { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { postCategoryEnum, type Post } from '@shared/schema';
// 1. IMPORTAMOS EL EDITOR
import ReactQuill, { Quill } from 'react-quill';

// 1. Registramos las fuentes en Quill
const Font = Quill.import('formats/font');
// ¡Importante! Estos nombres deben coincidir con los del CSS (.ql-font-arial -> 'arial')
Font.whitelist = ['arial', 'courier-new', 'georgia', 'lucida', 'roboto', 'verdana', 'montserrat', 'playfair', 'playwrite'];
Quill.register(Font, true);
import 'react-quill/dist/quill.snow.css';

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// import { Textarea } from '@/components/ui/textarea'; // YA NO
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

type Category = (typeof postCategoryEnum.enumValues)[number];

function EditPostPage() {
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
        if (!res.ok) throw new Error("Error cargando post");
        const post: Post = await res.json();
        
        setTitle(post.title);
        setContent(post.content); // ¡Esto cargará el HTML existente!
        setCategory(post.category);
        setImageUrl(post.imageUrl || '');
        setCountry(post.country || '');
        setTags((post.tags || []).join(', '));
        setIsPublished(post.isPublished); 
      } catch (err: any) { setIsError(true); setMessage(err.message); } 
      finally { setIsLoading(false); }
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
    } catch (error) { setIsError(true); setMessage('Error de red.'); }
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}],
      ['link', 'image'],
      ['clean']
    ],
  };

  if (isLoading) return <div className="p-8 text-center">Cargando...</div>;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12 px-4 md:px-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold font-heading mb-6">Editar Post</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div><Label>Título</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
            <div><Label>Imagen URL</Label><Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} /></div>
            
            {/* 2. EDITOR RICO */}
            <div className="flex flex-col">
              <Label className="mb-2">Contenido</Label>
              <div className="bg-white text-black rounded-md">
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
              <div className="flex-1"><Label>Categoría</Label><Select value={category} onValueChange={(v) => setCategory(v as Category)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{postCategoryEnum.enumValues.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
              <div className="flex-1"><Label>País</Label><Input value={country} onChange={(e) => setCountry(e.target.value)} /></div>
            </div>
            <div><Label>Etiquetas</Label><Input value={tags} onChange={(e) => setTags(e.target.value)} /></div>
            <div className="flex items-center space-x-2"><Checkbox id="pub" checked={isPublished} onCheckedChange={(c) => setIsPublished(!!c)} /><Label htmlFor="pub">Publicar</Label></div>
            <Button type="submit" size="lg" className="w-full">Guardar Cambios</Button>
            {message && <p className={isError ? 'text-red-600' : 'text-green-600'}>{message}</p>}
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default EditPostPage;