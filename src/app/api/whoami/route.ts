import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session.userId) {
      return NextResponse.json({ 
        authenticated: false, 
        message: 'Not logged in' 
      }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      userId: session.userId,
      role: session.role || 'unknown',
      message: 'Session active'
    });
  } catch (error) {
    console.error('Whoami error:', error);
    return NextResponse.json({ 
      authenticated: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
