import { db } from '@/lib/db';
import { storageItems, storageLocations } from '@/lib/db/schema';
import { StorageAdmin } from '@/components/storage/storage-admin';

export default async function AdminStoragePage() {
  let items: typeof storageItems.$inferSelect[] = [];
  let locations: typeof storageLocations.$inferSelect[] = [];

  try {
    [items, locations] = await Promise.all([
      db.select().from(storageItems),
      db.select().from(storageLocations),
    ]);
  } catch {
    // DB not connected
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-[0.12em] uppercase text-foreground mb-1">Storage Management</h1>
        <p className="text-muted-foreground text-sm">Add, edit, and remove items from family storage.</p>
      </div>
      <StorageAdmin initialItems={items} locations={locations} />
    </div>
  );
}
