import React, { useState } from "react";

const PoliticsSection = ({ value = "", onChange }) => {
  const [selectedPolitics, setSelectedPolitics] = useState(value);

  const politicsOptions = ["Apolitical", "Moderate", "Left", "Right"];

  const handleChange = (e) => {
    setSelectedPolitics(e.target.value);
    console.log(e.target.value);
    if (onChange) onChange(e.target.value);
  };


  return (
    <div className="text-left my-4">
      <h1 className="text-xl font-bold mb-2">Politics 🗳️</h1>
      <p className="text-gray-600 mb-4">
        Select your political leaning (optional).
      </p>

      <select
        value={selectedPolitics}
        onChange={handleChange}
        className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:outline-none"
      >
        <option value="">Select Political View</option>
        {politicsOptions.map((option) => (
          <option key={option} value={option.toLowerCase()}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};

export default PoliticsSection;
