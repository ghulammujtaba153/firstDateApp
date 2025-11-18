import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { BASE_URL } from "../../../config/url";
import { useAuth } from "../../../context/authContext";
import { useSocket } from "../../../context/socketContext";
import MatchCard from "./MatchCard";

const OptInSection = () => {
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();
  const [optedIn, setOptedIn] = useState(!!user?.optIn);
  const [buttonState, setButtonState] = useState("");
  const [isDisabled, setIsDisabled] = useState(false);
  const [matches, setMatches] = useState([]);
  const [matchesLoading, setMatchesLoading] = useState(false);
  const [matchError, setMatchError] = useState(null);
  const tickRef = useRef(null);
  const [windowState, setWindowState] = useState("active");

  // Utility: compute minute-of-week
  const minutesSinceWeekStart = (d = new Date()) => {
    const day = d.getDay(); // 0 Sun .. 6 Sat
    const hour = d.getHours();
    const minute = d.getMinutes();
    return day * 1440 + hour * 60 + minute;
  };

  const evaluateWindow = (now = new Date()) => {
    const total = minutesSinceWeekStart(now);

    const THU_00_00 = 4 * 1440; // 5760
    const THU_00_01 = THU_00_00 + 1; // 5761
    const TUE_23_00 = 2 * 1440 + 23 * 60; // 4260
    const TUE_23_01 = TUE_23_00 + 1; // 4261

    // delivering: Thu 00:00 -> Thu 00:01 (one minute)
    if (total >= THU_00_00 && total < THU_00_01) {
      return "delivering";
    }

    // active window wraps from Thu 00:01 -> Tue 23:00 (across week boundary)
    if (total >= THU_00_01 || total <= TUE_23_00) {
      return "active";
    }

    // locked: Tue 23:01 -> Thu 00:00
    if (total >= TUE_23_01 && total < THU_00_00) {
      return "locked";
    }

    return "locked";
  };

  // Refresh user opt-in from server (called when crossing delivery -> active)
  const refreshUserOptIn = async () => {
    try {
      if (!user?._id) return;
      const res = await axios.get(`${BASE_URL}/api/auth/${user._id}`);
      setOptedIn(!!res.data?.optIn);
    } catch (err) {
      console.warn("Failed to refresh user opt-in", err?.message || err);
    }
  };

  // Fetch matches for the user
  const fetchOptInMatches = async () => {
    if (!user?._id) return;

    setMatchesLoading(true);
    setMatchError(null);
    try {
      const res = await axios.get(`${BASE_URL}/api/couple/user/${user._id}`);
      const matchData = res.data || [];

      // Filter to only show "matched" status (delivered matches)
      const deliveredMatches = matchData.filter((m) => m.status === "matched");
      setMatches(deliveredMatches);

      if (deliveredMatches.length === 0 && optedIn && windowState !== "delivering") {
        setMatchError("No matches found yet. Check back soon!");
      }
    } catch (error) {
      console.error("Error fetching matches:", error);
      setMatchError("Failed to load matches");
    } finally {
      setMatchesLoading(false);
    }
  };

  // Update UI label + disabled state based on window and optedIn
  const updateUiState = (currentWindowState) => {
    setWindowState(currentWindowState);

    if (currentWindowState === "delivering") {
      setButtonState("Matches Being Delivered");
      setIsDisabled(true);
      return;
    }

    if (optedIn) {
      setButtonState("You're already opted in — wait for your match!");
      setIsDisabled(true);
      return;
    }

    if (currentWindowState === "active") {
      setButtonState("Opt-In for This Week");
      setIsDisabled(false);
      return;
    }

    // locked
    setButtonState("Opt-In Closed — Next Opens Thursday");
    setIsDisabled(true);
  };

  // Listen for real-time match events from server
  useEffect(() => {
    if (!socket || !isConnected || !user?._id) return;

    const handleMatchCreated = (data) => {
      // Match created event (pending state, not shown yet)
      console.log("Match created event received", data);
    };

    const handleMatchDelivered = (data) => {
      // Match delivered event (now show to user)
      console.log("Match delivered event received", data);
      fetchOptInMatches();
    };

    const handleOptInReset = () => {
      // All users opt-in reset (Thu 00:01)
      console.log("Opt-in reset event received");
      setOptedIn(false);
      setMatches([]);
    };

    socket.on("match:created", handleMatchCreated);
    socket.on("match:delivered", handleMatchDelivered);
    socket.on("optin:reset", handleOptInReset);

    return () => {
      socket.off("match:created", handleMatchCreated);
      socket.off("match:delivered", handleMatchDelivered);
      socket.off("optin:reset", handleOptInReset);
    };
  }, [socket, isConnected, user?._id]);

  // Initial evaluation and ticking clock to update UI as time advances
  useEffect(() => {
    setOptedIn(!!user?.optIn);
    let lastWindow = evaluateWindow();

    updateUiState(lastWindow);
    // Fetch matches on initial load if opted in and window is active/delivering
    if (user?.optIn) {
      fetchOptInMatches();
    }

    // tick every 20 seconds to pick up boundary transitions quickly
    tickRef.current = setInterval(async () => {
      const currentWindow = evaluateWindow();
      if (currentWindow !== lastWindow) {
        // Crossing window boundary
        // If we moved from delivering -> active, refresh server opt-in (server resets at Thu 00:01)
        if (lastWindow === "delivering" && currentWindow === "active") {
          await refreshUserOptIn();
          // Fetch matches after opt-in refresh
          fetchOptInMatches();
        }
        lastWindow = currentWindow;
      }
      updateUiState(lastWindow);
    }, 20_000);

    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.optIn, user?._id]);

  // Handle opt-in action
  const handleOptIn = async () => {
    if (!user?._id || isDisabled || optedIn) return;

    try {
      await axios.put(`${BASE_URL}/api/auth/${user._id}`, {
        optIn: true,
      });

      setOptedIn(true);
      setButtonState("You're already opted in — wait for your match!");
      setIsDisabled(true);
    } catch (error) {
      console.error("Opt-In Error:", error);
      // show quick fallback UI feedback
      setButtonState("Failed to opt-in. Try again.");
      setTimeout(() => {
        const currentWindowState = evaluateWindow();
        updateUiState(currentWindowState);
      }, 2500);
    }
  };

  // Handle rejecting a match
  const handleRejectMatch = async (matchId) => {
    try {
      await axios.put(`${BASE_URL}/api/couple/match/${matchId}`, {
        status: "rejected",
      });
      setMatches((prev) => prev.filter((m) => m._id !== matchId));
    } catch (error) {
      console.error("Error rejecting match:", error);
    }
  };

  // Handle accepting a match (creates private chat)
  const handleAcceptMatch = async (matchId) => {
    try {
      const res = await axios.put(`${BASE_URL}/api/couple/match/${matchId}`, {
        status: "accepted",
      });
      setMatches((prev) => prev.filter((m) => m._id !== matchId));
      console.log("Match accepted, chat created:", res.data.chat);
      // Optionally navigate to chat or show success message
    } catch (error) {
      console.error("Error accepting match:", error);
    }
  };

  return (
    <div className="p-5 rounded-xl shadow bg-white">
      <h2 className="text-xl font-semibold text-gray-800 mb-3">Weekly Opt-In</h2>

      {/* Opt-In Button */}
      <button
        disabled={isDisabled || optedIn}
        onClick={handleOptIn}
        className={`w-full py-3 rounded-lg text-white font-medium transition ${
          isDisabled || optedIn ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {optedIn ? "You're already opted in — wait for your match!" : buttonState}
      </button>

      {/* Lock message */}
      {isDisabled && !optedIn && buttonState.includes("Closed") && (
        <p className="text-sm text-gray-500 mt-2">
          Opt-In is currently locked. Please check again on Thursday.
        </p>
      )}

      {/* Delivering message */}
      {windowState === "delivering" && (
        <p className="text-sm text-green-600 mt-2 font-medium">
          🎉 Matches are being delivered! Refresh to see your matches.
        </p>
      )}

      {/* Matches Display */}
      {optedIn && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Your Matches</h3>

          {matchesLoading && <p className="text-gray-500">Loading matches...</p>}

          {matchError && !matchesLoading && (
            <p className="text-sm text-orange-600 mb-3">{matchError}</p>
          )}

          {matches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {matches.map((match) => (
                <MatchCard
                  key={match._id}
                  match={match}
                  currentUserId={user._id}
                  onAccept={() => handleAcceptMatch(match._id)}
                  onReject={() => handleRejectMatch(match._id)}
                />
              ))}
            </div>
          ) : (
            !matchesLoading && (
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-gray-600">
                  {optedIn && windowState === "active"
                    ? "No matches available yet. Check back after Thursday!"
                    : "No matches at this time."}
                </p>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default OptInSection;
