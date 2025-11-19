
import React, { useEffect, useState } from 'react';

// Utility: get next Thursday 12:00 AM from now
function getNextThursdayMidnight(now = new Date()) {
  const day = now.getDay();
  const daysUntilThursday = (4 - day + 7) % 7;
  let nextThursday = new Date(now);
  nextThursday.setDate(now.getDate() + daysUntilThursday);
  nextThursday.setHours(0, 0, 0, 0);
  // If today is Thursday and before midnight, use today
  if (daysUntilThursday === 0 && now < nextThursday) {
    return nextThursday;
  }
  // If today is Thursday but after midnight, go to next week
  if (daysUntilThursday === 0 && now >= nextThursday) {
    nextThursday.setDate(nextThursday.getDate() + 7);
    return nextThursday;
  }
  return nextThursday;
}

const OptTimer = ({ user, optedIn=true }) => {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const nextReveal = getNextThursdayMidnight(now);
      const diff = nextReveal - now;
      setTimeLeft(diff > 0 ? diff : 0);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  if (timeLeft === null) return null;
  if (timeLeft <= 0) return null;

  // Format time left
  const totalSeconds = Math.floor(timeLeft / 1000);
  const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const days = Math.floor(totalSeconds / (60 * 60 * 24));

  // Format numbers with leading zeros
  const formatNumber = (num) => String(num).padStart(2, '0');

  return (
    <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg shadow-sm border border-primary/20 p-4 md:p-6 my-4">
      <div className="text-center mb-4">
        {optedIn && <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-1">
          Waiting for your match...
        </h3>}
        {!optedIn && <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-1">
          Your opt-in will activate in the next match cycle. Thanks for your patience!
        </h3>}

        {optedIn && <p className="text-sm text-gray-600">
          Your match will be revealed in:
        </p>}
      </div>
      <div className="flex items-center justify-center gap-2 md:gap-4">
        {/* Days */}
        <div className="flex flex-col items-center">
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-3 md:p-4 min-w-[60px] md:min-w-[80px]">
            <div className="text-2xl md:text-3xl font-bold text-primary tabular-nums">
              {formatNumber(days)}
            </div>
          </div>
          <div className="text-xs md:text-sm text-gray-600 mt-1 font-medium">
            Days
          </div>
        </div>

        {/* Separator */}
        <div className="text-2xl md:text-3xl font-bold text-gray-400">:</div>

        {/* Hours */}
        <div className="flex flex-col items-center">
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-3 md:p-4 min-w-[60px] md:min-w-[80px]">
            <div className="text-2xl md:text-3xl font-bold text-primary tabular-nums">
              {formatNumber(hours)}
            </div>
          </div>
          <div className="text-xs md:text-sm text-gray-600 mt-1 font-medium">
            Hours
          </div>
        </div>

        {/* Separator */}
        <div className="text-2xl md:text-3xl font-bold text-gray-400">:</div>

        {/* Minutes */}
        <div className="flex flex-col items-center">
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-3 md:p-4 min-w-[60px] md:min-w-[80px]">
            <div className="text-2xl md:text-3xl font-bold text-primary tabular-nums">
              {formatNumber(minutes)}
            </div>
          </div>
          <div className="text-xs md:text-sm text-gray-600 mt-1 font-medium">
            Minutes
          </div>
        </div>

        {/* Separator */}
        <div className="text-2xl md:text-3xl font-bold text-gray-400">:</div>

        {/* Seconds */}
        <div className="flex flex-col items-center">
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-3 md:p-4 min-w-[60px] md:min-w-[80px]">
            <div className="text-2xl md:text-3xl font-bold text-primary tabular-nums animate-pulse">
              {formatNumber(seconds)}
            </div>
          </div>
          <div className="text-xs md:text-sm text-gray-600 mt-1 font-medium">
            Seconds
          </div>
        </div>
      </div>
      {optedIn && <div className="text-xs text-blue-500 mt-4 text-center">
        (Matches are revealed every Thursday at 12:00 AM)
      </div>}
    </div>
  );
};

export default OptTimer;
