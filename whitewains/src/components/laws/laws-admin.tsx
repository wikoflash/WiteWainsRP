'use client';

import { useState, useTransition } from 'react';
import { upsertLaw, deleteLaw } from '@/app/actions/laws';
import type { Law } from '@/lib/db/schema';

export function LawsAdmin({ initialLaws }: { initialLaws: Law[] }) {
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState<{ id?: number; title: string; content: string; orderNum: string }>({ title: '', content: '', orderNum: '0' });

  function edit(law: Law) {
    setForm({ id: law.id, title: law.title, content: law.content, orderNum: String(law.orderNum) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function reset() { setForm({ title: '', content: '', orderNum: '0' }); }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      await upsertLaw({ id: form.id, title: form.title, content: form.content, orderNum: parseInt(form.orderNum, 10) || 0 });
      reset();
    });
  }

  function handleDelete(id: number) {
    if (!confirm('Delete this law?')) return;
    startTransition(async () => { await deleteLaw(id); });
  }

  return (
    <div className="space-y-8">
      {/* Form */}
      <div className="border border-border bg-card p-6">
        <h2 className="text-xs text-muted-foreground uppercase tracking-[0.18em] mb-4">{form.id ? 'Edit Law' : 'Add Law'}</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground uppercase tracking-wider">Title *</label>
              <input required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                className="w-full h-9 bg-background border border-border px-3 text-sm text-foreground focus:outline-none focus:border-primary/60" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground uppercase tracking-wider">Order #</label>
              <input type="number" min={0} value={form.orderNum} onChange={e => setForm(p => ({ ...p, orderNum: e.target.value }))}
                className="w-full h-9 bg-background border border-border px-3 text-sm text-foreground focus:outline-none focus:border-primary/60" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground uppercase tracking-wider">Content *</label>
            <textarea required rows={4} value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
              className="w-full bg-background border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/60 resize-y" />
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={pending} className="bg-primary text-primary-foreground px-6 py-2 text-sm uppercase tracking-wider hover:bg-primary/90 transition-colors disabled:opacity-50">
              {pending ? 'Saving…' : form.id ? 'Update' : 'Add Law'}
            </button>
            {form.id && <button type="button" onClick={reset} className="border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</button>}
          </div>
        </form>
      </div>

      {/* Law list */}
      <div className="space-y-3">
        {initialLaws.map((law, i) => (
          <div key={law.id} className="border border-border bg-card p-5 flex gap-4">
            <span className="text-primary/40 font-bold text-lg shrink-0">{String(i + 1).padStart(2, '0')}</span>
            <div className="flex-1">
              <h3 className="text-foreground font-semibold uppercase tracking-wide text-sm">{law.title}</h3>
              <p className="text-muted-foreground text-sm mt-1 whitespace-pre-line line-clamp-3">{law.content}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => edit(law)} className="text-xs text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wide">Edit</button>
              <button onClick={() => handleDelete(law.id)} className="text-xs text-destructive/70 hover:text-destructive transition-colors uppercase tracking-wide">Del</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
