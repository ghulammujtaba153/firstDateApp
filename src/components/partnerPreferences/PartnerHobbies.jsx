import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";

const options = [
  { label: "Travel ✈️", value: "Travel" },
  { label: "Sports ⚽", value: "Sports" },
  { label: "Reading 📚", value: "Reading" },
  { label: "Music 🎵", value: "Music" },
  { label: "Movies 🎬", value: "Movies" },
  { label: "Foodie 🍕", value: "Foodie" },
  { label: "Dancing 💃", value: "Dancing" },
  { label: "Gaming 🎮", value: "Gaming" },
  { label: "Fitness 🏋️‍♂️", value: "Fitness" },
];

const PartnerHobbies = ({ form, setForm }) => {
  const [search, setSearch] = useState("");

  const toggleSelect = (value) => {
    let updated;
    if (form.partnerHobbies.includes(value)) {
      updated = form.partnerHobbies.filter((item) => item !== value);
    } else {
      updated = [...form.partnerHobbies, value];
    }
    setForm({ ...form, partnerHobbies: updated });
  };

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="text-center">
      <div className="my-4 text-left">
        <h1 className="text-xl font-bold mb-2">Partner Lifestyle & Hobbies 🎧</h1>
        <p className="text-gray-600 mb-4">
          Select hobbies and interests you'd like your partner to share.
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

      {/* Options Grid */}
      <div className="flex flex-wrap gap-3 justify-left">
        {filteredOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => toggleSelect(option.value)}
            className={`px-4 py-2 rounded-full border transition ${
              form.partnerHobbies.includes(option.value)
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

export default PartnerHobbies;
