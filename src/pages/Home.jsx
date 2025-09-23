import React from "react";
import StickerCard from "../components/dashboard/home/StickerCard";
import MatchCard from "../components/dashboard/home/MatchCard";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';

const data = [
  {
    id: 1,
    title: "Do you want to join this week’s date?",
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
    linkText: "Yes, Find me a date",
    link: "/profile/johndoe",
  },
  {
    id: 2,
    title: "Join our Speed Dating Event this Sunday!",
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
    linkText: "Register Now",
    link: "/profile/janesmith",
  },
];

const matchData = [
  {
    id: 1,
    name: "John Doe",
    isVerified: true, 
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face" ,
    distance: "2 miles away",

  },
  {
    id: 2,
    name: "Jane Smith",
    isVerified: true,
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face" ,
    distance: "2 miles away",
  },
  {
    id: 3,
    name: "Jane Smith",
    isVerified: true,
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face" ,
    distance: "2 miles away",
  },
  {
    id: 4,
    name: "Jane Smith",
    isVerified: true,
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face" ,
    distance: "2 miles away",
  },
  {
    id: 5,
    name: "Jane Smith",
    isVerified: false,
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face" ,
    distance: "2 miles away",
  },
];

const Home = () => {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2  gap-6">
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
          {matchData.map((item) => (
            <MatchCard item={item} key={item.id} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
