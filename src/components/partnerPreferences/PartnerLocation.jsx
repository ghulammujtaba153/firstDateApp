import React, { useState } from "react";

const PartnerLocation = () => {
  const [location, setLocation] = useState("");
  const [nearMe, setNearMe] = useState(false);

  const usaCities = [
    "New York",
    "Los Angeles",
    "Chicago",
    "Houston",
    "Miami",
    "San Francisco",
    "Seattle",
    "Boston",
    "Dallas",
    "Atlanta",
  ];

  return (
    <div className="text-center">
      <div className="my-4 text-left">
        <h1 className="text-xl font-bold mb-2">Partner location 📍</h1>

        {/* Description */}
        <p className="text-gray-600 max-w-md mx-auto mb-4">
          Select a city in the USA or choose "Near Me".
        </p>

        {/* Dropdown for USA Cities */}
        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          disabled={nearMe}
          className="w-full px-4 py-2 border rounded-lg bg-gray-100 outline-none"
        >
          <option value="">Select a city</option>
          {usaCities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>

        {/* Near Me Checkbox */}
        <div className="flex items-center mt-4">
          <input
            type="checkbox"
            id="nearMe"
            checked={nearMe}
            onChange={(e) => {
              setNearMe(e.target.checked);
              if (e.target.checked) setLocation(""); // clear city if "Near Me" is selected
            }}
            className="w-5 h-5 accent-primary"
          />
          <label htmlFor="nearMe" className="ml-2 text-gray-700">
            Near Me
          </label>
        </div>
      </div>
    </div>
  );
};

export default PartnerLocation;
