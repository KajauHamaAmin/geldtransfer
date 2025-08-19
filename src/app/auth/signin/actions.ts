'use server';

import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';

export async function loginAction(formData: FormData) {
  try {
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    if (!username || !password) {
      throw new Error('Benutzername und Passwort sind erforderlich');
    }

    const user = await prisma.user.findUnique({ 
      where: { username, active: true } 
    });
    
    if (!user) {
      throw new Error('Ungültige Zugangsdaten');
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new Error('Ungültige Zugangsdaten');
    }

    const session = await getSession();
    session.userId = user.id;
    session.role = user.role as any; // 'owner' | 'admin' | 'manager' | 'mitarbeiter'
    await session.save();

    return { success: true };
  } catch (error) {
    console.error('Login error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unbekannter Fehler' 
    };
  }
}

export async function logoutAction() {
  const session = await getSession();
  session.destroy();
  redirect('/auth/signin');
}
