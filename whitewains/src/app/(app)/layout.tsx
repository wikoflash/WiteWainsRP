import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AppNav } from '@/components/app-nav';
import { Footer } from '@/components/footer';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');

  return (
    <>
      <AppNav />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">{children}</main>
      <Footer />
    </>
  );
}
