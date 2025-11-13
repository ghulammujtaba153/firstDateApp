import React, { useEffect, useState } from "react";
import StickerCard from "../components/dashboard/home/StickerCard";
import MatchCard from "../components/dashboard/home/MatchCard";
import { Link, useSearchParams } from "react-router-dom";
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import axios from "axios";
import { BASE_URL } from "../config/url";
import { useAuth } from "../context/authContext";
import Loader from './../components/common/Loader';


const data = [
  
  {
    id: 1,
    title: "Join our Speed Dating Event this Sunday!",
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
    linkText: "Register Now",
    link: "/profile/janesmith",
  },
];



const Home = () => {
  const [matches, setMatches] = useState(data);
  const [loading, setLoading] = useState(true);
  const {user} = useAuth();

  const fetch = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/user-dashboard/get/${user._id}`);
      setMatches(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    } 
  }


  useEffect(() => {
    fetch();
  }, []);


  if(loading) return <Loader />
  



  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1   gap-6">
        {data.map((item) => (
          <StickerCard item={item} key={item.id} />
        ))}
      </div>

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5  gap-6">
          {matches.map((item) => (
            <MatchCard item={item} key={item.id} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
