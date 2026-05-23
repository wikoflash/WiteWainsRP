'use server';

import { db } from '@/lib/db';
import { profiles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { createClient } from '@/lib/supabase/server';
import { hasRole } from '@/lib/permissions';
import { revalidatePath } from 'next/cache';

async function getAdminProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthenticated');
  const [profile] = await db.select().from(profiles).where(eq(profiles.id, user.id)).limit(1);
  if (!hasRole(profile ?? null, 'admin')) throw new Error('Forbidden');
  return profile;
}

export async function updateMemberRole(memberId: string, role: 'viewer' | 'editor' | 'admin') {
  await getAdminProfile();
  await db.update(profiles).set({ role }).where(eq(profiles.id, memberId));
  revalidatePath('/admin/members');
}

export async function updateMemberVisibility(memberId: string, isPublic: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthenticated');
  const [profile] = await db.select().from(profiles).where(eq(profiles.id, user.id)).limit(1);
  if (!hasRole(profile ?? null, 'editor')) throw new Error('Forbidden');
  await db.update(profiles).set({ isPublic }).where(eq(profiles.id, memberId));
  revalidatePath('/admin/members');
  revalidatePath('/members');
}

export async function updateMemberProfile(memberId: string, data: { characterName?: string; rank?: string; bio?: string }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthenticated');
  const [profile] = await db.select().from(profiles).where(eq(profiles.id, user.id)).limit(1);
  // Can edit own profile or admin can edit anyone
  if (user.id !== memberId && !hasRole(profile ?? null, 'admin')) throw new Error('Forbidden');
  await db.update(profiles).set(data).where(eq(profiles.id, memberId));
  revalidatePath('/members');
  revalidatePath('/admin/members');
}
