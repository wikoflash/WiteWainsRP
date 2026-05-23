import { redirect } from 'next/navigation';
import type { Profile } from '@/lib/db/schema';

export type Role = 'viewer' | 'editor' | 'admin';

const ROLE_LEVEL: Record<Role, number> = {
  viewer: 1,
  editor: 2,
  admin: 3,
};

export function hasRole(profile: Profile | null, minimum: Role): boolean {
  if (!profile) return false;
  return ROLE_LEVEL[profile.role as Role] >= ROLE_LEVEL[minimum];
}

export function requireRole(profile: Profile | null, minimum: Role): void {
  if (!hasRole(profile, minimum)) {
    redirect('/');
  }
}
