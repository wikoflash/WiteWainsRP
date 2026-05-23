import { db } from '@/lib/db';
import { profiles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import Image from 'next/image';

export const revalidate = 60;

const RANK_ORDER = ['Leader', 'Lieutenant', 'Sergeant', 'Member', 'Prospect'];

export default async function MembersPage() {
  let members: typeof profiles.$inferSelect[] = [];
  try {
    members = await db.select().from(profiles).where(eq(profiles.isPublic, true));
    members.sort((a, b) => {
      const ai = RANK_ORDER.indexOf(a.rank ?? 'Member');
      const bi = RANK_ORDER.indexOf(b.rank ?? 'Member');
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    });
  } catch {
    // DB not connected yet
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <p className="text-primary/70 text-xs tracking-[0.35em] uppercase mb-3">White Wains</p>
        <h1 className="text-4xl font-bold tracking-[0.12em] uppercase text-foreground mb-4">The Family</h1>
        <div className="flex items-center justify-center gap-4">
          <div className="h-px w-12 bg-primary/40" />
          <span className="text-primary/60 text-xs">✦</span>
          <div className="h-px w-12 bg-primary/40" />
        </div>
      </div>

      {members.length === 0 ? (
        <div className="border border-border bg-card p-8 text-center text-muted-foreground">
          <p className="text-sm">Family roster will appear here once members have joined.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {members.map((m) => (
            <div key={m.id} className="border border-border bg-card p-5 text-center">
              <div className="w-16 h-16 rounded-full mx-auto mb-3 border-2 border-border overflow-hidden bg-muted flex items-center justify-center">
                {m.avatarUrl ? (
                  <Image src={m.avatarUrl} alt={m.characterName} width={64} height={64} className="object-cover w-full h-full" />
                ) : (
                  <span className="text-muted-foreground text-2xl">✦</span>
                )}
              </div>
              <h2 className="text-foreground font-semibold tracking-wide text-sm">{m.characterName}</h2>
              {m.rank && (
                <span className="inline-block mt-1 text-xs text-primary/70 border border-primary/30 px-2 py-0.5 tracking-wider uppercase">
                  {m.rank}
                </span>
              )}
              {m.bio && (
                <p className="mt-2 text-muted-foreground text-xs leading-relaxed line-clamp-3">{m.bio}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
