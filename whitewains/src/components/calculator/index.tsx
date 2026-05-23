'use client';

import { useState, useCallback, useMemo } from 'react';

// ── Data ─────────────────────────────────────────────────────────────────────
const RES_KEYS = ['iron','wood','sap','treeSap','goldbar','cloth','animalFat','gunPowder','rope'] as const;
type ResKey = typeof RES_KEYS[number];

const RES_LABEL: Record<ResKey, string> = {
  iron: 'Iron', wood: 'Wood', sap: 'Sap', treeSap: 'Tree Sap',
  goldbar: 'Gold Bar', cloth: 'Cloth', animalFat: 'Animal Fat',
  gunPowder: 'Gun Powder', rope: 'Rope',
};

type Resources = Partial<Record<ResKey, number>>;

interface Item { id: string; name: string; res: Resources }
interface Category { label: string; items: Item[] }

const CATEGORIES: Category[] = [
  { label: 'Rifles', items: [
    { id: 'springfield', name: 'Springfield Rifle',    res: { iron: 11, wood: 15, sap: 7,  treeSap: 3, goldbar: 1 } },
    { id: 'boltaction',  name: 'Bolt Action Rifle',    res: { iron: 11, wood: 15, sap: 8,  treeSap: 4, goldbar: 1 } },
    { id: 'elephant',    name: 'Elephant Rifle',        res: { iron: 8,  wood: 15, sap: 8,  treeSap: 5, goldbar: 2 } },
  ]},
  { label: 'Repeaters', items: [
    { id: 'winchester',  name: 'Winchester Repeater',  res: { iron: 4, wood: 10, sap: 4, treeSap: 3 } },
  ]},
  { label: 'Shotguns', items: [
    { id: 'pump',        name: 'Pump Shotgun',          res: { iron: 10, wood: 20, sap: 13, treeSap: 5, goldbar: 1 } },
    { id: 'sawedoff',    name: 'Sawed-off Shotgun',     res: { iron: 10, wood: 20, sap: 11, treeSap: 3 } },
  ]},
  { label: 'Revolvers', items: [
    { id: 'lemat',       name: 'Lemat Revolver',        res: { iron: 10, wood: 7, sap: 6, treeSap: 3 } },
  ]},
  { label: 'Throwables', items: [
    { id: 'molotov',     name: 'Molotov',               res: { cloth: 2, animalFat: 5 } },
    { id: 'dynamite',    name: 'Dynamite',               res: { gunPowder: 30, rope: 1, animalFat: 10 } },
  ]},
  { label: 'Ammunition — per unit', items: [
    { id: 'a_slug',      name: 'Shotgun Slug',           res: { iron: 2, gunPowder: 5 } },
    { id: 'a_bexp',      name: 'Bolt Express',           res: { iron: 1, gunPowder: 7 } },
    { id: 'a_split',     name: 'Split Point',            res: { iron: 3, gunPowder: 5 } },
    { id: 'a_vel',       name: 'Velocity',               res: { iron: 2, gunPowder: 6 } },
    { id: 'a_eleph',     name: 'Elephant Ammo',          res: { iron: 2, gunPowder: 5 } },
    { id: 'a_dyn',       name: 'Dynamite Ammo',          res: { gunPowder: 10, animalFat: 10 } },
    { id: 'a_rsplit',    name: 'Repeater Split Point',   res: { iron: 3, gunPowder: 3 } },
    { id: 'a_rexp',      name: 'Repeater Express',       res: { iron: 1, gunPowder: 6 } },
  ]},
];

