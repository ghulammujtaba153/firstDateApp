import React, { useEffect, useState } from 'react';

const OptClosingTimer = () => {
  const [remaining, setRemaining] = useState(0);

  // 🔹 compute next Tuesday (23:01)
  const nextTuesdayClosing = (now = new Date()) => {
    const day = now.getDay();      // 0=Sun,1=Mon,2=Tue,...
    const TARGET = 2;              // Tuesday
    let daysUntil = (TARGET - day + 7) % 7;

    const candidate = new Date(now);
    candidate.setDate(now.getDate() + daysUntil);
    candidate.setHours(23, 1, 0, 0);

    // ⏳ If passed for this week -> next week
    if (candidate <= now) {
      candidate.setDate(candidate.getDate() + 7);
    }
    return candidate;
  };

  // ⏱ Update countdown every second
  useEffect(() => {
    let mounted = true;
    const update = () => {
      const now = new Date();
      const target = nextTuesdayClosing(now);
      const ms = target.getTime() - now.getTime();
      if (mounted) setRemaining(Math.max(0, ms));
    };
    update();
    const t = setInterval(update, 1000);
    return () => { mounted = false; clearInterval(t); };
  }, []);

  // ❌ Expired state UI
  if (remaining <= 0) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <p className="text-red-700 font-medium">Opt-in window closed</p>
        <p className="text-sm text-red-600 mt-1">Please wait for the next match cycle.</p>
      </div>
    );
  }

  // 🧮 Time breakdown
  const secs = Math.floor(remaining / 1000);
  const days = Math.floor(secs / 86400);
  const hours = Math.floor((secs % 86400) / 3600);
  const minutes = Math.floor((secs % 3600) / 60);
  const seconds = secs % 60;

  const format = (num) => String(num).padStart(2, '0');

  return (
    <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg shadow-sm border border-primary/20 p-4 md:p-6 mt-4">
      <div className="text-center mb-4">
        <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-1">
          Opt-in Closing In
        </h3>
        <p className="text-sm text-gray-600">
          Join before the window closes to be included in the next match cycle.
        </p>
      </div>

      {/* Timer Layout */}
      <div className="flex items-center justify-center gap-2 md:gap-4">
        
        {/* Days */}
        <TimeBox value={format(days)} label="Days" />

        <Separator />

        {/* Hours */}
        <TimeBox value={format(hours)} label="Hours" />

        <Separator />

        {/* Minutes */}
        <TimeBox value={format(minutes)} label="Minutes" />

        <Separator />

        {/* Seconds */}
        <TimeBox value={format(seconds)} label="Seconds" pulse />

      </div>
    </div>
  );
};

// 🟦 Reusable Components
const TimeBox = ({ value, label, pulse }) => (
  <div className="flex flex-col items-center">
    <div className={`bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-3 md:p-4 min-w-[60px] md:min-w-[80px]`}>
      <div className={`text-2xl md:text-3xl font-bold text-primary tabular-nums ${pulse ? 'animate-pulse' : ''}`}>
        {value}
      </div>
    </div>
    <div className="text-xs md:text-sm text-gray-600 mt-1 font-medium">
      {label}
    </div>
  </div>
);

const Separator = () => (
  <div className="text-2xl md:text-3xl font-bold text-gray-400">:</div>
);

export default OptClosingTimer;
