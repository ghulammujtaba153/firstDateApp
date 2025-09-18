import React, { useState } from "react";
import { FaSearch } from "react-icons/fa"; // <-- Add this import

const options = [
  { label: "Slim 🧍‍♀️", value: "Slim" },
  { label: "Athletic 💪", value: "Athletic" },
  { label: "Average 🙂", value: "Average" },
  { label: "Heavy 🍔", value: "Heavy" },
  { label: "Athletic 🏋️‍♂️", value: "Lean" },
  { label: "Fit 🏋️‍♂️", value: "Fit" },
  { label: "Muscular🙂", value: "Muscular" },
  { label: "Broad 💪", value: "Broad" },
  { label: "Stocky 🏋️‍♂️", value: "Stocky" },
  { label: "Tall 💪", value: "Tall" },
  { label: "Petite 🍔", value: "Petite" },
  { label: "Curvy 🍔", value: "Curvy" },
  { label: "Toned 🙂", value: "Toned" },
  { label: "Chubby 🍔", value: "Chubby" },
  { label: "Plus Size 🏋️‍♂️", value: "Plus Size" },
  { label: "Bulky 💪", value: "Bulky" },
  { label: "Lean-Athletic 🍔", value: "Lean-Athletic" },
  { label: "Endomorphic 🙂", value: "Endomorphic" },
  { label: "Mesomorphic 🏋️‍♂️", value: "Mesomorphic" },
];

const PartnerBody = () => {
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
        <h1 className="text-xl font-bold mb-2">Partner body type 🦵</h1>
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
    </div>
  );
};



export default PartnerBody
