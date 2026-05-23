'use client';

import { useState, useTransition } from 'react';
import { upsertStorageItem, deleteStorageItem, createLocation } from '@/app/actions/storage';
import type { StorageItem, StorageLocation } from '@/lib/db/schema';

type Category = 'gun' | 'resource' | 'ammo';
const CATS: Category[] = ['gun', 'resource', 'ammo'];
const CAT_LABEL: Record<Category, string> = { gun: 'Gun', resource: 'Resource', ammo: 'Ammo' };

interface Props {
  initialItems: StorageItem[];
  locations: StorageLocation[];
}

export function StorageAdmin({ initialItems, locations }: Props) {
  const [items, setItems] = useState(initialItems);
  const [locs, setLocs]   = useState(locations);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // New item form state
  const [form, setForm] = useState<{
    id?: number; name: string; category: Category; quantity: string; locationId: string; notes: string;
  }>({ name: '', category: 'gun', quantity: '0', locationId: String(locs[0]?.id ?? ''), notes: '' });

  // New location form
  const [locForm, setLocForm] = useState({ name: '', description: '' });

  function resetForm() {
    setForm({ name: '', category: 'gun', quantity: '0', locationId: String(locs[0]?.id ?? ''), notes: '' });
  }

  function editItem(item: StorageItem) {
    setForm({ id: item.id, name: item.name, category: item.category as Category, quantity: String(item.quantity), locationId: String(item.locationId ?? ''), notes: item.notes ?? '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const locationId = parseInt(form.locationId, 10);
    const quantity   = parseInt(form.quantity, 10);
    if (!form.name.trim() || isNaN(locationId) || isNaN(quantity)) { setError('Fill in all required fields.'); return; }
    startTransition(async () => {
      try {
        await upsertStorageItem({ id: form.id, name: form.name.trim(), category: form.category, quantity, locationId, notes: form.notes || undefined });
        resetForm();
        // Re-fetch is handled by revalidatePath — in a real app you'd router.refresh()
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Error saving item.');
      }
    });
  }

  function handleDelete(id: number) {
    if (!confirm('Delete this item?')) return;
    startTransition(async () => { await deleteStorageItem(id); });
  }

  function handleCreateLocation(e: React.FormEvent) {
    e.preventDefault();
    if (!locForm.name.trim()) return;
    startTransition(async () => {
      await createLocation(locForm.name.trim(), locForm.description || undefined);
      setLocForm({ name: '', description: '' });
    });
  }

  const filteredItems = (cat: Category) => items.filter(i => i.category === cat);

  return (
    <div className="space-y-8">
      {error && <div className="border border-destructive/50 bg-destructive/10 text-destructive text-sm px-4 py-2">{error}</div>}

      {/* Item form */}
      <div className="border border-border bg-card p-6">
        <h2 className="text-xs text-muted-foreground uppercase tracking-[0.18em] mb-4">
          {form.id ? 'Edit Item' : 'Add Item'}
        </h2>
        <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground uppercase tracking-wider">Name *</label>
            <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              className="w-full h-9 bg-background border border-border px-3 text-sm text-foreground focus:outline-none focus:border-primary/60" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground uppercase tracking-wider">Category *</label>
            <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value as Category }))}
              className="w-full h-9 bg-background border border-border px-3 text-sm text-foreground focus:outline-none focus:border-primary/60">
              {CATS.map(c => <option key={c} value={c}>{CAT_LABEL[c]}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground uppercase tracking-wider">Quantity *</label>
            <input type="number" min={0} required value={form.quantity} onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))}
              className="w-full h-9 bg-background border border-border px-3 text-sm text-foreground focus:outline-none focus:border-primary/60" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground uppercase tracking-wider">Location *</label>
            <select value={form.locationId} onChange={e => setForm(p => ({ ...p, locationId: e.target.value }))}
              className="w-full h-9 bg-background border border-border px-3 text-sm text-foreground focus:outline-none focus:border-primary/60">
              {locs.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>
          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs text-muted-foreground uppercase tracking-wider">Notes</label>
            <input value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
              className="w-full h-9 bg-background border border-border px-3 text-sm text-foreground focus:outline-none focus:border-primary/60" />
          </div>
          <div className="sm:col-span-2 md:col-span-3 flex gap-3">
            <button type="submit" disabled={pending}
              className="bg-primary text-primary-foreground px-6 py-2 text-sm uppercase tracking-wider hover:bg-primary/90 transition-colors disabled:opacity-50">
              {pending ? 'Saving…' : form.id ? 'Update' : 'Add Item'}
            </button>
            {form.id && <button type="button" onClick={resetForm} className="border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</button>}
          </div>
        </form>
      </div>

      {/* Items table per category */}
      {CATS.map(cat => {
        const rows = filteredItems(cat);
        if (!rows.length) return null;
        return (
          <div key={cat}>
            <h2 className="text-xs text-muted-foreground uppercase tracking-[0.18em] border-b border-border pb-2 mb-3">{CAT_LABEL[cat]}s</h2>
            <div className="border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-card">
                    <th className="text-left px-4 py-2 text-xs text-muted-foreground uppercase tracking-wider">Name</th>
                    <th className="text-right px-4 py-2 text-xs text-muted-foreground uppercase tracking-wider">Qty</th>
                    <th className="text-left px-4 py-2 text-xs text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Location</th>
                    <th className="px-4 py-2 text-xs text-muted-foreground uppercase tracking-wider w-24">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((item, idx) => (
                    <tr key={item.id} className={idx % 2 === 0 ? 'bg-background' : 'bg-card'}>
                      <td className="px-4 py-2 text-foreground">{item.name}</td>
                      <td className="px-4 py-2 text-right font-mono font-bold text-primary">{item.quantity}</td>
                      <td className="px-4 py-2 text-muted-foreground hidden sm:table-cell">
                        {locs.find(l => l.id === item.locationId)?.name ?? '—'}
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex gap-2">
                          <button onClick={() => editItem(item)} className="text-xs text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wide">Edit</button>
                          <button onClick={() => handleDelete(item.id)} className="text-xs text-destructive/70 hover:text-destructive transition-colors uppercase tracking-wide">Del</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      {/* Location creator */}
      <div className="border border-border bg-card p-5">
        <h2 className="text-xs text-muted-foreground uppercase tracking-[0.18em] mb-3">Add Storage Location</h2>
        <form onSubmit={handleCreateLocation} className="flex gap-3 flex-wrap">
          <input required placeholder="Location name" value={locForm.name} onChange={e => setLocForm(p => ({ ...p, name: e.target.value }))}
            className="h-9 bg-background border border-border px-3 text-sm text-foreground focus:outline-none focus:border-primary/60 flex-1 min-w-40" />
          <input placeholder="Description (optional)" value={locForm.description} onChange={e => setLocForm(p => ({ ...p, description: e.target.value }))}
            className="h-9 bg-background border border-border px-3 text-sm text-foreground focus:outline-none focus:border-primary/60 flex-1 min-w-40" />
          <button type="submit" disabled={pending} className="bg-primary text-primary-foreground px-5 py-2 text-sm uppercase tracking-wider hover:bg-primary/90 transition-colors disabled:opacity-50">
            Create
          </button>
        </form>
      </div>
    </div>
  );
}
