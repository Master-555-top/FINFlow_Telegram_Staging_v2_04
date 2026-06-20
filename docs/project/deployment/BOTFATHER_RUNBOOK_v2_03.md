# BotFather Runbook v2.03

## Goal
Connect FINFlow staging deployment to Telegram Mini App without exposing project secrets or private archives.

## Required input before BotFather
- HTTPS staging URL from Vercel/hosting.
- `TELEGRAM_BOT_TOKEN` stored only in Vercel/hosting env variables.
- Deploy-safe package uploaded, not MASTER PRIVATE FULL.

## Steps
1. Open BotFather.
2. Select the FINFlow bot.
3. Configure the Mini App/Web App URL to the staging HTTPS URL.
4. Configure a Menu Button or Mini App button.
5. Open from Telegram on a phone.
6. Confirm Telegram session verification.

## Failure meanings
- `бот не настроен` means `TELEGRAM_BOT_TOKEN` is missing server-side.
- `подпись не сошлась` means initData verification failed.
- `сессия устарела` means initData is older than `TELEGRAM_INIT_DATA_MAX_AGE_SECONDS`.
- `Локальный режим` means the app was opened outside Telegram or Telegram WebApp data was not provided.

## Do not do
- Do not paste bot token into client code.
- Do not commit `.env.local`.
- Do not upload `private_vault` or `private_raw_data`.
- Do not enable cloud writes before backup/checklist.
