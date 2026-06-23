import { NextResponse } from 'next/server';
import { parseFinflowCloudDayDocument } from '@/lib/cloud/finflowCloudDayDocument';
import { loadCloudDay, saveCloudDay } from '@/lib/server/finflowCloudDayRepository';
import { resolveOrCreateFinflowProfile } from '@/lib/server/finflowProfileRepository';
import { authenticateTelegramInitData } from '@/lib/server/telegramRequestAuth';
import { isValidIsoLocalDate } from '@/lib/time/localDate';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const maxRequestBytes = 1_000_000;

export async function GET(request: Request) {
  if (!isCloudSyncEnabled()) return disabledResponse();

  const initData = request.headers.get('x-telegram-init-data') ?? '';
  const auth = authenticateTelegramInitData(initData);
  if (!auth.ok || !auth.user) return unauthorizedResponse(auth.reason);

  const url = new URL(request.url);
  const localDate = url.searchParams.get('localDate') ?? '';
  if (!isValidIsoLocalDate(localDate)) {
    return NextResponse.json({ ok: false, reason: 'invalid_local_date' }, { status: 400 });
  }

  const profile = await resolveOrCreateFinflowProfile(auth.user);
  if (!profile.ok) {
    return NextResponse.json({ ok: false, reason: profile.reason }, { status: profile.retryable ? 503 : 409 });
  }

  const result = await loadCloudDay(profile.profile.id, localDate);
  if (!result.ok) return NextResponse.json({ ok: false, reason: result.reason }, { status: 503 });

  return NextResponse.json({
    ok: true,
    profile: safeProfile(profile.profile),
    record: result.record
      ? {
          document: result.record.document,
          revision: result.record.revision,
          updatedAt: result.record.updatedAt
        }
      : null
  }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function PUT(request: Request) {
  if (!isCloudSyncEnabled()) return disabledResponse();

  const rawBody = await request.text();
  if (Buffer.byteLength(rawBody, 'utf8') > maxRequestBytes) {
    return NextResponse.json({ ok: false, reason: 'payload_too_large' }, { status: 413 });
  }

  let body: { initData?: unknown; document?: unknown; expectedRevision?: unknown };
  try {
    body = JSON.parse(rawBody) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, reason: 'invalid_json' }, { status: 400 });
  }

  const initData = typeof body.initData === 'string' ? body.initData : '';
  const auth = authenticateTelegramInitData(initData);
  if (!auth.ok || !auth.user) return unauthorizedResponse(auth.reason);

  const document = parseFinflowCloudDayDocument(body.document);
  if (!document) {
    return NextResponse.json({ ok: false, reason: 'invalid_cloud_day_document' }, { status: 400 });
  }

  const expectedRevision = body.expectedRevision === null || body.expectedRevision === undefined
    ? null
    : Number(body.expectedRevision);
  if (expectedRevision !== null && (!Number.isInteger(expectedRevision) || expectedRevision < 0)) {
    return NextResponse.json({ ok: false, reason: 'invalid_expected_revision' }, { status: 400 });
  }

  const profile = await resolveOrCreateFinflowProfile(auth.user);
  if (!profile.ok) {
    return NextResponse.json({ ok: false, reason: profile.reason }, { status: profile.retryable ? 503 : 409 });
  }

  const saved = await saveCloudDay({ profileId: profile.profile.id, document, expectedRevision });
  if (!saved.ok) {
    return NextResponse.json(
      { ok: false, reason: saved.reason, conflict: saved.conflict, currentRevision: saved.currentRevision },
      { status: saved.conflict ? 409 : 503 }
    );
  }

  return NextResponse.json({
    ok: true,
    profile: safeProfile(profile.profile),
    revision: saved.revision,
    updatedAt: saved.updatedAt
  }, { headers: { 'Cache-Control': 'no-store' } });
}

function isCloudSyncEnabled() {
  return process.env.FINFLOW_ENABLE_CLOUD_SYNC === 'true';
}


function safeProfile(profile: { id: string; display_name: string | null; timezone: string }) {
  return { id: profile.id, displayName: profile.display_name, timezone: profile.timezone };
}

function unauthorizedResponse(reason?: string) {
  return NextResponse.json({ ok: false, reason: reason ?? 'telegram_auth_failed' }, { status: 401 });
}

function disabledResponse() {
  return NextResponse.json({ ok: false, reason: 'FINFLOW_ENABLE_CLOUD_SYNC_not_true' }, { status: 503 });
}
