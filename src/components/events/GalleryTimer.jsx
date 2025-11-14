import React, { useState, useEffect } from 'react';

const GalleryTimer = ({ onComplete, duration = 5000 }) => {
  const [seconds, setSeconds] = useState(Math.ceil(duration / 1000));

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, Math.ceil((duration - elapsed) / 1000));
      setSeconds(remaining);

      if (remaining === 0) {
        clearInterval(interval);
        if (onComplete) {
          onComplete();
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [duration, onComplete]);

  const formatNumber = (num) => {
    return String(num).padStart(2, '0');
  };

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="mb-6">
        <h3 className="text-xl md:text-2xl font-semibold text-gray-700 mb-2 text-center">
          Event Starting In...
        </h3>
      </div>
      <div className="flex items-center justify-center gap-2 md:gap-4">
        {/* Seconds */}
        <div className="flex flex-col items-center">
          <div className="bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg p-4 md:p-6 min-w-[80px] md:min-w-[100px] border-2 border-primary/30">
            <div className="text-4xl md:text-5xl font-bold text-primary tabular-nums animate-pulse">
              {formatNumber(seconds)}
            </div>
          </div>
          <div className="text-sm md:text-base text-gray-600 mt-2 font-medium">
            {seconds === 1 ? 'Second' : 'Seconds'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GalleryTimer;