import PageIntro from "@/components/mission/PageIntro";
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
import { useLang } from "@/lib/lang";

type Category = (typeof postCategoryEnum.enumValues)[number];

export default function EditPostPage() {
  const [match, params] = useRoute("/post/:id/edit");
  const postId = params?.id;
  const [, setLocation] = useLocation();
  const { L } = useLang();

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
        if (!res.ok) throw new Error(L("Error cargando la información del post.", "Error loading the post."));
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
    setIsError(false); setMessage(L('Guardando...', 'Saving...'));
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
        setIsError(false); setMessage(L("¡Actualizado!", "Updated!"));
        setTimeout(() => setLocation(`/post/${postId}`), 1000);
      } else {
        const data = await response.json();
        setIsError(true); setMessage(`Error: ${data.message}`);
      }
    } catch (error) { 
      setIsError(true); 
      setMessage(L('Error de red al intentar guardar.', 'Network error while saving.')); 
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

  if (isLoading) return <div className="flex flex-1 items-center justify-center py-24 text-sm text-muted-foreground animate-pulse">{L("Cargando post…", "Loading post…")}</div>;

  return (
    <div className="flex-1">
      <main className="page-container pb-24 pt-8 sm:pt-10">
        <PageIntro index="A2" label="Admin / Editor" title={L("Editar entrada", "Edit post")} />
        <div className="max-w-3xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div><Label>{L("Título", "Title")}</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} required/></div>
            
            {/* 🟢 SECCIÓN MULTIMEDIA ACTUALIZADA CON SMARTMEDIA */}
            <div className="space-y-3">
              <Label>{L("Ruta / URL multimedia (imagen o video de tu servidor)", "Media path / URL (image or video from your server)")}</Label>
              <Input 
                value={imageUrl} 
                onChange={(e) => setImageUrl(e.target.value)} 
                placeholder={L("Ej: /maquinados/electroerosion.mp4 o URL completa", "e.g. /maquinados/electroerosion.mp4 or a full URL")}
              />
              {imageUrl && (
                <div className="mt-2 border rounded-md p-2 bg-slate-50">
                  <p className="text-xs text-muted-foreground mb-1 font-medium">{L("Vista previa desde tu CDN:", "Preview from your CDN:")}</p>
                  <div className="max-h-[250px] overflow-hidden flex items-center justify-center">
                    <SmartMedia src={imageUrl} className="max-h-[230px] w-auto object-contain rounded" />
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex flex-col">
              <Label className="mb-2">{L("Contenido", "Content")}</Label>
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
                <Label>{L("Categoría", "Category")}</Label>
                <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {postCategoryEnum.enumValues.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1"><Label>{L("País", "Country")}</Label><Input value={country} onChange={(e) => setCountry(e.target.value)} /></div>
            </div>
            <div><Label>{L("Etiquetas (separadas por coma)", "Tags (comma-separated)")}</Label><Input value={tags} onChange={(e) => setTags(e.target.value)} /></div>
            <div className="flex items-center space-x-2"><Checkbox id="pub" checked={isPublished} onCheckedChange={(c) => setIsPublished(!!c)} /><Label htmlFor="pub">{L("Publicar", "Publish")}</Label></div>
            <Button type="submit" size="lg" className="w-full">{L("Guardar cambios", "Save changes")}</Button>
            {message && <p className={isError ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold'}>{message}</p>}
          </form>
        </div>
      </main>
    </div>
  );
}