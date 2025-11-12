import React, { useState } from "react";

const FamillySection = ({ value = {}, onChange }) => {
  const [family, setFamily] = useState({
    haveKids: value.haveKids || "",
    wantKids: value.wantKids || "",
  });

  const handleChange = (field, newValue) => {
    const updated = { ...family, [field]: newValue };
    setFamily(updated);
    if (onChange) onChange(updated);
  };

  return (
    <div className="text-left my-4">
      <h1 className="text-xl font-bold mb-2">Kids or Family 👨‍👩‍👧‍👦</h1>
      <p className="text-gray-600 mb-4">
        Tell us a bit about your family preferences.
      </p>

      {/* Have Kids */}
      <div className="mb-4">
        <label className="block text-gray-700 mb-2 font-medium">
          Do you have kids?
        </label>
        <select
          value={family.haveKids}
          onChange={(e) => handleChange("haveKids", e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:outline-none"
        >
          <option value="">Select an option</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </div>

      {/* Want Kids */}
      <div>
        <label className="block text-gray-700 mb-2 font-medium">
          Do you want kids?
        </label>
        <select
          value={family.wantKids}
          onChange={(e) => handleChange("wantKids", e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:outline-none"
        >
          <option value="">Select an option</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </div>
    </div>
  );
};

export default FamillySection;
