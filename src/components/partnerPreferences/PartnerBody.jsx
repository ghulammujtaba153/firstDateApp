import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";

const options = [
  { label: "Slim 🧍‍♀️", value: "Slim" },
  { label: "Athletic 💪", value: "Athletic" },
  { label: "Average 🙂", value: "Average" },
  { label: "Heavy 🍔", value: "Heavy" },
  { label: "Lean 🏋️‍♂️", value: "Lean" },
  { label: "Fit 🏋️‍♂️", value: "Fit" },
  { label: "Muscular 🙂", value: "Muscular" },
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

const PartnerBody = ({ form, setForm }) => {
  const [search, setSearch] = useState("");

  const toggleSelect = (value) => {
    let updated;
    if (form.partnerBodyType.includes(value)) {
      updated = form.partnerBodyType.filter((item) => item !== value);
    } else {
      updated = [...form.partnerBodyType, value];
    }
    setForm({ ...form, partnerBodyType: updated });
  };

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="text-center">
      <div className="my-4 text-left">
        <h1 className="text-xl font-bold mb-2">Partner body type 🦵</h1>
        <p className="text-gray-600 mb-4">
          Select the body types you’d prefer for your partner.
        </p>
      </div>

      {/* Search Bar */}
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

      {/* Options */}
      <div className="flex flex-wrap gap-3 justify-left">
        {filteredOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => toggleSelect(option.value)}
            className={`px-4 py-2 rounded-full border transition ${
              form.partnerBodyType.includes(option.value)
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

export default PartnerBody;
