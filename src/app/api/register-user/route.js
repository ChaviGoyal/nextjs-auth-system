import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // make sure this path is correct

export async function POST(req) {
  try {
    const body = await req.json();
    console.log('📥 Incoming request body:', body);

    const { email, username, password } = body;

    // Extra validation log
    if (!email || !username || !password) {
      console.warn(' Missing fields:', { email, username, password });
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }

    // Prisma user creation
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password,
      },
    });

    console.log('✅ User created:', user);

    return NextResponse.json({ success: true, user });

  } catch (error) {
    console.error('🔥 Error during registration:', error);

    // If it's a Prisma known error (e.g. duplicate)
    if (error.code === 'P2002') {
      return NextResponse.json(
        {
          success: false,
          message: `Duplicate entry for ${error.meta.target}`,
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
