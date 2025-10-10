import React, { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";

const options = [
  { label: "Travel ✈️", value: "travel" },
  { label: "Sports ⚽", value: "sports" },
  { label: "Reading 📚", value: "reading" },
  { label: "Music 🎵", value: "music" },
  { label: "Movies 🎬", value: "movies" },
  { label: "Foodie 🍕", value: "foodie" },
  { label: "Photography 📸", value: "photography" },
  { label: "Gaming 🎮", value: "gaming" },
  { label: "Fitness 🏋️", value: "fitness" },
  { label: "Art 🎨", value: "art" },
  { label: "Dancing 💃", value: "dancing" },
  { label: "Cooking 👩‍🍳", value: "cooking" },
];

const HoobiesSection = ({ value = [], onChange }) => {
  const [selected, setSelected] = useState(value);
  const [search, setSearch] = useState("");

  // Sync when parent updates
  useEffect(() => {
    setSelected(value);
  }, [value]);

  const toggleSelect = (val) => {
    let updated;
    if (selected.includes(val)) {
      updated = selected.filter((item) => item !== val);
    } else {
      updated = [...selected, val];
    }
    setSelected(updated);
    if (onChange) onChange(updated); // pass up
  };

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="text-center">
      <div className="my-4 text-left">
        <h1 className="text-xl font-bold mb-2">Lifestyle & hobbies 🎧</h1>
        <p className="text-gray-600 mb-4">
          Select hobbies that best describe you. Others won’t see exact choices.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative w-full max-w-md mx-auto mb-4">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <FaSearch />
        </span>
        <input
          type="text"
          placeholder="Search hobbies..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:outline-none"
        />
      </div>

      {/* Options */}
      <div className="flex flex-wrap gap-3 justify-left">
        {filteredOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => toggleSelect(option.value)}
            className={`px-4 py-2 rounded-full border transition ${
              selected.includes(option.value)
                ? "bg-primary/10 text-primary border-primary"
                : "border-gray-300 text-gray-700 hover:bg-gray-100"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default HoobiesSection;
