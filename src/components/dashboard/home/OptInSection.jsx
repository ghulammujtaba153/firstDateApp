import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Switch from "react-switch";
import { BASE_URL } from "../../../config/url";
import { useAuth } from "../../../context/authContext";
import { useSocket } from "../../../context/socketContext";
import MatchCard from "./MatchCard";
import OPTMatchCard from "./OPTMatchCard";
import OptTimer from "./OptTimer";

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

  // const evaluateWindow = (now = new Date()) => {
  //   const total = minutesSinceWeekStart(now);

  //   const THU_00_00 = 4 * 1440; // 5760
  //   const THU_00_01 = THU_00_00 + 1; // 5761
  //   const TUE_23_00 = 2 * 1440 + 23 * 60; // 4260
  //   const TUE_23_01 = TUE_23_00 + 1; // 4261

  //   // delivering: Thu 00:00 -> Thu 00:01 (one minute)
  //   if (total >= THU_00_00 && total < THU_00_01) {
  //     return "delivering";
  //   }

  //   // active window wraps from Thu 00:01 -> Tue 23:00 (across week boundary)
  //   if (total >= THU_00_01 || total <= TUE_23_00) {
  //     return "active";
  //   }

  //   // locked: Tue 23:01 -> Thu 00:00
  //   if (total >= TUE_23_01 && total < THU_00_00) {
  //     return "locked";
  //   }

  //   return "locked";
  // };

  const evaluateWindow = (now = new Date()) => {
    const total = minutesSinceWeekStart(now);

    // Thursday 12:01 AM = lock reset (new week begins)
    const THU_12_01 = 4 * 1440 + 0 * 60 + 1; // Thursday (4), 00:01 (in minutes from week start)

    // Thursday 12:00 AM = match reveal
    const THU_12_00 = 4 * 1440 + 0 * 60 + 0; // Thursday (4), 00:00

    // Tuesday 11:01 PM = lock window starts (algorithm begins)
    const TUE_23_01 = 2 * 1440 + 23 * 60 + 1; // Tuesday (2), 23:01

    // Tuesday 11:00 PM = active window ends
    const TUE_23_00 = 2 * 1440 + 23 * 60 + 0; // Tuesday (2), 23:00

    // ✔ match reveal window (THU 00:00 → 00:01, one minute)
    if (total >= THU_12_00 && total < THU_12_01) {
      return "revealing";
    }

    // ✔ locked window (TUE 23:01 → THU 00:00)
    if (total >= TUE_23_01 && total < THU_12_00) {
      return "locked";
    }

    // ✔ active window (THU 00:01 → TUE 23:00, wraps week boundary)
    // This includes: Thu 00:01 -> Sun 23:59 -> Mon -> Tue 23:00
    if (total >= THU_12_01 || total <= TUE_23_00) {
      return "active";
    }

    // Fallback (should not reach here)
    return "active";
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
      console.log("Fetched delivered matches:", deliveredMatches);
      setMatches(deliveredMatches);

      if (
        deliveredMatches.length === 0 &&
        optedIn &&
        windowState !== "delivering"
      ) {
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

    // Match reveal window (Thu 00:00 - 00:01)
    if (currentWindowState === "revealing") {
      setButtonState("Matches Being Revealed");
      setIsDisabled(true);
      return;
    }

    // Locked window (Tue 23:01 - Thu 00:00)
    if (currentWindowState === "locked") {
      setButtonState("Opt-In Closed — Next Opt-In Opens Thursday");
      setIsDisabled(true);
      return;
    }

    // If opted in and has matches (active window)
    if (optedIn && matches.length > 0) {
      setButtonState("You Have a Match! 💕");
      setIsDisabled(true);
      return;
    }

    // If opted in but no matches yet (active window)
    if (optedIn && matches.length === 0) {
      setButtonState("You're Opted In — Matches Come Thursday!");
      setIsDisabled(true);
      return;
    }

    // Active window (Thu 00:01 - Tue 23:00) - can opt in
    if (currentWindowState === "active") {
      setButtonState("Opt-In for This Week");
      setIsDisabled(false);
      return;
    }
  };

  // Listen for real-time match events from server
  useEffect(() => {
    if (!socket || !isConnected || !user?._id) return;

    const handleMatchCreated = (data) => {
      // Match created event (pending state, not shown yet)
      console.log("Match created event received", data);
    };

    const handleMatchDelivered = (data) => {
      // Match delivered event (Thu 12:00 AM)
      console.log("Match delivered event received", data);
      // Refresh matches after delivery
      axios.get(`${BASE_URL}/api/couple/user/${user._id}`).then((res) => {
        const deliveredMatches = (res.data || []).filter((m) => m.status === "matched");
        setMatches(deliveredMatches);
      }).catch(err => console.error("Error fetching matches:", err));
    };

    const handleOptInReset = () => {
      // All users opt-in reset (Thu 12:01 AM - new week begins)
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
        // If we moved from locked -> active, refresh server opt-in (server resets at Thu 12:01)
        if (lastWindow === "locked" && currentWindow === "active") {
          await refreshUserOptIn();
          // Fetch matches after opt-in refresh
          fetchOptInMatches();
        }
        // If we moved from revealing -> active, matches have been delivered
        if (lastWindow === "revealing" && currentWindow === "active") {
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

  // Handle opt-in toggle
  const handleOptInToggle = async (checked) => {
    // Don't allow toggle during locked or revealing windows
    if (windowState === "locked" || windowState === "revealing") {
      return;
    }

    try {
      await axios.put(`${BASE_URL}/api/auth/${user._id}`, {
        optIn: checked,
      });

      setOptedIn(checked);
      if (checked) {
        setButtonState("You're opted in — matches come Thursday!");
      } else {
        setButtonState("Opt-In for This Week");
      }
    } catch (error) {
      console.error("Opt-In Toggle Error:", error);
      // Revert on error
      setOptedIn(!checked);
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
      <h2 className="text-xl font-semibold text-gray-800 mb-3">
        Weekly Opt-In
      </h2>

      {/* Opt-In Switch */}
      <div className="flex items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700">
            Opt-In Status
          </label>
          <p className="text-xs text-gray-500 mt-1">
            {windowState === "locked" && !optedIn
              ? "Matching in progress. Opens Thursday"
              : windowState === "revealing"
              ? "Matches being revealed!"
              : optedIn
              ? "You're in the pool. Matches come Thursday"
              : "Turn on to join this week's matching"}
          </p>
        </div>
        <Switch
          checked={optedIn}
          onChange={handleOptInToggle}
          disabled={isDisabled || windowState === "locked"}
          onColor="#3b82f6"
          onHandleColor="#ffffff"
          handleDiameter={28}
          uncheckedIcon={false}
          checkedIcon={false}
          boxShadow="0px 1px 5px rgba(0, 0, 0, 0.2)"
          activeBoxShadow="0px 0px 1px 10px rgba(59, 130, 246, 0.2)"
          height={24}
          width={50}
        />
      </div>


      {/* Show OptTimer only if locked, optedIn, and waiting for match */}
      {windowState === "locked" && optedIn && matches.length === 0 && (
        <OptTimer user={user} />
      )}

      {/* Lock message */}
      {isDisabled && !optedIn && buttonState.includes("Closed") && (
        <p className="text-sm text-gray-500 mt-2">
          Opt-In is currently locked. Please check again on Thursday.
        </p>
      )}

      {/* Revealing message */}
      {windowState === "revealing" && (
        <p className="text-sm text-green-600 mt-2 font-medium">
          🎉 Matches are being revealed! Refresh to see your matches.
        </p>
      )}

      {/* Matches Display (hide if timer is running) */}
      {optedIn && !(windowState === "locked" && matches.length === 0) && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Your Matches
          </h3>

          {matchesLoading && (
            <p className="text-gray-500">Loading matches...</p>
          )}

          {matchError && !matchesLoading && (
            <p className="text-sm text-orange-600 mb-3">{matchError}</p>
          )}

          {matches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {(() => {
                const latestMatch = matches[matches.length - 1]; // Get latest match
                const otherUser =
                  latestMatch.couple?.[0]?._id === user._id
                    ? latestMatch.couple?.[1]
                    : latestMatch.couple?.[0];

                return (
                  <MatchCard
                    key={latestMatch._id}
                    item={otherUser}
                    userLocation={user.location}
                  />
                );
              })()}
            </div>
          ) : (
            !matchesLoading && null
          )}
        </div>
      )}
    </div>
  );
};

export default OptInSection;
