import { NextRequest, NextResponse } from 'next/server';
import { buildN8nAutomationContractSnapshot, buildN8nDryRunPayload, isN8nWorkflowId } from '@/lib/automation/n8nAutomationContract';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const requestedEvent = request.nextUrl.searchParams.get('event');
  const event = isN8nWorkflowId(requestedEvent) ? requestedEvent : 'daily_evening_report';
  const payload = buildN8nDryRunPayload(event);
  const contract = buildN8nAutomationContractSnapshot({
    hasPrivateN8nUrl: Boolean(process.env.FINFLOW_PRIVATE_N8N_WEBHOOK_URL),
    cloudSafe: process.env.FINFLOW_ENABLE_SUPABASE_WRITES === 'true' && process.env.FINFLOW_ENABLE_CLOUD_SYNC === 'true'
  });

  return NextResponse.json({
    ok: true,
    event,
    externalCallMade: false,
    dryRunOnly: true,
    payload,
    contract: {
      version: contract.version,
      mode: contract.mode,
      readinessPercent: contract.readinessPercent,
      canCallExternalN8n: contract.canCallExternalN8n
    },
    safety: {
      secretsReturned: false,
      privateVaultReturned: false,
      rawEnvReturned: false,
      telegramInitDataReturned: false,
      dryRunOnly: true,
      externalCallsBlocked: true,
      webhookUrlReturned: false
    }
  }, { headers: { 'Cache-Control': 'no-store' } });
}
