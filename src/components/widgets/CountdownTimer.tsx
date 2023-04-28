import { motion } from 'framer-motion';
import { DateTime } from 'luxon';
import { CSSProperties, ReactNode, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { useCountdown } from '~/hooks/useCountdown';

export interface CountdownTimerProps {
  to: string;
  headline?: string | null;
  message?: string | null;
  expiredHeadline?: string | null;
  expiredMessage?: string | null;
  color?: string;
}

export const CountdownTimer = ({
  to = '2023-08-11',
  headline,
  expiredHeadline,
  expiredMessage,
  message,
  color,
}: CountdownTimerProps): ReactNode => {
  if (to === undefined) {
    throw new Error('`to` prop is required');
  }

  const { years, months, days, hours, minutes, seconds } = useCountdown(to);
  const expired = DateTime.fromISO(to) < DateTime.now();
  const displayTo = DateTime.fromISO(to).toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY);

  useEffect(() => {
    if (expired) {
      return;
    }

    if (typeof window === 'undefined') {
      return;
    }

    const secondsEl = document.querySelector('[data-countdown="seconds"]') as HTMLElement;
    const minutesEl = document.querySelector('[data-countdown="minutes"]') as HTMLElement;
    const hoursEl = document.querySelector('[data-countdown="hours"]') as HTMLElement;
    const daysEl = document.querySelector('[data-countdown="days"]') as HTMLElement;
    const monthsEl = document.querySelector('[data-countdown="months"]') as HTMLElement;

    if (secondsEl !== null) secondsEl.style.setProperty('--value', seconds.toString());
    if (minutesEl !== null) minutesEl.style.setProperty('--value', minutes.toString());
    if (hoursEl !== null) hoursEl.style.setProperty('--value', hours.toString());
    if (daysEl !== null) daysEl.style.setProperty('--value', days.toString());
    if (monthsEl !== null) monthsEl.style.setProperty('--value', months.toString());
  }, [expired, years, months, days, hours, minutes, seconds]);

  useEffect(() => {
    if (color !== undefined && typeof window !== 'undefined') {
      const root = document.documentElement;
      root.style.setProperty('--timerColor', color);
    }
  }, [color]);

  return (
    <div className="countdown-timer flex flex-col items-center justify-center text-6xl font-bold">
      {message && !expired && <ReactMarkdown className="countdown-timer__message">{message}</ReactMarkdown>}
      {headline && !expired && (
        <h4 className="text-lg font-normal leading-tight bg-clip-text text-transparent bg-gradient-to-br from-primary to-accent">
          {headline}
          <br />{' '}
          <span className="inline-flex uppercase text-off-white font-bold text-2xl -translate-y-2">{displayTo}</span>
        </h4>
      )}
      {expiredHeadline && expired && (
        <h4 className="text-lg font-normal leading-tight bg-clip-text text-transparent bg-gradient-to-br from-primary to-accent">
          {expiredHeadline}
          <br />{' '}
          <span className="inline-flex uppercase text-off-white font-bold text-2xl -translate-y-2">{displayTo}</span>
        </h4>
      )}
      {expired ? (
        <ReactMarkdown className="expired-copy">{expiredMessage ?? ''}</ReactMarkdown>
      ) : (
        <motion.div
          className="countdown-timer__counter pointer-events-none"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 1 }}
        >
          {months > 0 && (
            <div className="countdown-timer__counter__item">
              <span className="countdown counter__item__months">
                <span style={{ '--value': 0 } as CSSProperties} data-countdown="months" />
              </span>
              <span>Months</span>
            </div>
          )}
          {days > 0 && (
            <div className="countdown-timer__counter__item">
              <span className="countdown counter__item__days">
                <span style={{ '--value': 0 } as CSSProperties} data-countdown="days" />
              </span>
              <span>Days</span>
            </div>
          )}
          <div className="countdown-timer__counter__item">
            <span className="countdown counter__item__hours">
              <span style={{ '--value': 0 } as CSSProperties} data-countdown="hours" />
            </span>
            <span>Hours</span>
          </div>
          {/* <div className="counter__item__divider">:</div> */}
          <div className="countdown-timer__counter__item">
            <span className="countdown counter__item__minutes">
              <span style={{ '--value': 0 } as CSSProperties} data-countdown="minutes" />
            </span>
            <span>Minutes</span>
          </div>
          {/* <div className="counter__item__divider">:</div> */}
          <div className="countdown-timer__counter__item">
            <span className="countdown counter__item__seconds">
              <span style={{ '--value': 0 } as CSSProperties} data-countdown="seconds" />
            </span>
            <span>Seconds</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};
