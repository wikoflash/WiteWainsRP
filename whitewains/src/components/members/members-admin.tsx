'use client';

import { useState, useTransition } from 'react';
import { updateMemberRole, updateMemberVisibility } from '@/app/actions/members';
import type { Profile } from '@/lib/db/schema';

const ROLES: Profile['role'][] = ['viewer', 'editor', 'admin'];

export function MembersAdmin({ initialMembers }: { initialMembers: Profile[] }) {
  const [pending, startTransition] = useTransition();

  function setRole(id: string, role: 'viewer' | 'editor' | 'admin') {
    startTransition(async () => { await updateMemberRole(id, role); });
  }

  function setVisible(id: string, val: boolean) {
    startTransition(async () => { await updateMemberVisibility(id, val); });
  }

  return (
    <div className="border border-border overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-card">
            <th className="text-left px-4 py-2.5 text-xs text-muted-foreground uppercase tracking-wider">Character</th>
            <th className="text-left px-4 py-2.5 text-xs text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Discord</th>
            <th className="text-left px-4 py-2.5 text-xs text-muted-foreground uppercase tracking-wider">Role</th>
            <th className="text-center px-4 py-2.5 text-xs text-muted-foreground uppercase tracking-wider">Public</th>
          </tr>
        </thead>
        <tbody>
          {initialMembers.map((m, idx) => (
            <tr key={m.id} className={idx % 2 === 0 ? 'bg-background' : 'bg-card'}>
              <td className="px-4 py-2.5">
                <div className="text-foreground font-medium">{m.characterName}</div>
                {m.rank && <div className="text-xs text-muted-foreground">{m.rank}</div>}
              </td>
              <td className="px-4 py-2.5 text-muted-foreground hidden sm:table-cell">{m.discordUsername ?? '—'}</td>
              <td className="px-4 py-2.5">
                <select
                  value={m.role}
                  disabled={pending}
                  onChange={e => setRole(m.id, e.target.value as 'viewer' | 'editor' | 'admin')}
                  className="bg-background border border-border px-2 py-1 text-xs text-foreground focus:outline-none focus:border-primary/60 uppercase tracking-wide disabled:opacity-50"
                >
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </td>
              <td className="px-4 py-2.5 text-center">
                <input
                  type="checkbox"
                  checked={m.isPublic}
                  disabled={pending}
                  onChange={e => setVisible(m.id, e.target.checked)}
                  className="accent-primary w-4 h-4"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
