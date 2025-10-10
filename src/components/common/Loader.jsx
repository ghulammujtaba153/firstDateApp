import React from "react";

const Loader = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="relative w-[80px] h-[80px]">
        {/* 9 dots */}
        <span className="absolute w-3 h-3 bg-black rounded-full animate-[ping_2s_linear_infinite]" style={{ top: "0px", left: "20px" }}></span>
        <span className="absolute w-3 h-3 bg-black rounded-full animate-[ping_2s_linear_infinite_0.2s]" style={{ top: "0px", left: "40px" }}></span>
        <span className="absolute w-3 h-3 bg-black rounded-full animate-[ping_2s_linear_infinite_0.4s]" style={{ top: "0px", left: "60px" }}></span>

        <span className="absolute w-3 h-3 bg-black rounded-full animate-[ping_2s_linear_infinite_0.6s]" style={{ top: "20px", left: "20px" }}></span>
        <span className="absolute w-3 h-3 bg-black rounded-full animate-[ping_2s_linear_infinite_0.8s]" style={{ top: "20px", left: "40px" }}></span>
        <span className="absolute w-3 h-3 bg-black rounded-full animate-[ping_2s_linear_infinite_1s]" style={{ top: "20px", left: "60px" }}></span>

        <span className="absolute w-3 h-3 bg-black rounded-full animate-[ping_2s_linear_infinite_1.2s]" style={{ top: "40px", left: "20px" }}></span>
        <span className="absolute w-3 h-3 bg-black rounded-full animate-[ping_2s_linear_infinite_1.4s]" style={{ top: "40px", left: "40px" }}></span>
        <span className="absolute w-3 h-3 bg-black rounded-full animate-[ping_2s_linear_infinite_1.6s]" style={{ top: "40px", left: "60px" }}></span>
      </div>
    </div>
  );
};

export default Loader;
