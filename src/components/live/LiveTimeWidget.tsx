'use client';

import { useEffect, useState } from 'react';
import { formatRussianDateTime, getTimeOfDay } from '@/lib/time/timeOfDay';

export function LiveTimeWidget() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const intervalId = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(intervalId);
  }, []);

  if (!now) {
    return (
      <div className="live-strip" aria-label="Текущие дата и время">
        <span>Сейчас</span>
        <b>загрузка времени…</b>
      </div>
    );
  }

  const formatted = formatRussianDateTime(now);

  return (
    <div className="live-strip" aria-label="Текущие дата и время">
      <span>Сейчас</span>
      <b>{formatted.weekday} • {formatted.day} {formatted.month} • {formatted.time} • {formatted.timeOfDay}</b>
    </div>
  );
}

export function TimeOfDayPill() {
  const [label, setLabel] = useState<string>('…');

  useEffect(() => {
    const update = () => setLabel(getTimeOfDay(new Date()));
    update();
    const intervalId = window.setInterval(update, 30_000);
    return () => window.clearInterval(intervalId);
  }, []);

  return <div className="pill" aria-label="Время суток">{label}</div>;
}
