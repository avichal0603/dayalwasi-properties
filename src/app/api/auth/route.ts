import { NextResponse } from 'next/server';
import { getAuthSettings, saveAuthSettings, verifyActivePassword } from '@/lib/authSettings';

export async function GET() {
  try {
    const settings = await getAuthSettings();
    return NextResponse.json({
      authMode: settings.authMode,
      hasCustomPin: Boolean(settings.customPin),
      updatedAt: settings.updatedAt,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch auth settings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, password, currentPassword, newPassword, authMode } = body;

    // Handle 3-step PIN change
    if (action === 'change-pin') {
      if (!currentPassword || !newPassword) {
        return NextResponse.json(
          { success: false, message: 'Current and new password are required' },
          { status: 400 }
        );
      }

      const isValidCurrent = await verifyActivePassword(currentPassword);
      if (!isValidCurrent) {
        return NextResponse.json(
          { success: false, message: 'Current password is incorrect' },
          { status: 401 }
        );
      }

      if (newPassword.trim().length < 4) {
        return NextResponse.json(
          { success: false, message: 'New password must be at least 4 characters long' },
          { status: 400 }
        );
      }

      if (newPassword.trim() === currentPassword.trim()) {
        return NextResponse.json(
          { success: false, message: 'New password must be different from current password' },
          { status: 400 }
        );
      }

      const saved = await saveAuthSettings({ customPin: newPassword.trim() });
      if (!saved) {
        return NextResponse.json(
          { success: false, message: 'Failed to save new PIN to database' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Access PIN updated successfully',
        updatedAt: new Date().toISOString(),
      });
    }

    // Handle session persistence mode update
    if (action === 'update-mode') {
      if (authMode !== 'cache' && authMode !== 'session') {
        return NextResponse.json({ success: false, message: 'Invalid mode' }, { status: 400 });
      }

      await saveAuthSettings({ authMode });
      return NextResponse.json({ success: true, authMode });
    }

    // Handle reset to factory default PIN
    if (action === 'reset-pin') {
      const isValid = await verifyActivePassword(currentPassword);
      if (!isValid) {
        return NextResponse.json(
          { success: false, message: 'Current password is required to reset' },
          { status: 401 }
        );
      }

      await saveAuthSettings({ customPin: null });
      return NextResponse.json({
        success: true,
        message: 'PIN successfully reset to default factory code (dayalwasi2024)',
      });
    }

    // Default: Login verification
    if (!password) {
      return NextResponse.json({ success: false, message: 'Password is required' }, { status: 400 });
    }

    const isValid = await verifyActivePassword(password);
    if (isValid) {
      const settings = await getAuthSettings();
      return NextResponse.json({
        success: true,
        authMode: settings.authMode,
      }, { status: 200 });
    } else {
      return NextResponse.json({ success: false, message: 'Incorrect password' }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Bad request' }, { status: 400 });
  }
}
