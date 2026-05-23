import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

const NAV_LINKS = [
  { href: '/',           label: 'Home' },
  { href: '/laws',       label: 'Code of Laws' },
  { href: '/members',    label: 'Members' },
  { href: '/gallery',    label: 'Gallery' },
  { href: '/calculator', label: 'Crafting' },
];

export async function Navbar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <header className="border-b border-border bg-card sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-6">
        <Link href="/" className="text-primary font-bold tracking-[0.15em] uppercase text-sm whitespace-nowrap">
          White Wains
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map(({ href, label }) => (
            <Link key={href} href={href} className="text-muted-foreground hover:text-foreground text-sm tracking-wide transition-colors">
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3 shrink-0">
          {user ? (
            <Link href="/dashboard" className="text-sm text-primary border border-primary/50 px-3 py-1 hover:bg-primary/10 transition-colors tracking-wide">
              Storage
            </Link>
          ) : (
            <Link href="/auth/login" className="text-sm bg-primary text-primary-foreground px-4 py-1.5 hover:bg-primary/90 transition-colors tracking-wide uppercase">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
