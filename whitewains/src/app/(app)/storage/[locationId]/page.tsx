import { db } from '@/lib/db';
import { storageItems, storageLocations, profiles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';

const CATEGORY_LABEL: Record<string, string> = { gun: 'Guns', resource: 'Resources', ammo: 'Ammunition' };
const CATEGORY_ORDER = ['gun', 'resource', 'ammo'];

export default async function StorageDetailPage({ params }: { params: Promise<{ locationId: string }> }) {
  const { locationId } = await params;
  const id = parseInt(locationId, 10);
  if (isNaN(id)) notFound();

  let location: typeof storageLocations.$inferSelect | undefined;
  let itemRows: (typeof storageItems.$inferSelect & { editorName?: string | null })[] = [];

  try {
    const locs = await db.select().from(storageLocations).where(eq(storageLocations.id, id)).limit(1);
    if (!locs.length) notFound();
    location = locs[0];

    itemRows = await db
      .select({
        id: storageItems.id,
        category: storageItems.category,
        name: storageItems.name,
        quantity: storageItems.quantity,
        locationId: storageItems.locationId,
        lastUpdatedBy: storageItems.lastUpdatedBy,
        notes: storageItems.notes,
        createdAt: storageItems.createdAt,
        updatedAt: storageItems.updatedAt,
        editorName: profiles.characterName,
      })
      .from(storageItems)
      .leftJoin(profiles, eq(storageItems.lastUpdatedBy, profiles.id))
      .where(eq(storageItems.locationId, id));

    itemRows.sort((a, b) => CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category));
  } catch {
    notFound();
  }

  const grouped = CATEGORY_ORDER.reduce<Record<string, typeof itemRows>>((acc, cat) => {
    acc[cat] = itemRows.filter(i => i.category === cat);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-[0.12em] uppercase text-foreground mb-1">{location?.name}</h1>
        {location?.description && <p className="text-muted-foreground text-sm">{location.description}</p>}
      </div>

      {itemRows.length === 0 ? (
        <div className="border border-border bg-card p-8 text-center text-muted-foreground text-sm">
          No items in this location yet.
        </div>
      ) : (
        CATEGORY_ORDER.map(cat => {
          const rows = grouped[cat];
          if (!rows?.length) return null;
          return (
            <div key={cat}>
              <h2 className="text-xs text-muted-foreground uppercase tracking-[0.18em] border-b border-border pb-2 mb-4">
                {CATEGORY_LABEL[cat]}
              </h2>
              <div className="border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-card">
                      <th className="text-left px-4 py-2.5 text-xs text-muted-foreground uppercase tracking-wider">Item</th>
                      <th className="text-right px-4 py-2.5 text-xs text-muted-foreground uppercase tracking-wider">Qty</th>
                      <th className="text-left px-4 py-2.5 text-xs text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Last Updated By</th>
                      <th className="text-left px-4 py-2.5 text-xs text-muted-foreground uppercase tracking-wider hidden md:table-cell">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((item, idx) => (
                      <tr key={item.id} className={idx % 2 === 0 ? 'bg-background' : 'bg-card'}>
                        <td className="px-4 py-2.5 text-foreground">{item.name}</td>
                        <td className="px-4 py-2.5 text-right font-mono font-bold text-primary">{item.quantity}</td>
                        <td className="px-4 py-2.5 text-muted-foreground hidden sm:table-cell">{item.editorName ?? '—'}</td>
                        <td className="px-4 py-2.5 text-muted-foreground text-xs hidden md:table-cell">{item.notes ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
