'use client';

import { useState, useTransition, useRef } from 'react';
import { addGalleryItem, deleteGalleryItem, getUploadUrl } from '@/app/actions/gallery';
import type { Profile } from '@/lib/db/schema';
import Image from 'next/image';

interface GalleryRow { id: number; imageUrl: string; caption?: string | null; memberId?: string | null; uploaderName?: string | null; uploadedBy?: string | null; createdAt: Date; }

interface Props {
  initialItems: GalleryRow[];
  members: Profile[];
}

export function GalleryAdmin({ initialItems, members }: Props) {
  const [pending, startTransition] = useTransition();
  const [caption, setCaption] = useState('');
  const [memberId, setMemberId] = useState('');
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) { setUploadStatus('Select a file first.'); return; }
    setUploadStatus('Uploading…');

    startTransition(async () => {
      try {
        const { signedUrl, path } = await getUploadUrl(file.name, file.type);
        const res = await fetch(signedUrl, { method: 'PUT', body: file, headers: { 'content-type': file.type } });
        if (!res.ok) throw new Error('Upload failed');

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const publicUrl = `${supabaseUrl}/storage/v1/object/public/family/${path}`;
        await addGalleryItem(publicUrl, caption || undefined, memberId || undefined);

        setCaption(''); setMemberId(''); setUploadStatus('Uploaded!');
        if (fileRef.current) fileRef.current.value = '';
        setTimeout(() => setUploadStatus(null), 3000);
      } catch (err: unknown) {
        setUploadStatus(err instanceof Error ? err.message : 'Upload error');
      }
    });
  }

  function handleDelete(id: number) {
    if (!confirm('Delete this photo?')) return;
    startTransition(async () => { await deleteGalleryItem(id); });
  }

  return (
    <div className="space-y-8">
      {/* Upload form */}
      <div className="border border-border bg-card p-6">
        <h2 className="text-xs text-muted-foreground uppercase tracking-[0.18em] mb-4">Upload Photo</h2>
        <form onSubmit={handleUpload} className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground uppercase tracking-wider">Image *</label>
              <input ref={fileRef} type="file" accept="image/*" required className="w-full text-sm text-muted-foreground file:mr-3 file:bg-primary file:text-primary-foreground file:border-0 file:px-3 file:py-1 file:text-xs file:uppercase file:tracking-wider" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground uppercase tracking-wider">Caption</label>
              <input value={caption} onChange={e => setCaption(e.target.value)} className="w-full h-9 bg-background border border-border px-3 text-sm text-foreground focus:outline-none focus:border-primary/60" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground uppercase tracking-wider">Tag Member (optional)</label>
              <select value={memberId} onChange={e => setMemberId(e.target.value)} className="w-full h-9 bg-background border border-border px-3 text-sm text-foreground focus:outline-none focus:border-primary/60">
                <option value="">— None —</option>
                {members.map(m => <option key={m.id} value={m.id}>{m.characterName}</option>)}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button type="submit" disabled={pending} className="bg-primary text-primary-foreground px-6 py-2 text-sm uppercase tracking-wider hover:bg-primary/90 transition-colors disabled:opacity-50">
              {pending ? 'Uploading…' : 'Upload'}
            </button>
            {uploadStatus && <span className="text-sm text-muted-foreground">{uploadStatus}</span>}
          </div>
        </form>
      </div>

      {/* Grid */}
      {initialItems.length === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-8">No photos yet.</p>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {initialItems.map(item => (
            <div key={item.id} className="border border-border bg-card overflow-hidden group">
              <div className="relative aspect-video">
                <Image src={item.imageUrl} alt={item.caption ?? 'Gallery photo'} fill className="object-cover" />
              </div>
              <div className="p-3 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  {item.caption && <p className="text-xs text-foreground truncate">{item.caption}</p>}
                  <p className="text-xs text-muted-foreground mt-0.5">by {item.uploaderName ?? '—'}</p>
                </div>
                <button onClick={() => handleDelete(item.id)} className="text-xs text-destructive/60 hover:text-destructive transition-colors uppercase shrink-0">Del</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
