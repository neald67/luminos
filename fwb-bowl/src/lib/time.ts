// Open/closed and "what's on now" logic, shared by the build and the browser.
// All math happens in Fort Walton Beach time (America/Chicago), whatever the
// visitor's own time zone is.

import { business, dayNames, hours, leagueBlock, specials, type DayHours, type Special } from '../data/site';

const WEEK = 7 * 1440;

export const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

/** '09:00' → '9 AM', '12:00' → 'noon', '01:00' → '1 AM', '16:30' → '4:30 PM' */
export function formatTime(hhmm: string) {
  const mins = toMinutes(hhmm) % 1440;
  if (mins === 720) return 'noon';
  if (mins === 0) return 'midnight';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const suffix = h < 12 ? 'AM' : 'PM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m ? `${h12}:${String(m).padStart(2, '0')} ${suffix}` : `${h12} ${suffix}`;
}

/** Like formatTime but "12 PM" instead of "noon", for compact tables. */
export const formatTimeShort = (hhmm: string) => formatTime(hhmm).replace('noon', '12 PM');

/** Day of week (0 = Sunday) and minutes since midnight, in Central Time. */
export function centralNow(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: business.timeZone,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '0';
  const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
  return { day, minutes: Number(get('hour')) * 60 + Number(get('minute')) };
}

type Span = { start: number; end: number };

/** A daily window as minutes-in-the-week. Ends before the start roll over past midnight. */
function span(day: number, start: string, end: string): Span {
  const s = day * 1440 + toMinutes(start);
  let e = day * 1440 + toMinutes(end);
  if (e <= s) e += 1440;
  return { start: s, end: e };
}

const contains = (sp: Span, t: number) =>
  (t >= sp.start && t < sp.end) || (t + WEEK >= sp.start && t + WEEK < sp.end);

export const openSpans = (list: DayHours[] = hours) => list.map((h) => span(h.day, h.opens, h.closes));
const specialSpans = (s: Special) => s.days.map((d) => span(d, s.start, s.end));

export type Status = {
  open: boolean;
  /** Short status for the chip, e.g. "Open now" */
  label: string;
  /** Detail after the label, e.g. "until 11 PM" */
  detail: string;
  /** Extra line, e.g. league play or a special running now */
  note?: string;
  state: 'open' | 'closed' | 'league' | 'closing';
};

const fromWeekMinutes = (t: number) => {
  const m = ((t % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
};

export function getStatus(date = new Date()): Status {
  const { day, minutes } = centralNow(date);
  const now = day * 1440 + minutes;
  const spans = openSpans();
  const current = spans.find((sp) => contains(sp, now));

  if (current) {
    const left = (((current.end - now) % WEEK) + WEEK) % WEEK;
    const until = `until ${formatTime(fromWeekMinutes(current.end))}`;
    const inLeague =
      leagueBlock.days.includes(day) && minutes >= toMinutes(leagueBlock.start) && minutes < toMinutes(leagueBlock.end);
    if (inLeague) {
      return {
        open: true,
        state: 'league',
        label: 'League night',
        detail: `no open lanes until ${formatTime(leagueBlock.end)}`,
        note: `Open ${until}`,
      };
    }
    const special = specials.find((s) => s.id !== 'daytime' && specialSpans(s).some((sp) => contains(sp, now)));
    return {
      open: true,
      state: left <= 60 ? 'closing' : 'open',
      label: left <= 60 ? 'Closing soon' : 'Open now',
      detail: until,
      note: special ? `${special.name} until ${formatTime(special.end)}` : undefined,
    };
  }

  // Closed: find the next opening, up to a week ahead.
  const next = spans
    .map((sp) => ({ sp, wait: (sp.start - now + WEEK) % WEEK }))
    .sort((a, b) => a.wait - b.wait)[0];
  const openDay = Math.floor((((next.sp.start % WEEK) + WEEK) % WEEK) / 1440);
  const when =
    openDay === day && next.wait < 1440
      ? 'today'
      : openDay === (day + 1) % 7
        ? 'tomorrow'
        : dayNames[openDay];
  return {
    open: false,
    state: 'closed',
    label: 'Closed now',
    detail: `opens ${when} at ${formatTime(fromWeekMinutes(next.sp.start))}`,
  };
}

/** Hours rows for tables, Monday first. */
export function hoursRows() {
  return hours.map((h) => ({
    day: dayNames[h.day],
    short: dayNames[h.day].slice(0, 3),
    opens: formatTime(h.opens),
    closes: formatTime(h.closes),
    range: `${formatTime(h.opens)} – ${formatTime(h.closes)}`,
    dayIndex: h.day,
  }));
}

/** Specials that run on a given day (0 = Sunday). */
export const specialsOn = (day: number) =>
  specials.filter((s) => s.days.includes(day)).sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
