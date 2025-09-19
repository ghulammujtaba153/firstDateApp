import React from "react";
import StickerCard from "../components/dashboard/home/StickerCard";

const data = [
  {
    id: 1,
    title: "Do you want to join this week’s date?",
    description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
    linkText: "Yes, Find me a date",
    link: "/profile/johndoe",
  },
  {
    id: 2,
    title: "Join our Speed Dating Event this Sunday!",
    description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
    linkText: "Register Now",
    link: "/profile/janesmith",
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
    </div>
  );
};

export default Home;
