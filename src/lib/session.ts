import { cookies } from 'next/headers';
import { IronSession, getIronSession } from 'iron-session';

export type AppSession = {
  userId?: string;
  role?: 'owner' | 'admin' | 'manager' | 'mitarbeiter';
};

const SESSION_COOKIE_NAME = 'geldtransfer_session';

// Session-Konfiguration als Konstante definieren
const getSessionConfig = () => {
  const password = process.env.SESSION_SECRET || 'geldtransfer-super-secret-key-for-iron-session-2024-very-long-password-minimum-32-chars';
  
  console.log('SESSION_SECRET loaded:', !!process.env.SESSION_SECRET, 'Length:', password.length);
  
  if (password.length < 32) {
    throw new Error(
      `SESSION_SECRET must be at least 32 characters long. Current length: ${password.length}`
    );
  }

  return {
    cookieName: SESSION_COOKIE_NAME,
    password,
    ttl: 60 * 60 * 8, // 8h
    cookieOptions: {
      httpOnly: true,
      sameSite: 'lax' as const,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    },
  };
};

export async function getSession(): Promise<IronSession<AppSession>> {
  const cookieStore = await cookies();
  const config = getSessionConfig();
  
  return getIronSession<AppSession>(cookieStore, config);
}

export async function requireSession() {
  const session = await getSession();
  if (!session.userId) throw new Error('Unauthorized');
  return session;
}

export function hasRole(session: AppSession, roles: AppSession['role'][]): boolean {
  if (!session.role) return false;
  return roles.includes(session.role) || (session.role === 'owner' && roles.length > 0);
}