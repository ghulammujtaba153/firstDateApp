import React, { useState } from 'react';

const Notification = () => {
  const [switches, setSwitches] = useState([true, false, false, false]);

  const handleToggle = (idx) => {
    setSwitches((prev) =>
      prev.map((val, i) => (i === idx ? !val : val))
    );
  };

  return (
    <div className="w-full max-w-[500px] p-6 bg-white shadow-lg rounded-2xl">

      <h2 className="text-lg font-bold mb-4">Notification Settings</h2>
      {["App Notifications", "Email Notifications", "SMS Notifications", "Special Offers", "Survey & Feedback Requests", "Promotional Offers"].map((label, idx) => (
        <div key={label} className="flex items-center justify-between mb-4">
          <span className="text-gray-700">{label}</span>
          <button
            onClick={() => handleToggle(idx)}
            className={`w-12 h-6 flex items-center rounded-full transition-colors duration-300 focus:outline-none ${
              switches[idx] ? "bg-primary" : "bg-gray-300"
            }`}
            aria-pressed={switches[idx]}
            aria-label={`Toggle ${label}`}
            type="button"
          >
            <span
              className={`inline-block w-5 h-5 transform bg-white rounded-full shadow transition-transform duration-300 ${
                switches[idx] ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      ))}
    </div>
  );
};

export default Notification;
