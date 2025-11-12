import React, { useState, useEffect } from "react";

const DOBSection = ({ value, onChange }) => {
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [year, setYear] = useState("");

  // Month options
  const months = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  // Generate years (from 1940 to current year)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1940 + 1 }, (_, i) =>
    String(currentYear - i)
  );

  // Generate days (1–31)
  const days = Array.from({ length: 31 }, (_, i) =>
    String(i + 1).padStart(2, "0")
  );

  // Parse incoming value from parent
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

  // Update parent on change
  useEffect(() => {
    if (month && day && year && year.length === 4) {
      const formatted = `${year}-${month}-${day}`;
      onChange(formatted);
    }
  }, [month, day, year, onChange]);

  return (
    <div className="text-center">
      <div className="my-4 text-left">
        <h1 className="text-xl font-bold">Let’s celebrate you 🎂</h1>
        <p className="text-gray-600 mt-2">
          Tell us your birthdate. Your profile does not display your birthdate,
          only your age.
        </p>
      </div>

      <img
        src="/cake.png"
        alt="dob"
        className="w-[130px] h-[130px] mx-auto mt-4"
      />

      <div className="mt-6 text-left w-full flex justify-center">
        <div className="flex items-center gap-3 bg-gray-100 border border-gray-300 rounded-lg p-2 w-full max-w-md justify-center">
          {/* Month Dropdown */}
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-1/3 px-3 py-2 text-center rounded-md bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-secondary"
          >
            <option value="">Month</option>
            {months.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>

          {/* Day Dropdown */}
          <select
            value={day}
            onChange={(e) => setDay(e.target.value)}
            className="w-1/3 px-3 py-2 text-center rounded-md bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-secondary"
          >
            <option value="">Day</option>
            {days.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          {/* Year Dropdown */}
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-1/3 px-3 py-2 text-center rounded-md bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-secondary"
          >
            <option value="">Year</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default DOBSection;
