'use server';

import { db } from '@/lib/db';
import { laws } from '@/lib/db/schema';
import { profiles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { createClient } from '@/lib/supabase/server';
import { hasRole } from '@/lib/permissions';
import { revalidatePath } from 'next/cache';

async function getEditorProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthenticated');
  const [profile] = await db.select().from(profiles).where(eq(profiles.id, user.id)).limit(1);
  if (!hasRole(profile ?? null, 'editor')) throw new Error('Forbidden');
  return profile;
}

export async function upsertLaw(data: { id?: number; title: string; content: string; orderNum: number }) {
  const profile = await getEditorProfile();
  if (data.id) {
    await db.update(laws).set({ title: data.title, content: data.content, orderNum: data.orderNum, updatedBy: profile.id, updatedAt: new Date() }).where(eq(laws.id, data.id));
  } else {
    await db.insert(laws).values({ title: data.title, content: data.content, orderNum: data.orderNum, updatedBy: profile.id });
  }
  revalidatePath('/laws');
}

export async function deleteLaw(id: number) {
  await getEditorProfile();
  await db.delete(laws).where(eq(laws.id, id));
  revalidatePath('/laws');
}
