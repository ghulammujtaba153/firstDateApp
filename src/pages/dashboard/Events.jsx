import React, { useState, useEffect, useMemo } from 'react';
import EventCard from '../../components/events/EventCard';
import PaymentModal from '../../components/events/PaymentModal';
import ParticipantsGallery from '../../components/events/ParticipantsGallery';
import EventFeedbackModal from '../../components/events/EventFeedbackModal';
import { BASE_URL } from '../../config/url';
import { useAuth } from '../../context/authContext';
import axios from 'axios';
import Loader from '../../components/common/Loader';
import { verifyPaymentAndJoinEvent, refundPayment } from '../../services/paymentService';
import { getUserEventFeedback } from '../../services/eventFeedbackService';

const ITEMS_PER_PAGE = 6;

const Events = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [joiningEventId, setJoiningEventId] = useState(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [galleryModalOpen, setGalleryModalOpen] = useState(false);
  const [selectedEventForGallery, setSelectedEventForGallery] = useState(null);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [selectedEventForFeedback, setSelectedEventForFeedback] = useState(null);
  const [existingFeedback, setExistingFeedback] = useState(null);
  const { user, token } = useAuth();

  // Helper to get event date
  const getEventDate = (event) => {
    if (event.startDate) return event.startDate;
    if (event.date) return event.date;
    return null;
  };

  // Helper to get event time
  const getEventTime = (event) => {
    if (event.time) return event.time;
    if (event.startDate) {
      const date = new Date(event.startDate);
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
    }
    return "";
  };

  // Check if user has joined an event
  const hasUserJoined = (event) => {
    if (!user || !event.participants) return false;
    return event.participants.some(
      participant => 
        (typeof participant === 'string' && participant === user._id) ||
        (participant._id === user._id) ||
        (participant === user._id)
    );
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(`${BASE_URL}/api/events/get`);
      console.log("Fetched events:", res.data);
      
      // Ensure we have an array
      const eventsData = Array.isArray(res.data) ? res.data : [];
      setEvents(eventsData);
    } catch (error) {
      console.error("Error fetching events:", error);
      setError("Failed to load events. Please try again.");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinEvent = async (event) => {
    if (!user || !user._id) {
      alert("Please login to join events");
      return;
    }

    // Check if event requires payment
    const eventPrice = event.price || 0;
    
    if (eventPrice > 0) {
      // Open payment modal
      setSelectedEvent(event);
      setPaymentModalOpen(true);
    } else {
      // Free event, join directly
      await joinEventDirectly(event._id);
    }
  };

  const joinEventDirectly = async (eventId) => {
    try {
      setJoiningEventId(eventId);
      // For free events, use the payment service which handles free events
      await verifyPaymentAndJoinEvent(eventId, user._id, null, token);
      await fetchEvents();
    } catch (error) {
      console.error("Error joining event:", error);
      alert(error.message || "Failed to join event. Please try again.");
    } finally {
      setJoiningEventId(null);
    }
  };

  const handlePaymentSuccess = async () => {
    // Refresh events list after successful payment
    await fetchEvents();
    setPaymentModalOpen(false);
    setSelectedEvent(null);
  };

  const handlePaymentError = (errorMessage) => {
    alert(errorMessage || "Payment failed. Please try again.");
  };

  const handleViewGallery = (event) => {
    setSelectedEventForGallery(event);
    setGalleryModalOpen(true);
  };

  const handleFeedback = async (event) => {
    setSelectedEventForFeedback(event);
    
    // Check if user has already given feedback
    try {
      if (user && user._id && event._id) {
        const feedback = await getUserEventFeedback(event._id, user._id, token);
        setExistingFeedback(feedback);
      }
    } catch (error) {
      console.error('Error checking existing feedback:', error);
      setExistingFeedback(null);
    }
    
    setFeedbackModalOpen(true);
  };

  const handleFeedbackSuccess = () => {
    // Optionally refresh events or show success message
    console.log('Feedback submitted successfully');
    setExistingFeedback(null);
  };

  const handleLeaveEvent = async (eventId) => {
    if (!user || !user._id) {
      return;
    }

    const confirmed = window.confirm("Are you sure you want to leave this event?");
    if (!confirmed) return;

    try {
      setJoiningEventId(eventId);
      
      // Check if event has a price (paid event)
      const event = events.find(e => e._id === eventId);
      if (event && event.price > 0) {
        // Try to refund payment
        try {
          await refundPayment(eventId, user._id, token);
        } catch (refundError) {
          console.error("Refund error (may not be refundable):", refundError);
          // Continue with leaving event even if refund fails
        }
      }

      // Leave the event
      const res = await axios.post(
        `${BASE_URL}/api/events/${eventId}/leave`,
        { userId: user._id },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        }
      );
      
      // Refresh events list
      await fetchEvents();
    } catch (error) {
      console.error("Error leaving event:", error);
      alert(error.response?.data?.message || "Failed to leave event. Please try again.");
    } finally {
      setJoiningEventId(null);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Separate joined and other events
  const { joinedEvents, otherEvents } = useMemo(() => {
    if (!Array.isArray(events)) {
      return { joinedEvents: [], otherEvents: [] };
    }

    const joined = events.filter(event => hasUserJoined(event));
    const others = events.filter(event => !hasUserJoined(event));
    
    return { joinedEvents: joined, otherEvents: others };
  }, [events, user]);

  // Filter events by search
  const filteredJoined = useMemo(() => 
    joinedEvents.filter(item =>
      item.title?.toLowerCase().includes(search.toLowerCase())
    ), [joinedEvents, search]
  );

  const filteredOthers = useMemo(() => 
    otherEvents.filter(item =>
      item.title?.toLowerCase().includes(search.toLowerCase())
    ), [otherEvents, search]
  );

  // For display, we want to show all joined events first, then paginate others
  // So we'll show all joined events and paginate only the others
  const totalOthersPages = Math.ceil(filteredOthers.length / ITEMS_PER_PAGE);
  const paginatedOthers = filteredOthers.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  
  // Calculate total pages considering joined events take up space
  // If we have joined events, they're always shown, so we adjust pagination
  const totalPages = filteredJoined.length > 0 
    ? Math.max(1, totalOthersPages)
    : totalOthersPages;

  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));

  if (loading) {
    return (
      <div className="flex flex-col gap-4 shadow-lg p-6 rounded-[30px]">
        <div className="flex justify-center items-center py-12">
          <Loader />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4 shadow-lg p-6 rounded-[30px]">
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={fetchEvents}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 shadow-lg p-6 rounded-[30px]">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 mb-2">
        <h1 className='text-xl font-bold'>Events</h1>
        <div className="relative w-full md:w-64">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <svg width="16" height="16" fill="currentColor"><path d="M11.742 10.344h-.79l-.28-.27a6.471 6.471 0 001.58-4.24A6.5 6.5 0 105.5 11.5c1.61 0 3.09-.59 4.24-1.58l.27.28v.79l4.25 4.24c.41.41 1.08.41 1.49 0a1.06 1.06 0 000-1.49l-4.24-4.25zm-6.24 0A4.5 4.5 0 1110 5.5a4.5 4.5 0 01-4.5 4.5z"/></svg>
          </span>
          <input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </div>
      </div>

      {/* Joined Events Section - Always show all joined events */}
      {filteredJoined.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4 text-primary">My Events</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {filteredJoined.map((item) => (
              <EventCard
                key={item._id || item.id}
                item={item}
                isJoined={true}
                onJoin={() => handleJoinEvent(item)}
                onLeave={() => handleLeaveEvent(item._id || item.id)}
                isLoading={joiningEventId === (item._id || item.id)}
                getEventDate={getEventDate}
                getEventTime={getEventTime}
                onViewGallery={handleViewGallery}
                onFeedback={handleFeedback}
              />
            ))}
          </div>
        </div>
      )}

      {/* Other Events Section */}
      {paginatedOthers.length > 0 && (
        <div>
          {filteredJoined.length > 0 && (
            <h2 className="text-lg font-semibold mb-4">Available Events</h2>
          )}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {paginatedOthers.map((item) => (
              <EventCard
                key={item._id || item.id}
                item={item}
                isJoined={false}
                onJoin={() => handleJoinEvent(item)}
                onLeave={() => handleLeaveEvent(item._id || item.id)}
                isLoading={joiningEventId === (item._id || item.id)}
                getEventDate={getEventDate}
                getEventTime={getEventTime}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredJoined.length === 0 && paginatedOthers.length === 0 && (
        <div className="col-span-full text-center text-gray-500 py-8">
          {search ? "No events found matching your search." : "No events available."}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <button
            onClick={handlePrev}
            disabled={page === 1}
            className="px-3 py-1 rounded border bg-gray-100 text-gray-700 disabled:opacity-50"
          >
            Prev
          </button>
          <span className="mx-2 text-sm">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={handleNext}
            disabled={page === totalPages}
            className="px-3 py-1 rounded border bg-gray-100 text-gray-700 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Payment Modal */}
      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => {
          setPaymentModalOpen(false);
          setSelectedEvent(null);
        }}
        event={selectedEvent}
        userId={user?._id}
        token={token}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
      />

      {/* Participants Gallery Modal */}
      <ParticipantsGallery
        isOpen={galleryModalOpen}
        onClose={() => {
          setGalleryModalOpen(false);
          setSelectedEventForGallery(null);
        }}
        eventId={selectedEventForGallery?._id}
        event={selectedEventForGallery}
      />

      {/* Event Feedback Modal */}
      <EventFeedbackModal
        isOpen={feedbackModalOpen}
        onClose={() => {
          setFeedbackModalOpen(false);
          setSelectedEventForFeedback(null);
          setExistingFeedback(null);
        }}
        event={selectedEventForFeedback}
        userId={user?._id}
        token={token}
        onSuccess={handleFeedbackSuccess}
        existingFeedback={existingFeedback}
      />
    </div>
  );
};

export default Events;
