import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";

const options = [
  { label: "Ambitious 💼", value: "ambitious" },
  { label: "Confident 😎", value: "confident" },
  { label: "Shy 😊", value: "shy" },
  { label: "Empathetic 💖", value: "empathetic" },
  { label: "Generous 🎁", value: "generous" },
  { label: "Funny 😂", value: "funny" },
  { label: "Kind 💕", value: "kind" },
  { label: "Loyal 🤝", value: "loyal" },
  { label: "Optimistic 🌞", value: "optimistic" },
  { label: "Playful 🎈", value: "playful" },
  { label: "Curious 🧠", value: "curious" },
  { label: "Intelligent 📚", value: "intelligent" },
  { label: "Reserved 🤫", value: "reserved" },
];

const PartnerPersonality = ({ form, setForm }) => {
  const [search, setSearch] = useState("");

  const toggleSelect = (value) => {
    let updated;
    if (form.partnerPersonality.includes(value)) {
      updated = form.partnerPersonality.filter((item) => item !== value);
    } else {
      updated = [...form.partnerPersonality, value];
    }
    setForm({ ...form, partnerPersonality: updated });
  };

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="text-center">
      <div className="my-4 text-left">
        <h1 className="text-xl font-bold mb-2">
          What type of values are you looking for in a partner? ❤️
        </h1>
        <p className="text-gray-600 mb-4">
          Choose traits that best describe your ideal partner.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative w-full max-w-md mx-auto mb-4">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <FaSearch />
        </span>
        <input
          type="text"
          placeholder="Search values..."
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
              form.partnerPersonality.includes(option.value)
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

export default PartnerPersonality;
