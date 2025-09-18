import React, { useState } from "react";

const UserNameSection = () => {
  const [nickname, setNickname] = useState("");

  return (
    <div className="max-w-md mx-auto text-center">
      <div className="text-left">
        <h1 className="text-xl font-bold">Your first dates identity 😎</h1>
      <p className="text-gray-600 mt-2 mb-4">
        Create a unique nickname that represents you. <br />
        It’s how others will know and remember you.
      </p>
      </div>

      <input
        type="text"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        placeholder="Enter your nickname"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
      />
    </div>
  );
};

export default UserNameSection;
