import React, { useState } from "react";

const GenderSection = () => {
  const [selectedGender, setSelectedGender] = useState("");

  const options = [
    { label: "Man", value: "man" },
    { label: "Woman", value: "woman" },
    { label: "Other", value: "other" },
  ];

  return (
    <div className="w-full text-center">
      <div className="text-left my-4">
        <h2 className="text-xl font-semibold mb-2">Be true to yourself 🌟</h2>
      <p className="text-gray-400 mb-4">
        Choose the gender that best represents you.  
        Authenticity is key to meaningful connections.
      </p>
      </div>

      <div className="flex flex-col gap-3">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => setSelectedGender(option.value)}
            className={`w-full py-3 rounded-full border text-lg transition 
              ${
                selectedGender === option.value
                  ? "border-primary bg-primary text-white font-medium"
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

export default GenderSection;
