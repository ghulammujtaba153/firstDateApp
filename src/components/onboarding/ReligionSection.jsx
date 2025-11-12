import React, { useState } from "react";

const ReligionSection = ({ value = "", onChange }) => {
  const [selectedReligion, setSelectedReligion] = useState(value);

  const religions = [
    "Agnostic",
    "Atheist",
    "Buddhist",
    "Catholic",
    "Christian",
    "Hindu",
    "Jain",
    "Jewish",
    "Mormon",
    "Latter-day Saint",
    "Muslim",
    "Zoroastrian",
    "Sikh",
    "Spiritual",
    "Other",
  ];

  const handleChange = (e) => {
    setSelectedReligion(e.target.value);
    if (onChange) onChange(e.target.value);
  };

  return (
    <div className="text-left my-4">
      <h1 className="text-xl font-bold mb-2">Religion 🙏</h1>
      <p className="text-gray-600 mb-4">
        Select your religion or belief system.
      </p>

      <select
        value={selectedReligion}
        onChange={handleChange}
        className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:outline-none"
      >
        <option value="">Select Religion</option>
        {religions.map((religion) => (
          <option key={religion} value={religion.toLowerCase()}>
            {religion}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ReligionSection;
