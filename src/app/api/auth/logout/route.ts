import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    // Clear Google tokens cookie
    const cookieStore = cookies();
    cookieStore.delete('google_tokens');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error during logout:', error);
    return NextResponse.json({ error: 'Failed to logout' }, { status: 500 });
  }
} 