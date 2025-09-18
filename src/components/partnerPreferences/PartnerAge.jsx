import React from "react";

const PartnerAge = () => {
  const [ageRange, setAgeRange] = React.useState({ from: "", to: "" });

  return (
    <div className="max-w-md mx-auto text-center">
      <div className="my-4 text-left">
        <h1 className="text-xl font-bold">Partner age 👧</h1>
        <p className="text-gray-600 mb-4">
          Select the preferred age range for your partner.
        </p>
      </div>

      <div className="flex items-center justify-center gap-3">
        <input
          type="number"
          value={ageRange.from}
          onChange={(e) =>
            setAgeRange({ ...ageRange, from: e.target.value })
          }
          placeholder="From"
          min="18"
          className="w-full px-3 py-2 bg-gray-100 border rounded-lg outline-none text-center"
        />

        <span className="font-bold text-lg">-</span>

        <input
          type="number"
          value={ageRange.to}
          onChange={(e) =>
            setAgeRange({ ...ageRange, to: e.target.value })
          }
          placeholder="To"
          min="18"
          className="w-full px-3 py-2 bg-gray-100 border rounded-lg outline-none text-center"
        />
      </div>
    </div>
  );
};

export default PartnerAge;
