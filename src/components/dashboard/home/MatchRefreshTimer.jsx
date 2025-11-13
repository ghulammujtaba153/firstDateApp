import React, { useState, useEffect } from 'react';
import Countdown from 'react-countdown';
import { BASE_URL } from '../../../config/url';
import axios from 'axios';

const MatchRefreshTimer = ({ userId, onTimerComplete }) => {
  const [timerData, setTimerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTimerStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`${BASE_URL}/api/user-dashboard/timer/status`, {
        params: { userId }
      });
      setTimerData(res.data);
    } catch (err) {
      console.error('Error fetching timer status:', err);
      setError('Failed to load timer');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchTimerStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleComplete = async () => {
    try {
      // Reset timer and fetch new matches
      const res = await axios.post(`${BASE_URL}/api/user-dashboard/timer/reset`, null, {
        params: { userId }
      });
      
      // Update timer data
      setTimerData({
        expiresAt: res.data.timer.expiresAt,
        lastRefreshAt: res.data.timer.lastRefreshAt,
        isExpired: false,
        timeRemaining: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
      });
      
      // Notify parent component to refresh matches
      if (onTimerComplete) {
        onTimerComplete(res.data.users);
      }
    } catch (err) {
      console.error('Error resetting timer:', err);
      setError('Failed to reset timer');
    }
  };

  // Renderer function for countdown
  const renderer = ({ days, hours, minutes, seconds, completed }) => {
    if (completed) {
      return (
        <div className="text-center">
          <div className="text-lg font-semibold text-primary mb-2">
            New matches are ready!
          </div>
          <button
            onClick={handleComplete}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Refresh Matches
          </button>
        </div>
      );
    }

    // Format numbers with leading zeros
    const formatNumber = (num) => String(num).padStart(2, '0');

    return (
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
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
        <div className="text-center text-gray-500">Loading timer...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-lg border border-red-200 p-4 md:p-6">
        <div className="text-center text-red-600">{error}</div>
        <button
          onClick={fetchTimerStatus}
          className="mt-2 text-sm text-red-700 hover:underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!timerData || !timerData.expiresAt) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg shadow-sm border border-primary/20 p-4 md:p-6">
      <div className="text-center mb-4">
        <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-1">
          Next Match Refresh
        </h3>
        <p className="text-sm text-gray-600">
          New recommended matches will be available in:
        </p>
      </div>
      
      <Countdown
        date={new Date(timerData.expiresAt)}
        renderer={renderer}
        onComplete={handleComplete}
      />
    </div>
  );
};

export default MatchRefreshTimer;

