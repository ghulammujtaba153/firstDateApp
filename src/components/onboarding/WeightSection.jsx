import React from "react";

const WeightSection = ({ value, onChange }) => {
  return (
    <div className="max-w-md mx-auto text-center">
      <div className="my-4 text-left">
        <h1 className="text-xl font-bold">What’s your weight? ⚖️</h1>
        <p className="text-gray-600 mb-4">
          Tell us your weight. Your profile does not display your exact weight (kg), only general info.
        </p>
      </div>

      <div className="flex items-center justify-center gap-2">
        <input
          type="number"
          value={value || ""}
          onChange={(e) => onChange(Number(e.target.value))}
          placeholder="Enter weight in kg"
          className="w-full px-3 py-2 bg-gray-100 border rounded-lg outline-none text-center"
          min="30"
          max="300"
        />
        <span className="text-gray-500">kg</span>
      </div>
    </div>
  );
};

export default WeightSection;
