import { NextResponse } from 'next/server';
import { buildAssistantExternalBridgeDryRun } from '@/lib/server/assistantExternalBridgeDraft';
import { parseFinflowExternalAssistantPayload } from '@/lib/assistant/finflowAssistantPrompt';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const maxRequestBytes = 128_000;

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get('content-length'));
  if (Number.isFinite(contentLength) && contentLength > maxRequestBytes) {
    return errorResponse('payload_too_large', 413);
  }

  const rawBody = await request.text();
  if (Buffer.byteLength(rawBody, 'utf8') > maxRequestBytes) {
    return errorResponse('payload_too_large', 413);
  }

  let body: { payload?: unknown } | null = null;
  try {
    body = JSON.parse(rawBody) as { payload?: unknown };
  } catch {
    return errorResponse('invalid_json', 400);
  }

  if (!body?.payload) {
    return errorResponse('missing_payload', 400);
  }

  const payload = parseFinflowExternalAssistantPayload(body.payload);
  if (!payload) return errorResponse('invalid_or_unsafe_payload', 400);

  const dryRun = buildAssistantExternalBridgeDryRun(payload);

  return NextResponse.json({
    ok: true,
    externalCallMade: false,
    dryRun
  }, { headers: { 'Cache-Control': 'no-store' } });
}

function errorResponse(reason: string, status: number) {
  return NextResponse.json({
    ok: false,
    reason,
    externalCallMade: false
  }, { status, headers: { 'Cache-Control': 'no-store' } });
}
