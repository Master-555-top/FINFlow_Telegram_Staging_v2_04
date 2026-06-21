export type IconName = 'day' | 'money' | 'work' | 'funds' | 'sleep' | 'ai' | 'system' | 'telegram' | 'audit' | 'cloud' | 'backup' | 'qa' | 'dev' | 'check' | 'sync' | 'warn' | 'log';

export function AppIcon(props: { name: IconName }) {
  const stroke = 'currentColor';
  const common = { fill: 'none', stroke, strokeWidth: 2.1, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (props.name) {
    case 'telegram':
      return <svg viewBox="0 0 24 24"><path {...common} d="M21 4 3.8 10.9c-.8.3-.7 1.4.1 1.6l4.2 1.2 1.6 5.1c.2.7 1.1.9 1.6.3l2.3-2.8 4.3 3.2c.7.5 1.6.1 1.8-.7L22 5.2c.2-.8-.3-1.5-1-1.2Z"/><path {...common} d="m8.2 13.5 8.9-5.6-6.5 7.8"/></svg>;
    case 'audit':
      return <svg viewBox="0 0 24 24"><path {...common} d="M5 20V9"/><path {...common} d="M12 20V4"/><path {...common} d="M19 20v-7"/><path {...common} d="M3 20h18"/></svg>;
    case 'cloud':
      return <svg viewBox="0 0 24 24"><path {...common} d="M7 18h10.5a4.5 4.5 0 0 0 .5-9 6.5 6.5 0 0 0-12-2.2A5.5 5.5 0 0 0 7 18Z"/></svg>;
    case 'backup':
      return <svg viewBox="0 0 24 24"><ellipse {...common} cx="12" cy="6" rx="7" ry="3"/><path {...common} d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6"/><path {...common} d="M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6"/><path {...common} d="M15 11.5h4.5V7"/><path {...common} d="m19.5 11.5-4.8-4.8"/></svg>;
    case 'qa':
      return <svg viewBox="0 0 24 24"><path {...common} d="M12 3 5 6v5c0 4.5 2.9 8.4 7 10 4.1-1.6 7-5.5 7-10V6l-7-3Z"/><path {...common} d="m8.5 12 2.2 2.2 4.8-5"/></svg>;
    case 'dev':
      return <svg viewBox="0 0 24 24"><path {...common} d="m8 8-4 4 4 4"/><path {...common} d="m16 8 4 4-4 4"/><path {...common} d="m14 5-4 14"/></svg>;
    case 'sleep':
      return <svg viewBox="0 0 24 24"><path {...common} d="M20 15.2A7.8 7.8 0 0 1 8.8 4 8.4 8.4 0 1 0 20 15.2Z"/></svg>;
    case 'day':
      return <svg viewBox="0 0 24 24"><circle {...common} cx="12" cy="12" r="4"/><path {...common} d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19"/></svg>;
    case 'money':
      return <svg viewBox="0 0 24 24"><rect {...common} x="3" y="6" width="18" height="13" rx="3"/><path {...common} d="M3 10h18"/><path {...common} d="M7 15h4"/></svg>;
    case 'work':
      return <svg viewBox="0 0 24 24"><path {...common} d="M9 6V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1"/><rect {...common} x="4" y="6" width="16" height="14" rx="3"/><path {...common} d="M4 12h16"/></svg>;
    case 'funds':
      return <svg viewBox="0 0 24 24"><path {...common} d="M4 19h16"/><path {...common} d="M6 17V9M10 17V9M14 17V9M18 17V9"/><path {...common} d="M3 9h18L12 4 3 9Z"/></svg>;
    case 'ai':
      return <svg viewBox="0 0 24 24"><path {...common} d="M12 3v18M3 12h18"/><path {...common} d="M7 7h10v10H7z"/><path {...common} d="M5 5h2M17 5h2M5 19h2M17 19h2"/></svg>;
    case 'sync':
      return <svg viewBox="0 0 24 24"><path {...common} d="M20 7v5h-5"/><path {...common} d="M4 17v-5h5"/><path {...common} d="M18 9A7 7 0 0 0 6.5 6.5"/><path {...common} d="M6 15a7 7 0 0 0 11.5 2.5"/></svg>;
    case 'warn':
      return <svg viewBox="0 0 24 24"><path {...common} d="M12 3 2.5 20h19L12 3Z"/><path {...common} d="M12 9v5M12 17h.01"/></svg>;
    case 'log':
      return <svg viewBox="0 0 24 24"><path {...common} d="M7 4h10a2 2 0 0 1 2 2v14l-3-2-3 2-3-2-3 2V6a2 2 0 0 1 2-2Z"/><path {...common} d="M9 9h6M9 13h5"/></svg>;
    case 'check':
      return <svg viewBox="0 0 24 24"><path {...common} d="m5 12 4 4L19 6"/></svg>;
    case 'system':
    default:
      return <svg viewBox="0 0 24 24"><path {...common} d="M12 3 5 7v10l7 4 7-4V7l-7-4Z"/><path {...common} d="m8.5 9.5 3.5-2 3.5 2v5L12 16.5l-3.5-2v-5Z"/></svg>;
  }
}
