'use server';

import { db } from '@/lib/db';
import { gallery, profiles } from '@/lib/db/schema';
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
  return { profile, user };
}

export async function addGalleryItem(imageUrl: string, caption?: string, memberId?: string) {
  const { profile } = await getEditorProfile();
  await db.insert(gallery).values({
    imageUrl, caption: caption ?? null,
    memberId: memberId ?? null, uploadedBy: profile.id,
  });
  revalidatePath('/gallery');
}

export async function deleteGalleryItem(id: number) {
  await getEditorProfile();
  await db.delete(gallery).where(eq(gallery.id, id));
  revalidatePath('/gallery');
}

export async function getUploadUrl(fileName: string, contentType: string) {
  const { user } = await getEditorProfile();
  const supabase = await createClient();
  const path = `gallery/${user.id}/${Date.now()}-${fileName}`;
  const { data, error } = await supabase.storage.from('family').createSignedUploadUrl(path);
  if (error) throw new Error(error.message);
  return { signedUrl: data.signedUrl, path, token: data.token };
}
