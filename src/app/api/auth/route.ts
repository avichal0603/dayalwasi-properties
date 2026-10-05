import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    const correctPassword = process.env.APP_PASSWORD;

    if (!correctPassword) {
      console.error('APP_PASSWORD is not set in environment variables');
      return NextResponse.json({ success: false, message: 'Server configuration error' }, { status: 500 });
    }

    if (password === correctPassword) {
      return NextResponse.json({ success: true }, { status: 200 });
    } else {
      return NextResponse.json({ success: false, message: 'Invalid password' }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Bad request' }, { status: 400 });
  }
}
