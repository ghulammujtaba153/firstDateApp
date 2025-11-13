import React, { useEffect, useState, useMemo } from 'react';
import MatchCard from '../../components/dashboard/home/MatchCard';
import MatchRefreshTimer from '../../components/dashboard/home/MatchRefreshTimer';
import { FaArrowRight, FaSearch, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { Link } from "react-router-dom";
import Loader from '../../components/common/Loader';
import { useAuth } from '../../context/authContext';
import { BASE_URL } from '../../config/url';
import axios from 'axios';

const ITEMS_PER_PAGE = 8; // 2 rows * 4 columns per row

const Matches = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMatches = async () => {
    try {
      setLoading(true);
      setError("");
      const userId = user?._id || user?.id;
      const res = await axios.get(`${BASE_URL}/api/user-dashboard/get`, {
        params: userId ? { userId } : {}
      });
      console.log("Fetched matches:", res.data);
      
      // Handle new response format with timer data
      const usersData = res.data.users || res.data;
      
      // Ensure we have an array and add unique IDs if missing
      const matchesWithIds = Array.isArray(usersData) ? usersData.map((match, index) => ({
        ...match,
        id: match.id || match._id || `match-${index}` // Fallback ID
      })) : [];
      
      setMatches(matchesWithIds);
    } catch (error) {
      console.error("Error fetching matches:", error);
      setError("Failed to load matches. Please try again.");
      setMatches([]); // Reset to empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Handle timer completion - refresh matches with new data
  const handleTimerComplete = (newMatches) => {
    if (newMatches && Array.isArray(newMatches)) {
      const matchesWithIds = newMatches.map((match, index) => ({
        ...match,
        id: match.id || match._id || `match-${index}`
      }));
      setMatches(matchesWithIds);
      setPage(1); // Reset to first page
    } else {
      // If no matches provided, refetch
      fetchMatches();
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  // Memoized filtered and paginated data for better performance
  const { filteredMatches, totalPages, paginatedMatches, totalMatches } = useMemo(() => {
    if (!Array.isArray(matches)) {
      return {
        filteredMatches: [],
        totalPages: 0,
        paginatedMatches: [],
        totalMatches: 0
      };
    }

    const filtered = matches.filter(item =>
      item?.username?.toLowerCase().includes(search.toLowerCase()) ||
      item?.name?.toLowerCase().includes(search.toLowerCase()) // Also search by name if available
    );

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const paginated = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    return {
      filteredMatches: filtered,
      totalPages,
      paginatedMatches: paginated,
      totalMatches: filtered.length
    };
  }, [matches, search, page]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setPage(1);
  }, [search]);

  const handlePrev = () => {
    setPage(prev => Math.max(1, prev - 1));
  };

  const handleNext = () => {
    setPage(prev => Math.min(totalPages, prev + 1));
  };

  const handlePageClick = (pageNumber) => {
    setPage(pageNumber);
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages are less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show limited pages with ellipsis
      if (page <= 3) {
        // Near the start
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (page >= totalPages - 2) {
        // Near the end
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // In the middle
        pages.push(1);
        pages.push('...');
        for (let i = page - 1; i <= page + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  if (loading) return <Loader />;

  return (
    <div className="flex flex-col gap-6">
      {/* Timer Section */}
      {user && (
        <MatchRefreshTimer 
          userId={user._id || user.id} 
          onTimerComplete={handleTimerComplete}
        />
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Your Matches</h1>
          <p className="text-gray-600 mt-1">
            {totalMatches} {totalMatches === 1 ? 'match' : 'matches'} found
            {search && ` for "${search}"`}
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-80">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <FaSearch />
            </span>
            <input
              type="text"
              placeholder="Search by username..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary focus:border-transparent focus:outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
          <button 
            onClick={fetchMatches}
            className="ml-2 underline hover:no-underline"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Matches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {paginatedMatches.length > 0 ? (
          paginatedMatches.map((item) => (
            <MatchCard 
              item={item} 
              key={item.id} 
            />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">👥</div>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              {search ? 'No matches found' : 'No matches yet'}
            </h3>
            <p className="text-gray-500">
              {search 
                ? 'Try adjusting your search terms' 
                : 'Start exploring to find your perfect matches!'
              }
            </p>
            {search && (
              <button 
                onClick={() => setSearch("")}
                className="mt-3 text-primary hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Showing {((page - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(page * ITEMS_PER_PAGE, totalMatches)} of {totalMatches} matches
          </div>
          
          <div className="flex items-center gap-1">
            {/* Previous Button */}
            <button
              onClick={handlePrev}
              disabled={page === 1}
              className="p-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous page"
            >
              <FaChevronLeft className="w-4 h-4" />
            </button>

            {/* Page Numbers */}
            {getPageNumbers().map((pageNum, index) => (
              <button
                key={index}
                onClick={() => typeof pageNum === 'number' && handlePageClick(pageNum)}
                disabled={pageNum === '...'}
                className={`min-w-[40px] h-10 px-3 rounded-lg border transition-colors ${
                  pageNum === page
                    ? 'bg-primary text-white border-primary'
                    : pageNum === '...'
                    ? 'border-transparent text-gray-500 cursor-default'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {pageNum}
              </button>
            ))}

            {/* Next Button */}
            <button
              onClick={handleNext}
              disabled={page === totalPages}
              className="p-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Next page"
            >
              <FaChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Matches;