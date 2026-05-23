import { db } from '@/lib/db';
import { profiles } from '@/lib/db/schema';
import { MembersAdmin } from '@/components/members/members-admin';

export default async function AdminMembersPage() {
  let members: typeof profiles.$inferSelect[] = [];
  try {
    members = await db.select().from(profiles).orderBy(profiles.createdAt);
  } catch { /* DB not connected */ }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-[0.12em] uppercase text-foreground mb-1">Member Management</h1>
        <p className="text-muted-foreground text-sm">Set roles and visibility for family members. Only admins can change roles.</p>
      </div>
      <MembersAdmin initialMembers={members} />
    </div>
  );
}
