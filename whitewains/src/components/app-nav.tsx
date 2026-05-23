import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { profiles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { hasRole } from '@/lib/permissions';

const VIEWER_LINKS = [
  { href: '/dashboard',       label: 'Dashboard' },
  { href: '/storage',         label: 'Storage' },
];

const EDITOR_LINKS = [
  { href: '/admin/storage',   label: 'Edit Storage' },
  { href: '/admin/gallery',   label: 'Gallery' },
  { href: '/admin/laws',      label: 'Laws' },
];

const ADMIN_LINKS = [
  { href: '/admin/members',   label: 'Members' },
];

export async function AppNav() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [profile] = await db.select().from(profiles).where(eq(profiles.id, user.id)).limit(1);
  const isEditor = hasRole(profile ?? null, 'editor');
  const isAdmin  = hasRole(profile ?? null, 'admin');

  return (
    <header className="border-b border-border bg-card sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-6">
        <Link href="/" className="text-primary font-bold tracking-[0.15em] uppercase text-sm">
          White Wains
        </Link>
        <nav className="flex items-center gap-5 overflow-x-auto">
          {VIEWER_LINKS.map(({ href, label }) => (
            <Link key={href} href={href} className="text-muted-foreground hover:text-foreground text-sm tracking-wide transition-colors whitespace-nowrap">
              {label}
            </Link>
          ))}
          {isEditor && EDITOR_LINKS.map(({ href, label }) => (
            <Link key={href} href={href} className="text-primary/70 hover:text-primary text-sm tracking-wide transition-colors whitespace-nowrap">
              {label}
            </Link>
          ))}
          {isAdmin && ADMIN_LINKS.map(({ href, label }) => (
            <Link key={href} href={href} className="text-primary/70 hover:text-primary text-sm tracking-wide transition-colors whitespace-nowrap">
              {label}
            </Link>
          ))}
        </nav>
        <form action="/auth/signout" method="POST">
          <button type="submit" className="text-xs text-muted-foreground hover:text-foreground transition-colors tracking-wide uppercase">
            Sign Out
          </button>
        </form>
      </div>
    </header>
  );
}
