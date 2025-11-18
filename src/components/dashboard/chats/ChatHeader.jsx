import React, { useState, useEffect, useCallback } from "react";
import { FiArrowLeft, FiVideo, FiPhone } from "react-icons/fi";
import { useAuth } from "../../../context/authContext";
import { useSocket } from "../../../context/socketContext";
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
  const { socket } = useSocket();
  const location = useLocation();
  const isEventsContext = location.pathname.includes("/dashboard/events-chat");
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
      // incoming: requests where current user is the receiver
      const incomingRes = await axios.post(`${BASE_URL}/api/match-requests/incoming`, {
        receiverId: currentUser._id,
      });
      // sent: requests created by current user
      const sentRes = await axios.post(`${BASE_URL}/api/match-requests/sent`, {
        senderId: currentUser._id,
      });

      const incoming = incomingRes.data || [];
      const sent = sentRes.data || [];

      // The request that this chat concerns (sent by current user to other participant)
      const mySent = sent.find((r) => normalizeId(r.requestedTo) === normalizeId(otherParticipant._id)) || null;
      // The incoming request from other participant to current user
      const incomingFromOther = incoming.find((r) => normalizeId(r.userId) === normalizeId(otherParticipant._id)) || null;

      setSentRequest(mySent);
      setReceivedRequest(incomingFromOther);
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

  // Listen for real-time match request events
  useEffect(() => {
    if (!socket || !isEventsContext || !otherParticipant?._id || !currentUser?._id) return;

    const handleNewRequest = (data) => {
      // If we receive a new request from the other participant
      if (normalizeId(data.fromUserId) === normalizeId(otherParticipant._id)) {
        // Fetch updated requests to get the full request object
        fetchRequests();
      }
    };

    const handleAcceptedRequest = (data) => {
      // If our sent request was accepted
      if (normalizeId(data.acceptedByUserId) === normalizeId(otherParticipant._id)) {
        setSentRequest((prev) => ({
          ...prev,
          ...data.request,
          status: 'accepted'
        }));
        setReceivedRequest((prev) => 
          prev && normalizeId(prev.userId) === normalizeId(data.acceptedByUserId)
            ? { ...prev, ...data.request, status: 'accepted' }
            : prev
        );
      }
    };

    const handleRejectedRequest = (data) => {
      // If our sent request was rejected
      if (normalizeId(data.rejectedByUserId) === normalizeId(otherParticipant._id)) {
        setSentRequest((prev) => ({
          ...prev,
          ...data.request,
          status: 'rejected'
        }));
        setReceivedRequest((prev) => 
          prev && normalizeId(prev.userId) === normalizeId(data.rejectedByUserId)
            ? { ...prev, ...data.request, status: 'rejected' }
            : prev
        );
      }
    };

    const handleStatusUpdated = (data) => {
      // Update the request status if it matches our conversation
      if (normalizeId(data.request.userId) === normalizeId(otherParticipant._id) ||
          normalizeId(data.request.requestedTo) === normalizeId(otherParticipant._id)) {
        // Update received request if this is from the other participant
        if (normalizeId(data.request.userId) === normalizeId(otherParticipant._id)) {
          setReceivedRequest((prev) => ({
            ...prev,
            ...data.request,
            status: data.status
          }));
        }
        // Update sent request if this is our request to the other participant
        if (normalizeId(data.request.requestedTo) === normalizeId(otherParticipant._id) &&
            normalizeId(data.request.userId) === normalizeId(currentUser._id)) {
          setSentRequest((prev) => ({
            ...prev,
            ...data.request,
            status: data.status
          }));
        }
      }
    };

    // Listen for match request events
    socket.on('match-request:new', handleNewRequest);
    socket.on('match-request:accepted', handleAcceptedRequest);
    socket.on('match-request:rejected', handleRejectedRequest);
    socket.on('match-request:status-updated', handleStatusUpdated);

    // Cleanup listeners on unmount
    return () => {
      socket.off('match-request:new', handleNewRequest);
      socket.off('match-request:accepted', handleAcceptedRequest);
      socket.off('match-request:rejected', handleRejectedRequest);
      socket.off('match-request:status-updated', handleStatusUpdated);
    };
  }, [socket, isEventsContext, otherParticipant?._id, currentUser?._id, fetchRequests]);

  // Listen for real-time chat status updates
  useEffect(() => {
    if (!socket || !isPrivateContext || !chat?._id) return;

    const handleChatStatusUpdate = (data) => {
      if (data.chatId === chat._id) {
        setChatStatus(data.status);
      }
    };

    socket.on('chat:status-updated', handleChatStatusUpdate);

    return () => {
      socket.off('chat:status-updated', handleChatStatusUpdate);
    };
  }, [socket, isPrivateContext, chat?._id]);

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
        userId: currentUser._id, 
        status: nextStatus,
      });
      const updatedStatus = response.data?.status || nextStatus;
      setChatStatus(updatedStatus);
      // Backend will emit socket events automatically
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
