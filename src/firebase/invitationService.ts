import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { InvitationConfig } from '../types/invitation';

export async function saveInvitationConfig(uid: string, config: InvitationConfig): Promise<void> {
  await setDoc(doc(db, 'invitations', uid), {
    ...config,
    updatedAt: new Date().toISOString(),
  });
}

export async function getInvitationConfig(uid: string): Promise<InvitationConfig | null> {
  const snap = await getDoc(doc(db, 'invitations', uid));
  if (!snap.exists()) return null;
  return snap.data() as InvitationConfig;
}
