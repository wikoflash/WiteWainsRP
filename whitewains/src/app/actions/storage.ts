'use server';

import { db } from '@/lib/db';
import { storageItems, storageLogs, storageLocations } from '@/lib/db/schema';
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

export async function upsertStorageItem(data: {
  id?: number;
  name: string;
  category: 'gun' | 'resource' | 'ammo';
  quantity: number;
  locationId: number;
  notes?: string;
}) {
  const profile = await getEditorProfile();

  if (data.id) {
    const [existing] = await db.select().from(storageItems).where(eq(storageItems.id, data.id)).limit(1);
    await db.update(storageItems).set({
      name: data.name, category: data.category,
      quantity: data.quantity, locationId: data.locationId,
      notes: data.notes ?? null, lastUpdatedBy: profile.id,
      updatedAt: new Date(),
    }).where(eq(storageItems.id, data.id));

    await db.insert(storageLogs).values({
      itemId: data.id, changedBy: profile.id,
      oldQuantity: existing?.quantity ?? null, newQuantity: data.quantity,
      action: 'update',
    });
  } else {
    const [created] = await db.insert(storageItems).values({
      name: data.name, category: data.category,
      quantity: data.quantity, locationId: data.locationId,
      notes: data.notes ?? null, lastUpdatedBy: profile.id,
    }).returning();

    await db.insert(storageLogs).values({
      itemId: created.id, changedBy: profile.id,
      oldQuantity: null, newQuantity: data.quantity, action: 'create',
    });
  }

  revalidatePath('/storage');
  revalidatePath('/dashboard');
}

export async function deleteStorageItem(id: number) {
  const profile = await getEditorProfile();
  await db.insert(storageLogs).values({
    itemId: id, changedBy: profile.id,
    oldQuantity: 0, newQuantity: 0, action: 'delete',
  });
  await db.delete(storageItems).where(eq(storageItems.id, id));
  revalidatePath('/storage');
  revalidatePath('/dashboard');
}

export async function createLocation(name: string, description?: string) {
  await getEditorProfile();
  await db.insert(storageLocations).values({ name, description: description ?? null });
  revalidatePath('/dashboard');
}
