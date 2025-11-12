import React, { useState, useEffect } from "react";

const HeightSection = ({ value, onChange }) => {
  const [unit, setUnit] = useState("cm"); // "cm" or "ft-in"
  const [cm, setCm] = useState("");
  const [feet, setFeet] = useState("");
  const [inches, setInches] = useState("");

  // Dropdown options
  const cmOptions = Array.from({ length: 121 }, (_, i) => 120 + i); // 120–240
  const feetOptions = [3, 4, 5, 6, 7, 8];
  const inchOptions = Array.from({ length: 12 }, (_, i) => i); // 0–11

  // When parent provides value (in cm)
  useEffect(() => {
    if (value) {
      const cmVal = Number(value);
      setCm(cmVal);

      // Convert cm to feet + inches
      const totalInches = cmVal / 2.54;
      const ft = Math.floor(totalInches / 12);
      const inch = Math.round(totalInches % 12);
      setFeet(ft);
      setInches(inch);
    }
  }, [value]);

  // Handle cm change
  const handleCmChange = (val) => {
    setCm(val);
    if (val) {
      onChange(Number(val)); // send cm to parent
    } else {
      onChange("");
    }
  };

  // Handle ft/in change
  const handleFeetInchesChange = (ft, inch) => {
    setFeet(ft);
    setInches(inch);
    if (ft || inch) {
      const cmVal = (Number(ft) * 12 + Number(inch)) * 2.54;
      setCm(Math.round(cmVal));
      onChange(Math.round(cmVal));
    } else {
      onChange("");
    }
  };

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
          type="button"
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
          type="button"
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

      {/* CM Dropdown */}
      {unit === "cm" ? (
        <select
          value={cm}
          onChange={(e) => handleCmChange(e.target.value)}
          className="w-full px-3 py-2 bg-gray-100 border rounded-lg outline-none text-center"
        >
          <option value="">Select your height (cm)</option>
          {cmOptions.map((val) => (
            <option key={val} value={val}>
              {val} cm
            </option>
          ))}
        </select>
      ) : (
        // FT-IN Dropdowns
        <div className="flex justify-center gap-3">
          <select
            value={feet}
            onChange={(e) => handleFeetInchesChange(e.target.value, inches)}
            className="w-1/2 px-3 py-2 bg-gray-100 border rounded-lg outline-none text-center"
          >
            <option value="">Feet</option>
            {feetOptions.map((ft) => (
              <option key={ft} value={ft}>
                {ft} ft
              </option>
            ))}
          </select>

          <select
            value={inches}
            onChange={(e) => handleFeetInchesChange(feet, e.target.value)}
            className="w-1/2 px-3 py-2 bg-gray-100 border rounded-lg outline-none text-center"
          >
            <option value="">Inches</option>
            {inchOptions.map((inch) => (
              <option key={inch} value={inch}>
                {inch} in
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default HeightSection;
