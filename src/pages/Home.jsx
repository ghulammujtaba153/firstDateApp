import React, { useEffect, useState, useCallback } from "react";
import StickerCard from "../components/dashboard/home/StickerCard";
import MatchCard from "../components/dashboard/home/MatchCard";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import axios from "axios";
import { BASE_URL } from "../config/url";
import { useAuth } from "../context/authContext";
import Loader from './../components/common/Loader';
import MatchRefreshTimer from "../components/dashboard/home/MatchRefreshTimer";
import OptInSection from "../components/dashboard/home/OptInSection";


const data = [
  
  {
    id: 1,
    title: "Join our Speed Dating Event this Sunday!",
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
    linkText: "Register Now",
    link: "/dashboard/events",
  },
];



const Home = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const {user} = useAuth();

  const fetch = useCallback(async () => {
    try {
      if (!user?._id) return;
      
      const res = await axios.get(`${BASE_URL}/api/user-dashboard/get/${user._id}`);
      
      // Handle response - it should be an array of users
      const usersData = Array.isArray(res.data) ? res.data : [];
      
      // Ensure we have an array and add unique IDs if missing
      const matchesWithIds = usersData.map((match, index) => ({
        ...match,
        id: match.id || match._id || `match-${index}`
      }));
      
      setMatches(matchesWithIds);
    } catch (error) {
      console.log(error);
      setMatches([]);
    } finally {
      setLoading(false);
    } 
  }, [user?._id]);

  // Handle timer completion - refresh matches with new data
  const handleTimerComplete = useCallback((newMatches) => {
    if (newMatches && Array.isArray(newMatches)) {
      const matchesWithIds = newMatches.map((match, index) => ({
        ...match,
        id: match.id || match._id || `match-${index}`
      }));
      setMatches(matchesWithIds);
    } else {
      // If no matches provided, refetch
      fetch();
    }
  }, [fetch]);

  useEffect(() => {
    if (user?._id) {
      fetch();
    }
  }, [user, fetch]);


  if(loading) return <Loader />
  



  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6">
        {data.map((item) => (
          <StickerCard item={item} key={item.id} />
        ))}
      </div>

      {/* Timer Section */}
      {user && (
        <MatchRefreshTimer 
          userId={user._id || user.id} 
          onTimerComplete={handleTimerComplete}
        />
      )}

      <div className="flex flex-col gap-4 shadow-lg p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <h1 className="font-semibold">Matches</h1>
          <Link
            to="/dashboard/matches"
            className="text-primary hover:underline"
          >
            View All <FaArrowRight className="inline ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {matches.length > 0 ? (
            matches.map((item) => (
              <MatchCard item={item} key={item.id || item._id} />
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <div className="text-gray-400 text-4xl mb-2">👥</div>
              <p className="text-gray-500">No matches available yet</p>
            </div>
          )}
        </div>
      </div>

      <OptInSection/>
    </div>
  );
};

export default Home;
