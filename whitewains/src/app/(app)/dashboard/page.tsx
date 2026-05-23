import { db } from '@/lib/db';
import { storageItems, storageLocations } from '@/lib/db/schema';
import { eq, sum, count } from 'drizzle-orm';
import Link from 'next/link';

export default async function DashboardPage() {
  let locations: (typeof storageLocations.$inferSelect & { itemCount: number; totalQty: number })[] = [];
  let totals = { guns: 0, resources: 0, ammo: 0 };

  try {
    const locs = await db.select().from(storageLocations);
    const items = await db.select().from(storageItems);

    totals = {
      guns:      items.filter(i => i.category === 'gun').reduce((s, i) => s + i.quantity, 0),
      resources: items.filter(i => i.category === 'resource').reduce((s, i) => s + i.quantity, 0),
      ammo:      items.filter(i => i.category === 'ammo').reduce((s, i) => s + i.quantity, 0),
    };

    locations = locs.map(loc => {
      const locItems = items.filter(i => i.locationId === loc.id);
      return {
        ...loc,
        itemCount: locItems.length,
        totalQty:  locItems.reduce((s, i) => s + i.quantity, 0),
      };
    });
  } catch {
    // DB not connected
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-[0.12em] uppercase text-foreground mb-1">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Family storage overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Guns',      value: totals.guns },
          { label: 'Resources', value: totals.resources },
          { label: 'Ammo',      value: totals.ammo },
        ].map(({ label, value }) => (
          <div key={label} className="border border-border bg-card p-5 text-center">
            <div className="text-3xl font-bold text-primary font-mono">{value}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-[0.2em] mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Locations */}
      <div>
        <h2 className="text-xs text-muted-foreground uppercase tracking-[0.18em] border-b border-border pb-2 mb-4">Storage Locations</h2>
        {locations.length === 0 ? (
          <p className="text-muted-foreground text-sm">No storage locations yet. An admin must create them first.</p>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {locations.map(loc => (
              <Link key={loc.id} href={`/storage/${loc.id}`} className="group border border-border bg-card p-5 hover:border-primary/50 transition-colors block">
                <h3 className="font-semibold text-foreground tracking-wide uppercase text-sm group-hover:text-primary transition-colors">{loc.name}</h3>
                {loc.description && <p className="text-muted-foreground text-xs mt-1 line-clamp-2">{loc.description}</p>}
                <p className="text-xs text-muted-foreground mt-3">{loc.itemCount} item types · {loc.totalQty} total units</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
