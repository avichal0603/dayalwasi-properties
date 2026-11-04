import { NextResponse } from 'next/server';
import { getAuthSettings, saveAuthSettings, verifyActivePassword } from '@/lib/authSettings';
import {
  getClientFingerprint,
  checkRateLimit,
  recordFailedLogin,
  recordSuccessfulLogin,
} from '@/lib/rateLimit';

export async function GET() {
  try {
    const settings = await getAuthSettings();
    return NextResponse.json({
      authMode: settings.authMode,
      hasCustomPin: Boolean(settings.customPin),
      updatedAt: settings.updatedAt,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch auth settings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, password, currentPassword, newPassword, authMode } = body;
    const clientKey = getClientFingerprint(request);

    // Handle 3-step PIN change
    if (action === 'change-pin') {
      if (!currentPassword || !newPassword) {
        return NextResponse.json(
          { success: false, message: 'Current and new PIN are required' },
          { status: 400 }
        );
      }

      const isValidCurrent = await verifyActivePassword(currentPassword);
      if (!isValidCurrent) {
        return NextResponse.json(
          { success: false, message: 'Current PIN is incorrect' },
          { status: 401 }
        );
      }

      if (newPassword.trim().length < 4) {
        return NextResponse.json(
          { success: false, message: 'New PIN must be at least 4 digits or characters long' },
          { status: 400 }
        );
      }

      if (newPassword.trim() === currentPassword.trim()) {
        return NextResponse.json(
          { success: false, message: 'New PIN must be different from current PIN' },
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
          { success: false, message: 'Current PIN is required to reset' },
          { status: 401 }
        );
      }

      await saveAuthSettings({ customPin: null });
      return NextResponse.json({
        success: true,
        message: 'PIN successfully reset to default factory code (dayalwasi2024)',
      });
    }

    // --- Login Authentication with Rate Limiting ---
    // 1. Check rate limit
    const rateCheck = await checkRateLimit(clientKey);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          retryAfter: rateCheck.retryAfter,
          message: `Too many failed attempts. Device locked. Please wait ${rateCheck.retryAfter}s.`,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateCheck.retryAfter || 60),
          },
        }
      );
    }

    if (!password) {
      return NextResponse.json({ success: false, message: 'PIN is required' }, { status: 400 });
    }

    // 2. Verify PIN using constant-time comparison
    const isValid = await verifyActivePassword(password);

    if (isValid) {
      // Clear failure history for this client
      await recordSuccessfulLogin(clientKey);
      const settings = await getAuthSettings();
      return NextResponse.json(
        {
          success: true,
          authMode: settings.authMode,
        },
        { status: 200 }
      );
    } else {
      // Record failure and check if lockout threshold reached
      const failResult = await recordFailedLogin(clientKey);

      if (failResult.locked) {
        return NextResponse.json(
          {
            success: false,
            retryAfter: failResult.retryAfter,
            message: `Too many failed attempts. Device locked for ${failResult.retryAfter}s.`,
          },
          {
            status: 429,
            headers: {
              'Retry-After': String(failResult.retryAfter || 60),
            },
          }
        );
      }

      return NextResponse.json(
        { success: false, message: 'Incorrect access PIN' },
        { status: 401 }
      );
    }
  } catch {
    return NextResponse.json({ success: false, message: 'Bad request' }, { status: 400 });
  }
}