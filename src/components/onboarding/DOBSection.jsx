import React, { useState, useEffect } from 'react';

const DOBSection = ({ value, onChange }) => {
  // Parse incoming value (Date or string) into local parts
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [year, setYear] = useState("");

  // Sync when parent provides value
  useEffect(() => {
    if (value) {
      const date = new Date(value);
      if (!isNaN(date)) {
        setMonth(String(date.getMonth() + 1).padStart(2, "0"));
        setDay(String(date.getDate()).padStart(2, "0"));
        setYear(String(date.getFullYear()));
      }
    }
  }, [value]);

  // Update parent whenever local parts change
  useEffect(() => {
    if (month && day && year && year.length === 4) {
      const formatted = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
      onChange(formatted); // send to parent in YYYY-MM-DD
    }
  }, [month, day, year, onChange]);

  return (
    <div className="text-center">
      <div className="my-4 text-left">
        <h1 className="text-xl font-bold">Let’s celebrate you 🎂</h1>
        <p className="text-gray-600 mt-2">
          Tell us your birthdate. Your profile does not display your birthdate, only your age.
        </p>
      </div>

      <img
        src="/cake.png"
        alt="dob"
        className="w-[130px] h-[130px] mx-auto mt-4"
      />

      {/* Custom Date Input */}
      <div className="mt-6 text-left">
        <div className="flex items-center border bg-gray-100 border-gray-300 rounded-lg overflow-hidden w-full max-w-md">
          {/* Month */}
          <input
            type="text"
            maxLength={2}
            value={month}
            onChange={(e) => setMonth(e.target.value.replace(/\D/g, ""))}
            placeholder="MM"
            className="w-1/3 px-3 py-2 text-center focus:outline-none focus:ring-2 focus:ring-secondary"
          />
          <span className="text-gray-400">|</span>

          {/* Day */}
          <input
            type="text"
            maxLength={2}
            value={day}
            onChange={(e) => setDay(e.target.value.replace(/\D/g, ""))}
            placeholder="DD"
            className="w-1/3 px-3 py-2 text-center focus:outline-none focus:ring-2 focus:ring-secondary"
          />
          <span className="text-gray-400">|</span>

          {/* Year */}
          <input
            type="text"
            maxLength={4}
            value={year}
            onChange={(e) => setYear(e.target.value.replace(/\D/g, ""))}
            placeholder="YYYY"
            className="w-1/3 px-3 py-2 text-center focus:outline-none focus:ring-2 focus:ring-secondary"
          />
        </div>
      </div>
    </div>
  );
};

export default DOBSection;
