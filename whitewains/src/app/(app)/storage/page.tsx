import { db } from '@/lib/db';
import { storageLocations, storageItems } from '@/lib/db/schema';
import Link from 'next/link';

export default async function StoragePage() {
  let locations: (typeof storageLocations.$inferSelect & { itemCount: number })[] = [];

  try {
    const locs  = await db.select().from(storageLocations);
    const items = await db.select().from(storageItems);
    locations = locs.map(loc => ({
      ...loc,
      itemCount: items.filter(i => i.locationId === loc.id).length,
    }));
  } catch { /* DB not connected */ }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-[0.12em] uppercase text-foreground">Storage</h1>
      {locations.length === 0 ? (
        <div className="border border-border bg-card p-8 text-center text-muted-foreground text-sm">
          No storage locations yet.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {locations.map(loc => (
            <Link key={loc.id} href={`/storage/${loc.id}`}
              className="group border border-border bg-card p-5 hover:border-primary/50 transition-colors block">
              <h2 className="font-semibold text-foreground tracking-wide uppercase text-sm group-hover:text-primary transition-colors">{loc.name}</h2>
              {loc.description && <p className="text-muted-foreground text-xs mt-1">{loc.description}</p>}
              <p className="text-xs text-muted-foreground mt-3">{loc.itemCount} item type{loc.itemCount !== 1 ? 's' : ''}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
