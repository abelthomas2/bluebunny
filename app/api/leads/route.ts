import { NextResponse } from 'next/server';

const FORM_ENDPOINT =
  process.env.FORMSPREE_ENDPOINT ?? 'https://formspree.io/f/xovyaorz'; // Replace with your Formspree endpoint

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
