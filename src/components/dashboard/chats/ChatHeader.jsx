import React, { useState, useEffect, useCallback } from "react";
import { FiArrowLeft, FiVideo, FiPhone } from "react-icons/fi";
import { useAuth } from "../../../context/authContext";
import { BASE_URL } from "../../../config/url";
import axios from "axios";
import { useLocation } from "react-router-dom";
import Switch from "react-switch";

const ChatHeader = ({ chat, otherParticipant, onInitiateCall, onBack }) => {
  const [sentRequest, setSentRequest] = useState(null);
  const [receivedRequest, setReceivedRequest] = useState(null);
  const [loadingState, setLoadingState] = useState({
    fetch: false,
    send: false,
    accept: false,
  });
  const [chatStatus, setChatStatus] = useState(chat?.status || "active");
  const [chatStatusLoading, setChatStatusLoading] = useState(false);
  const { user: currentUser } = useAuth();
  const location = useLocation();
  const isEventsContext = location.pathname.includes("/dashboard/events/chat");
  const isPrivateContext = location.pathname.includes("/dashboard/chats");

  const normalizeId = (value) => {
    if (!value) return null;
    if (typeof value === "string") return value;
    if (typeof value === "object") {
      if (value._id) return value._id.toString();
      if (value.toString) return value.toString();
    }
    return null;
  };

  const fetchRequests = useCallback(async () => {
    if (!isEventsContext || !otherParticipant?._id || !currentUser?._id) return;
    setLoadingState((prev) => ({ ...prev, fetch: true }));
    try {
      const [sentRes, receivedRes] = await Promise.all([
        axios.post(`${BASE_URL}/api/match-requests/incoming`, {
          receiverId: otherParticipant._id,
          senderId: currentUser._id,
        }),
        axios.post(`${BASE_URL}/api/match-requests/get-received`, {
          receiverId: currentUser._id,
        }),
      ]);

      setSentRequest((sentRes.data || [])[0] || null);

      const incoming = (receivedRes.data || []).find((req) => {
        const senderId = normalizeId(req.userId);
        return senderId === normalizeId(otherParticipant._id);
      });

      setReceivedRequest(incoming || null);
    } catch (err) {
      console.error("Failed to fetch match requests", err);
    } finally {
      setLoadingState((prev) => ({ ...prev, fetch: false }));
    }
  }, [currentUser?._id, otherParticipant?._id, isEventsContext]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  useEffect(() => {
    setChatStatus(chat?.status || "active");
  }, [chat?._id, chat?.status]);

  const sendMatchRequest = async () => {
    if (!isEventsContext || !currentUser?._id || !otherParticipant?._id) return;
    setLoadingState((prev) => ({ ...prev, send: true }));
    try {
      const res = await axios.post(`${BASE_URL}/api/match-requests/create`, {
        userId: currentUser._id,
        requestedTo: otherParticipant._id,
      });
      const request = res.data?.request || res.data;
      setSentRequest(request);
    } catch (error) {
      console.error("Unable to send match request", error);
    } finally {
      setLoadingState((prev) => ({ ...prev, send: false }));
    }
  };

  const acceptRequest = async () => {
    if (!isEventsContext || !receivedRequest?._id) return;
    setLoadingState((prev) => ({ ...prev, accept: true }));
    try {
      const res = await axios.post(`${BASE_URL}/api/match-requests/accept`, {
        requestId: receivedRequest._id,
      });
      const request = res.data?.request || res.data;
      setReceivedRequest(request);
      // If they accept your request, consider it matched both ways
      if (!sentRequest) {
        setSentRequest(request);
      }
    } catch (error) {
      console.error("Unable to accept match request", error);
    } finally {
      setLoadingState((prev) => ({ ...prev, accept: false }));
    }
  };

  const handleChatStatusToggle = async (checked) => {
    if (!isPrivateContext || !chat?._id) return;
    const previousStatus = chatStatus;
    const nextStatus = checked ? "active" : "inactive";

    if (previousStatus === nextStatus) return;

    setChatStatus(nextStatus);
    setChatStatusLoading(true);
    try {
      const response = await axios.post(`${BASE_URL}/api/chat/update-status`, {
        chatId: chat._id,
        status: nextStatus,
      });
      const updatedStatus = response.data?.status || nextStatus;
      setChatStatus(updatedStatus);
    } catch (error) {
      console.error("Unable to update chat status", error);
      setChatStatus(previousStatus);
    } finally {
      setChatStatusLoading(false);
    }
  };

  const renderStatus = () => {
    if (!isEventsContext) return "";
    if (sentRequest) {
      if (sentRequest.status === "pending") return "Request Sent (Pending...)";
      if (sentRequest.status === "accepted") return "Match Accepted ✔";
      if (sentRequest.status === "rejected") return "Request Rejected";
    }

    if (receivedRequest) {
      if (receivedRequest.status === "pending")
        return "Incoming Request – Accept?";
      if (receivedRequest.status === "accepted") return "Match Accepted ✔";
      if (receivedRequest.status === "rejected") return "Request Rejected";
    }

    return "No Request";
  };

  const showSendButton =
    isEventsContext &&
    !sentRequest &&
    (!receivedRequest || receivedRequest.status === "rejected");

  return (
    <>
      {isEventsContext && (
        <div className="text-center py-1 mb-2 rounded-md bg-gray-100 text-sm font-medium text-gray-700">
          {renderStatus()}
        </div>
      )}

      <div className="mb-3 border-b pb-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full" onClick={onBack}>
            <FiArrowLeft size={22} className="text-gray-600" />
          </button>

          <img
            src={otherParticipant?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face"}
            className="w-10 h-10 rounded-full object-cover"
          />

          <span className="text-lg font-semibold truncate">
            {otherParticipant?.username}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {isEventsContext && (
            <>
              {showSendButton && (
                <button
                  onClick={sendMatchRequest}
                  disabled={loadingState.send}
                  className="px-3 py-1 bg-primary text-white rounded-lg disabled:opacity-60"
                >
                  {loadingState.send ? "Sending..." : "Send Request"}
                </button>
              )}

              {sentRequest && sentRequest.status === "pending" && (
                <span className="text-sm text-primary font-medium">
                  Awaiting response…
                </span>
              )}

              {receivedRequest && receivedRequest.status === "pending" && (
                <button
                  onClick={acceptRequest}
                  disabled={loadingState.accept}
                  className="px-3 py-1 bg-green-600 text-white rounded-lg disabled:opacity-60"
                >
                  {loadingState.accept ? "Accepting..." : "Accept"}
                </button>
              )}
            </>
          )}

          {isPrivateContext && chat?._id && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {chatStatus === "active" ? "Chat Open" : "Chat Closed"}
              </span>
              <Switch
                checked={chatStatus !== "inactive"}
                disabled={chatStatusLoading}
                onChange={handleChatStatusToggle}
                onColor="#22c55e"
                offColor="#f97316"
                uncheckedIcon={false}
                checkedIcon={false}
              />
            </div>
          )}

          <button onClick={() => onInitiateCall("audio")}>
            <FiPhone size={20} />
          </button>

          <button onClick={() => onInitiateCall("video")}>
            <FiVideo size={20} />
          </button>
        </div>
      </div>
    </>
  );
};

export default ChatHeader;
