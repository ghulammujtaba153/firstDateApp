import React, { useState } from "react";
import { FaSearch } from "react-icons/fa"; // <-- Add this import

const options = [
  { label: "Smoker 🚬", value: "Slim" },
  { label: "Non smoker 🚭", value: "Athletic" },
  { label: "Drinks 🍷", value: "Average" },
  { label: "Heavy ⚡", value: "Heavy" },
  { label: "Smoker 🚬", value: "Slim" },
  { label: "Non smoker 🚭", value: "Athletic" },
  { label: "Drinks 🍷", value: "Average" },
  { label: "Heavy ⚡", value: "Heavy" },
  { label: "Smoker 🚬", value: "Slim" },
  { label: "Non smoker 🚭", value: "Athletic" },
  { label: "Drinks 🍷", value: "Average" },
  { label: "Heavy ⚡", value: "Heavy" },
  { label: "Smoker 🚬", value: "Slim" },
  { label: "Non smoker 🚭", value: "Athletic" },
  { label: "Drinks 🍷", value: "Average" },
  { label: "Heavy ⚡", value: "Heavy" },
];

const HealthSection = () => {
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
      <h1 className="text-xl font-bold mb-2">Your health info 🩺</h1>
      <p className="text-gray-600 mb-4">
        Lorem Ipsum is simply dummy text of the printing and typesetting industry.
      </p>

      {/* Search Bar with Icon */}
      <div className="relative w-full max-w-md mx-auto mb-4">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <FaSearch />
        </span>
        <input
          type="text"
          placeholder="Search health info..."
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

export default HealthSection;
