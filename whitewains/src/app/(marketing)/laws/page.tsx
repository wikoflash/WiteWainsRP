import { db } from '@/lib/db';
import { laws } from '@/lib/db/schema';
import { asc } from 'drizzle-orm';

export const revalidate = 60;

export default async function LawsPage() {
  let items: typeof laws.$inferSelect[] = [];
  try {
    items = await db.select().from(laws).orderBy(asc(laws.orderNum));
  } catch {
    // DB not connected yet — show placeholder
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <p className="text-primary/70 text-xs tracking-[0.35em] uppercase mb-3">White Wains</p>
        <h1 className="text-4xl font-bold tracking-[0.12em] uppercase text-foreground mb-4">Code of Laws</h1>
        <div className="flex items-center justify-center gap-4">
          <div className="h-px w-12 bg-primary/40" />
          <span className="text-primary/60 text-xs">✦</span>
          <div className="h-px w-12 bg-primary/40" />
        </div>
      </div>

      {items.length === 0 ? (
        <div className="border border-border bg-card p-8 text-center text-muted-foreground">
          <p className="text-sm">Laws will be posted here once the family council convenes.</p>
        </div>
      ) : (
        <ol className="space-y-6">
          {items.map((law, i) => (
            <li key={law.id} className="border border-border bg-card p-6 flex gap-5">
              <span className="text-primary/50 font-bold text-xl shrink-0 pt-0.5" style={{ fontVariantNumeric: 'oldstyle-nums' }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <h2 className="text-foreground font-semibold uppercase tracking-wider text-sm mb-2">{law.title}</h2>
                <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">{law.content}</p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
