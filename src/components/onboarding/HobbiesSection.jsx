import React, { useState } from "react";
import { FaSearch } from "react-icons/fa"; // <-- Add this import

const options = [
  { label: "Travel ✈️", value: "Slim" },
  { label: "Sports ⚽", value: "Athletic" },
  { label: "Reading 📚", value: "Average" },
  { label: "Music 🎵", value: "Heavy" },
  { label: "Movies 🎬", value: "Lean" },
  { label: "Foodie 🍕", value: "Fit" },
  { label: "Muscular", value: "Muscular" },
  { label: "Broad", value: "Broad" },
  { label: "Stocky", value: "Stocky" },
  { label: "Tall", value: "Tall" },
  { label: "Petite", value: "Petite" },
  { label: "Curvy", value: "Curvy" },
  { label: "Toned", value: "Toned" },
  { label: "Chubby", value: "Chubby" },
  { label: "Plus Size", value: "Plus Size" },
  { label: "Bulky", value: "Bulky" },
  { label: "Lean-Athletic", value: "Lean-Athletic" },
  { label: "Endomorphic", value: "Endomorphic" },
  { label: "Mesomorphic", value: "Mesomorphic" },
  { label: "Ectomorphic", value: "Ectomorphic" },
];

const HoobiesSection = () => {
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");

  const toggleSelect = (value) => {
    if (selected.includes(value)) {
      setSelected(selected.filter((item) => item !== value)); // remove if already selected
    } else {
      setSelected([...selected, value]); // add new selection
    }
  };

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="text-center">
      <div className="my-4 text-left">
        <h1 className="text-xl font-bold mb-2">Lifestyle & hobbies 🎧</h1>
        <p className="text-gray-600 mb-4">
          Lorem Ipsum is simply dummy text of the printing and typesetting industry.
        </p>
      </div>

      {/* Search Bar with Icon */}
      <div className="relative w-full max-w-md mx-auto mb-4">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <FaSearch />
        </span>
        <input
          type="text"
          placeholder="Search body type..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:outline-none"
        />
      </div>

      {/* Options Grid */}
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

      {/* Debug: Show selected values */}
      {/* <div className="mt-4 text-sm text-gray-600">
        Selected: {selected.length > 0 ? selected.join(", ") : "None"}
      </div> */}
    </div>
  );
};

export default HoobiesSection;
