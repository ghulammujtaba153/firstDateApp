import React, { useState } from 'react';
import EventCard from '../../components/events/EventCard';

const data = [
  {
    id: 1,
    title: "Event 1",
    image: "/event-1.png",
    sub: "EventCard",
    date: "2023-10-01",
  },
  {
    id: 2,
    title: "Event 2",
    image: "/event-1.png",
    sub: "EventCard",
    date: "2023-10-02",
  },
  {
    id: 3,
    title: "Event 3",
    image: "/event-1.png",
    sub: "EventCard",
    date: "2023-10-03",
  },
  {
    id: 4,
    title: "Event 4",
    image: "/event-1.png",
    sub: "EventCard",
    date: "2023-10-04",
  },
  {
    id: 5,
    title: "Event 5",
    image: "/event-1.png",
    sub: "EventCard",
    date: "2023-10-05",
  },
  {
    id: 6,
    title: "Event 6",
    image: "/event-1.png",
    sub: "EventCard",
    date: "2023-10-06",
  },
  {
    id: 7,
    title: "Event 7",
    image: "/event-1.png",
    sub: "EventCard",
    date: "2023-10-07",
  },
  {
    id: 8,
    title: "Event 8",
    image: "/event-1.png",
    sub: "EventCard",
    date: "2023-10-08",
  },
];

const ITEMS_PER_PAGE = 6;

const Events = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Filter events by search
  const filtered = data.filter(item =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));

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
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {paginated.length > 0 ? (
          paginated.map((item) => (
            <EventCard key={item.id} item={item} />
          ))
        ) : (
          <div className="col-span-full text-center text-gray-500 py-8">No events found.</div>
        )}
      </div>
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
    </div>
  );
};

export default Events;
