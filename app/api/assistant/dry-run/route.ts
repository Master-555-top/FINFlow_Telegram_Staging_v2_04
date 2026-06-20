import { NextResponse } from 'next/server';
import { buildAssistantExternalBridgeDryRun } from '@/lib/server/assistantExternalBridgeDraft';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body?.payload) {
    return NextResponse.json(
      {
        ok: false,
        reason: 'missing_payload',
        externalCallMade: false
      },
      { status: 400 }
    );
  }

  const dryRun = buildAssistantExternalBridgeDryRun(body.payload);

  return NextResponse.json({
    ok: true,
    externalCallMade: false,
    dryRun
  });
}
