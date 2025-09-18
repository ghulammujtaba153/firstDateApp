import React, { useState } from "react";

const HeightSection = () => {
  const [unit, setUnit] = useState("cm"); // cm or ft-in
  const [cm, setCm] = useState("");
  const [feet, setFeet] = useState("");
  const [inches, setInches] = useState("");

  return (
    <div className="max-w-md mx-auto text-center">
      <div className="my-4 text-left">
        <h1 className="text-xl font-bold">Let’s measure your height 📏</h1>
        <p className="text-gray-600 mb-4">
          Tell us your height. Your profile does not display your exact height,
          only general info.
        </p>
      </div>

      {/* Unit Toggle */}
      <div className="flex justify-center gap-4 mb-4">
        <button
          onClick={() => setUnit("cm")}
          className={`px-4 py-2 rounded-full border transition ${
            unit === "cm"
              ? "bg-primary text-white border-primary"
              : "border-gray-300 text-gray-700 hover:bg-gray-100"
          }`}
        >
          cm
        </button>
        <button
          onClick={() => setUnit("ft-in")}
          className={`px-4 py-2 rounded-full border transition ${
            unit === "ft-in"
              ? "bg-primary text-white border-primary"
              : "border-gray-300 text-gray-700 hover:bg-gray-100"
          }`}
        >
          ft/in
        </button>
      </div>

      {/* Input fields */}
      {unit === "cm" ? (
        <input
          type="number"
          value={cm}
          onChange={(e) => setCm(e.target.value)}
          placeholder="Enter height in cm"
          className="w-full px-3 py-2 bg-gray-100 border rounded-lg outline-none text-center"
        />
      ) : (
        <div className="flex justify-center gap-2">
          <input
            type="number"
            value={feet}
            onChange={(e) => setFeet(e.target.value)}
            placeholder="Feet"
            className="w-1/2 px-3 py-2 bg-gray-100 border rounded-lg outline-none text-center"
          />
          <input
            type="number"
            value={inches}
            onChange={(e) => setInches(e.target.value)}
            placeholder="Inches"
            className="w-1/2 px-3 py-2 bg-gray-100 border rounded-lg outline-none text-center"
          />
        </div>
      )}
    </div>
  );
};

export default HeightSection;
