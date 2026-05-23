import { db } from '@/lib/db';
import { gallery, profiles } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';
import Image from 'next/image';

export const revalidate = 60;

export default async function GalleryPage() {
  let items: (typeof gallery.$inferSelect & { memberName?: string | null })[] = [];
  try {
    const rows = await db
      .select({
        id: gallery.id,
        imageUrl: gallery.imageUrl,
        caption: gallery.caption,
        createdAt: gallery.createdAt,
        memberId: gallery.memberId,
        uploadedBy: gallery.uploadedBy,
        memberName: profiles.characterName,
      })
      .from(gallery)
      .leftJoin(profiles, eq(gallery.memberId, profiles.id))
      .orderBy(desc(gallery.createdAt));
    items = rows;
  } catch {
    // DB not connected yet
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <p className="text-primary/70 text-xs tracking-[0.35em] uppercase mb-3">White Wains</p>
        <h1 className="text-4xl font-bold tracking-[0.12em] uppercase text-foreground mb-4">Gallery</h1>
        <div className="flex items-center justify-center gap-4">
          <div className="h-px w-12 bg-primary/40" />
          <span className="text-primary/60 text-xs">✦</span>
          <div className="h-px w-12 bg-primary/40" />
        </div>
      </div>

      {items.length === 0 ? (
        <div className="border border-border bg-card p-8 text-center text-muted-foreground">
          <p className="text-sm">No photos yet. Family moments will be captured here.</p>
        </div>
      ) : (
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="break-inside-avoid border border-border overflow-hidden bg-card group">
              <div className="relative w-full aspect-auto">
                <Image
                  src={item.imageUrl}
                  alt={item.caption ?? 'Family photo'}
                  width={400}
                  height={300}
                  className="w-full h-auto object-cover"
                />
              </div>
              {(item.caption || item.memberName) && (
                <div className="p-3">
                  {item.caption && (
                    <p className="text-foreground text-xs leading-relaxed">{item.caption}</p>
                  )}
                  {item.memberName && (
                    <p className="text-muted-foreground text-xs mt-1">— {item.memberName}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