// ── Component ─────────────────────────────────────────────────────────────────
export function CraftingCalculator() {
  const [qty, setQtyState] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    CATEGORIES.forEach(c => c.items.forEach(i => { init[i.id] = 0; }));
    return init;
  });
  const [inv, setInv] = useState<Record<ResKey, string>>(() =>
    Object.fromEntries(RES_KEYS.map(r => [r, ''])) as Record<ResKey, string>
  );

  const totals = useMemo<Record<ResKey, number>>(() => {
    const t = Object.fromEntries(RES_KEYS.map(r => [r, 0])) as Record<ResKey, number>;
    CATEGORIES.forEach(cat => cat.items.forEach(item => {
      const q = qty[item.id] ?? 0;
      if (!q) return;
      (Object.entries(item.res) as [ResKey, number][]).forEach(([r, v]) => { t[r] += q * v; });
    }));
    return t;
  }, [qty]);

  const adjust = useCallback((id: string, delta: number) => {
    setQtyState(prev => ({ ...prev, [id]: Math.max(0, (prev[id] ?? 0) + delta) }));
  }, []);

  const set = useCallback((id: string, val: string) => {
    setQtyState(prev => ({ ...prev, [id]: Math.max(0, parseInt(val, 10) || 0) }));
  }, []);

  const clearAll = () => {
    setQtyState(prev => Object.fromEntries(Object.keys(prev).map(k => [k, 0])));
  };

  const hasAny = RES_KEYS.some(r => totals[r] > 0);

  return (
    <div className="flex flex-col lg:flex-row gap-0 lg:gap-0 min-h-[600px]">
      {/* Left: items */}
      <div className="flex-1 overflow-y-auto pr-0 lg:pr-6 space-y-6">
        {CATEGORIES.map(cat => (
          <div key={cat.label}>
            <h3 className="text-muted-foreground text-xs uppercase tracking-[0.18em] border-b border-border pb-2 mb-3">
              {cat.label}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {cat.items.map(item => {
                const active = (qty[item.id] ?? 0) > 0;
                return (
                  <div key={item.id} className={`flex items-center justify-between gap-2 border px-3 py-2.5 bg-card transition-colors ${active ? 'border-primary/60' : 'border-border'}`}>
                    <span className="text-sm text-foreground flex-1 leading-tight">{item.name}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => adjust(item.id, -1)} className="w-6 h-6 flex items-center justify-center border border-border bg-background hover:border-primary/50 text-foreground text-base leading-none transition-colors">−</button>
                      <input
                        type="number" min={0} max={999}
                        value={qty[item.id] ?? 0}
                        onChange={e => set(item.id, e.target.value)}
                        className="w-10 h-6 text-center bg-transparent border border-border text-foreground text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:outline-none focus:border-primary/60"
                      />
                      <button onClick={() => adjust(item.id, +1)} className="w-6 h-6 flex items-center justify-center border border-border bg-background hover:border-primary/50 text-foreground text-base leading-none transition-colors">+</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Right: totals + inventory */}
      <div className="w-full lg:w-72 shrink-0 border-t lg:border-t-0 lg:border-l border-border pt-6 lg:pt-0 lg:pl-6 space-y-6">
        {/* Totals */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-muted-foreground text-xs uppercase tracking-[0.18em]">Resources Needed</h3>
            <button onClick={clearAll} className="text-xs text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wide">Clear</button>
          </div>
          {!hasAny ? (
            <p className="text-muted-foreground text-xs italic text-center py-4">Set quantities to calculate</p>
          ) : (
            <div className="space-y-0">
              {RES_KEYS.map(r => {
                if (!totals[r]) return null;
                return (
                  <div key={r}>
                    <div className="flex justify-between py-1.5 border-b border-border/40">
                      <span className="text-sm text-muted-foreground">{RES_LABEL[r]}</span>
                      <span className="text-sm font-bold text-foreground font-mono">{totals[r]}</span>
                    </div>
                    {r === 'gunPowder' && totals[r] > 0 && (
                      <>
                        <div className="flex justify-between py-1 pl-4">
                          <span className="text-xs text-muted-foreground/60">↳ Coal</span>
                          <span className="text-xs text-muted-foreground font-mono">{totals[r]}</span>
                        </div>
                        <div className="flex justify-between py-1 pl-4">
                          <span className="text-xs text-muted-foreground/60">↳ Sulfur</span>
                          <span className="text-xs text-muted-foreground font-mono">{totals[r]}</span>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Inventory check */}
        <div>
          <h3 className="text-muted-foreground text-xs uppercase tracking-[0.18em] border-b border-border pb-2 mb-3">Your Inventory</h3>
          <div className="space-y-1">
            {RES_KEYS.map(r => {
              const need  = totals[r] ?? 0;
              const have  = parseInt(inv[r], 10);
              const valid = !isNaN(have) && need > 0;
              const ok    = valid && have >= need;
              const short = valid && have < need;
              return (
                <div key={r} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground flex-1">{RES_LABEL[r]}</span>
                  <input
                    type="number" min={0} placeholder="—"
                    value={inv[r]}
                    onChange={e => setInv(prev => ({ ...prev, [r]: e.target.value }))}
                    className="w-14 h-6 text-right bg-card border border-border text-foreground text-xs px-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:outline-none focus:border-primary/60"
                  />
                  <span className={`text-xs font-mono w-14 text-right ${ok ? 'text-green-500' : short ? 'text-destructive' : 'text-muted-foreground/40'}`}>
                    {ok ? `+${have - need}` : short ? `−${need - have}` : '—'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
