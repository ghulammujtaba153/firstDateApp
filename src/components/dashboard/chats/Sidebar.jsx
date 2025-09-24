import React, { useState } from "react";
import { FiSearch } from "react-icons/fi";

const Sidebar = ({ users }) => {
  const [search, setSearch] = useState("");

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 border-r h-screen bg-white flex flex-col w-80">
      {/* Search Bar */}
      <div className="mb-6 relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <FiSearch size={18} />
        </span>
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-3 py-2 border rounded-lg outline-none"
        />
      </div>

      <div className="flex flex-col mb-1">
        <p className="text-lg font-semibold mb-4">Now Active</p>
        <div className="flex items-center gap-3">
          {users.filter((u) => u.online).map((user) => (
            <div key={user.id} className="relative">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-primary border-2 border-white rounded-full"></span>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full h-[1px] bg-gray-200"></div>

      {/* Active Users */}
      <div>
        <div className="flex flex-col gap-3">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-primary/20 transition cursor-pointer"
            >
              <div className="relative">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                {user.online && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-primary border-2 border-white rounded-full"></span>
                )}
              </div>
              <div className="flex flex-col">
                <span className="font-medium">{user.name}</span>
                <span className="text-xs text-gray-500">
                  {user.lastMessage}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
