import { NextResponse } from 'next/server';
import { checkRateLimit } from '@/app/lib/rateLimiter';

export const runtime = 'nodejs';

const FORM_ENDPOINT =
  process.env.FORMSPREE_ENDPOINT ?? 'https://formspree.io/f/xananqrz'; // Replace with your Formspree endpoint

const RATE_LIMIT_ERROR = 'Too many submissions from this device. Please wait a minute and try again.';

function getClientIdentifier(request: Request) {
  const headerPriority = [
    'x-forwarded-for',
    'x-real-ip',
    'cf-connecting-ip',
    'x-vercel-ip',
    'fastly-client-ip',
  ];

  for (const header of headerPriority) {
    const value = request.headers.get(header);
    if (value) {
      if (header === 'x-forwarded-for') {
        return value.split(',')[0].trim();
      }
      return value;
    }
  }

  return request.headers.get('user-agent') ?? 'anonymous';
}

export async function POST(request: Request) {
  if (!FORM_ENDPOINT || FORM_ENDPOINT.endsWith('YOUR_FORM_ID')) {
    return NextResponse.json(
      {
        success: false,
        error: 'Form endpoint is not configured. Set FORMSPREE_ENDPOINT in your environment variables.',
      },
      { status: 500 },
    );
  }

  try {
    const identifier = getClientIdentifier(request);
    const { limited, retryAfterMs } = checkRateLimit(identifier);

    if (limited) {
      const response = NextResponse.json(
        { success: false, error: RATE_LIMIT_ERROR },
        { status: 429 },
      );

      if (retryAfterMs > 0) {
        response.headers.set('Retry-After', String(Math.ceil(retryAfterMs / 1000)));
      }

      return response;
    }

    const formData = await request.formData();
    const response = await fetch(FORM_ENDPOINT, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
      body: formData,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const message =
        data?.errors?.[0]?.message ??
        data?.message ??
        'Unable to submit form at this time.';

      return NextResponse.json({ success: false, error: message }, { status: response.status });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Form submission error', error);
    return NextResponse.json(
      { success: false, error: 'Unexpected error submitting form.' },
      { status: 500 },
    );
  }
}
