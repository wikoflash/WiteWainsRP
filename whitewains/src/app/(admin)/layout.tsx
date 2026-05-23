import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { profiles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { hasRole } from '@/lib/permissions';
import { AppNav } from '@/components/app-nav';
import { Footer } from '@/components/footer';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const [profile] = await db.select().from(profiles).where(eq(profiles.id, user.id)).limit(1);
  if (!hasRole(profile ?? null, 'editor')) redirect('/dashboard');

  return (
    <>
      <AppNav />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">{children}</main>
      <Footer />
    </>
  );
}
