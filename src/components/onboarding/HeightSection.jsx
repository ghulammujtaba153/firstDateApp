import React, { useState } from "react";

const HeightSection = () => {
  const [height, setHeight] = useState("");

  return (
    <div className="max-w-md mx-auto text-center">
<div className="my-4 text-left">
        <h1 className="text-xl font-bold">Let’s measure your height 📏</h1>
      <p className="text-gray-600 mb-4">
        Tell us your height. Your profile does not display your exact height,
        only general info.
      </p>
</div>

      <div className="flex items-center justify-center gap-2">
        <input
          type="number"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
          placeholder="Enter height"
          className="w-full px-3 py-2 bg-gray-100 border  rounded-lg outline-none text-center"
        />
        
      </div>
    </div>
  );
};

export default HeightSection;
