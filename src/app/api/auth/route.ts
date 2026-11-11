import { NextResponse } from 'next/server';
import {
  DEFAULT_FALLBACK_PIN,
  getAuthSettings,
  saveAuthSettings,
  verifyActivePin,
} from '@/lib/authSettings';
import {
  getClientFingerprint,
  checkRateLimit,
  recordFailedLogin,
  recordSuccessfulLogin,
} from '@/lib/rateLimit';

const NUMERIC_PIN_REGEX = /^\d{4,12}$/;

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
    const { action, pin, currentPin, newPin, authMode } = body;
    const clientKey = getClientFingerprint(request);

    // Handle 3-step PIN change
    if (action === 'change-pin') {
      if (!currentPin || !newPin) {
        return NextResponse.json(
          { success: false, message: 'Current and new PIN are required' },
          { status: 400 }
        );
      }

      const isValidCurrent = await verifyActivePin(String(currentPin));
      if (!isValidCurrent) {
        return NextResponse.json(
          { success: false, message: 'Current PIN is incorrect' },
          { status: 401 }
        );
      }

      const trimmedNewPin = String(newPin).trim();
      if (!NUMERIC_PIN_REGEX.test(trimmedNewPin)) {
        return NextResponse.json(
          { success: false, message: 'New PIN must be 4 to 12 digits (numbers only)' },
          { status: 400 }
        );
      }

      if (trimmedNewPin === String(currentPin).trim()) {
        return NextResponse.json(
          { success: false, message: 'New PIN must be different from current PIN' },
          { status: 400 }
        );
      }

      const saved = await saveAuthSettings({ customPin: trimmedNewPin });
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
      if (!currentPin) {
        return NextResponse.json(
          { success: false, message: 'Current PIN is required to reset' },
          { status: 400 }
        );
      }

      const isValid = await verifyActivePin(String(currentPin));
      if (!isValid) {
        return NextResponse.json(
          { success: false, message: 'Current PIN is incorrect' },
          { status: 401 }
        );
      }

      await saveAuthSettings({ customPin: null });
      return NextResponse.json({
        success: true,
        message: `PIN successfully reset to default factory PIN (${DEFAULT_FALLBACK_PIN})`,
      });
    }

    // --- Login Authentication with Rate Limiting ---
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

    if (!pin) {
      return NextResponse.json({ success: false, message: 'PIN is required' }, { status: 400 });
    }

    // Verify PIN using constant-time comparison
    const isValid = await verifyActivePin(String(pin));

    if (isValid) {
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
