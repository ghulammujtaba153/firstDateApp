import React, { useState } from 'react';
import MatchCard from '../../components/dashboard/home/MatchCard';
import { FaArrowRight, FaSearch } from "react-icons/fa";
import { Link } from "react-router-dom";

const matchData = [
  { id: 1, name: "John Doe", isVerified: true, image: "https://randomuser.me/api/portraits/lego/1.jpg", distance: "2 miles away" },
  { id: 2, name: "Jane Smith", isVerified: true, image: "https://randomuser.me/api/portraits/lego/1.jpg", distance: "2 miles away" },
  { id: 3, name: "Jane Smith", isVerified: true, image: "https://randomuser.me/api/portraits/lego/1.jpg", distance: "2 miles away" },
  { id: 4, name: "Jane Smith", isVerified: true, image: "https://randomuser.me/api/portraits/lego/1.jpg", distance: "2 miles away" },
  { id: 5, name: "Jane Smith", isVerified: false, image: "https://randomuser.me/api/portraits/lego/1.jpg", distance: "2 miles away" },
  // Add more items for pagination demo if needed
];

const ITEMS_PER_PAGE = 8; // 2 rows * 4 columns per row

const Matches = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Filtered and paginated data
  const filtered = matchData.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));

  return (
    <div className="flex flex-col gap-4 shadow-lg p-4 rounded-lg">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
        <h1 className="font-semibold">Matches</h1>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <FaSearch />
            </span>
            <input
              type="text"
              placeholder="Search matches..."
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 2 rows, 4 columns per row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {paginated.length > 0 ? (
          paginated.map((item) => <MatchCard item={item} key={item.id} />)
        ) : (
          <div className="col-span-full text-center text-gray-500 py-8">No matches found.</div>
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

export default Matches;
