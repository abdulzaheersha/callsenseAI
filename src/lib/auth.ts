import { cookies } from 'next/headers';
import { auth } from 'firebase-admin';
import { initializeAdminApp } from '@/lib/firebase-admin';
import type { Session, User, Roles } from './types';

export async function getSession(): Promise<Session | null> {
  const sessionCookie = cookies().get('session')?.value;
  if (!sessionCookie) {
    return null;
  }

  try {
    await initializeAdminApp();
    const decodedClaims = await auth().verifySessionCookie(sessionCookie, true);
    
    const user: User = {
        uid: decodedClaims.uid,
        email: decodedClaims.email || null,
        role: (decodedClaims.role as Roles) || Roles.Agent, // Default to Agent role
    };

    return { ...user, isLoggedIn: true };
  } catch (error) {
    console.error('Session verification failed:', error);
    return null;
  }
}
