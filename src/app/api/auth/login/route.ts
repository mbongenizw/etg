import { NextResponse } from 'next/server';
import { login } from '@/lib/auth';
import { ensureAdminUser } from '@/lib/db';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    // Ensure admin user exists before attempting login
    await ensureAdminUser();
    
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const result = await login(email, password);

    if (!result.success || !result.token) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 401 }
      );
    }

    const cookieStore = await cookies();
    cookieStore.set('session_token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return NextResponse.json({
      success: true,
      user: {
        id: result.user!.id,
        username: result.user!.username,
        email: result.user!.email,
        fullName: result.user!.fullName,
        role: result.user!.role,
        phone: result.user!.phone,
        avatar: result.user!.avatar,
        isActive: result.user!.isActive,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'An error occurred' },
      { status: 500 }
    );
  }
}
