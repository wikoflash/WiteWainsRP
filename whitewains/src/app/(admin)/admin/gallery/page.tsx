import { db } from '@/lib/db';
import { gallery, profiles } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';
import { GalleryAdmin } from '@/components/gallery/gallery-admin';

export default async function AdminGalleryPage() {
  let items: (typeof gallery.$inferSelect & { uploaderName?: string | null })[] = [];
  let members: typeof profiles.$inferSelect[] = [];

  try {
    [items, members] = await Promise.all([
      db.select({ id: gallery.id, imageUrl: gallery.imageUrl, caption: gallery.caption, memberId: gallery.memberId, uploadedBy: gallery.uploadedBy, createdAt: gallery.createdAt, uploaderName: profiles.characterName })
        .from(gallery).leftJoin(profiles, eq(gallery.uploadedBy, profiles.id)).orderBy(desc(gallery.createdAt)),
      db.select().from(profiles),
    ]);
  } catch { /* DB not connected */ }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-[0.12em] uppercase text-foreground mb-1">Gallery Management</h1>
        <p className="text-muted-foreground text-sm">Upload photos and manage the family gallery.</p>
      </div>
      <GalleryAdmin initialItems={items} members={members} />
    </div>
  );
}
