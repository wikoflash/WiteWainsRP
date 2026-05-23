import { db } from '@/lib/db';
import { laws } from '@/lib/db/schema';
import { asc } from 'drizzle-orm';
import { LawsAdmin } from '@/components/laws/laws-admin';

export default async function AdminLawsPage() {
  let items: typeof laws.$inferSelect[] = [];
  try {
    items = await db.select().from(laws).orderBy(asc(laws.orderNum));
  } catch { /* DB not connected */ }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-[0.12em] uppercase text-foreground mb-1">Manage Laws</h1>
        <p className="text-muted-foreground text-sm">Add, edit, and reorder the family code of laws.</p>
      </div>
      <LawsAdmin initialLaws={items} />
    </div>
  );
}
