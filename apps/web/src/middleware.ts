import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(_request: NextRequest) {
  // Auth is handled client-side via wallet store
  // Middleware allows all routes through; the app shell and onboarding
  // components handle redirects based on wallet state
  return NextResponse.next();
}

export const config = {
  matcher: ['/pilot/app/:path*'],
};
