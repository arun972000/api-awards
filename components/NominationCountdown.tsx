'use client';

import { useEffect, useState } from 'react';
import { CalendarClock } from 'lucide-react';
import { awardDates } from '@/lib/awardContent';

const closesAt = Date.parse(awardDates.nominationsCloseIso);

type Remaining = { days: number; hours: number; minutes: number; seconds: number };

function remainingAt(now: number): Remaining | null {
  const gap = closesAt - now;
  if (gap <= 0) return null;

  const seconds = Math.floor(gap / 1000);
  return {
    days: Math.floor(seconds / 86_400),
    hours: Math.floor((seconds % 86_400) / 3_600),
    minutes: Math.floor((seconds % 3_600) / 60),
    seconds: seconds % 60,
  };
}

export default function NominationCountdown() {
  // The page is prerendered at build time, so the first paint must not depend
  // on the clock. The digits fill in once the browser takes over, which also
  // keeps the server and client markup identical.
  const [remaining, setRemaining] = useState<Remaining | null>(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    function tick() {
      setRemaining(remainingAt(Date.now()));
      setRunning(true);
    }

    tick();
    const timer = window.setInterval(tick, 1_000);
    return () => window.clearInterval(timer);
  }, []);

  const closed = running && remaining === null;

  const parts = [
    { label: 'Days', value: remaining?.days },
    { label: 'Hours', value: remaining?.hours },
    { label: 'Minutes', value: remaining?.minutes },
    { label: 'Seconds', value: remaining?.seconds },
  ];

  return (
    <div className={`countdown ${closed ? 'is-closed' : ''}`}>
      <p className='countdown-label'>
        <CalendarClock size={15} aria-hidden='true' />
        {closed ? 'Nominations have closed' : 'Nominations close in'}
      </p>

      {closed ? null : (
        // Ticking digits would flood a screen reader, so the exact closing time
        // below carries the same information as readable text.
        <ol className='countdown-parts' aria-hidden='true'>
          {parts.map((part) => (
            <li key={part.label}>
              <strong>
                {part.value === undefined ? '––' : String(part.value).padStart(2, '0')}
              </strong>
              <small>{part.label}</small>
            </li>
          ))}
        </ol>
      )}

      <p className='countdown-deadline'>
        {closed ? 'Nominations closed at ' : 'Closing at '}
        <strong>{awardDates.nominationsCloseLong}</strong>.
      </p>
    </div>
  );
}
