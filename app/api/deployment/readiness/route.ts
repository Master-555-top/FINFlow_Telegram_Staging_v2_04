import { NextResponse } from 'next/server';
import { buildDeploymentReadinessReport } from '@/lib/server/deploymentReadiness';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(buildDeploymentReadinessReport(), {
    headers: { 'Cache-Control': 'no-store' }
  });
}
