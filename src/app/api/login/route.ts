'use server';
import {auth} from 'firebase-admin';
import {cookies} from 'next/headers';
import {NextRequest, NextResponse} from 'next/server';
import {initializeAdminApp} from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  const {idToken} = await request.json();

  const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days

  await initializeAdminApp();
  const sessionCookie = await auth().createSessionCookie(idToken, {expiresIn});

  cookies().set('session', sessionCookie, {
    maxAge: expiresIn,
    httpOnly: true,
    secure: true,
  });

  return NextResponse.json({status: 'success'});
}
