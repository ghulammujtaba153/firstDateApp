import React, { useState } from "react";
import { FiSearch } from "react-icons/fi";

const Sidebar = ({ users, selectedUser, onUserSelect }) => {
  const [search, setSearch] = useState("");

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleUserClick = (user) => {
    onUserSelect(user);
  };

  return (
    <div className="p-3 md:p-4 border-r border-gray-200 h-full bg-white flex flex-col w-full md:w-80 overflow-y-auto slim-scrollbar min-w-0">
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
        <p className="text-base md:text-lg font-semibold mb-3 md:mb-4">Now Active</p>
        <div className="flex items-center gap-2 md:gap-3 overflow-x-auto pb-2">
          {users.filter((u) => u.online).map((user) => (
            <div key={user.id} className="relative flex-shrink-0">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 md:w-3 md:h-3 bg-green-500 border-2 border-white rounded-full"></span>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full h-[1px] bg-gray-200"></div>

      {/* Active Users */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-3">
          {filteredUsers.map((user) => (
            <div
              key={user.id || user.chatId}
              onClick={() => handleUserClick(user)}
              className={`flex items-center gap-3 p-2 rounded-lg transition cursor-pointer ${
                selectedUser?.id === user.id || selectedUser?._id === user.chatId
                  ? "bg-primary text-white"
                  : "hover:bg-primary/20"
              }`}
            >
              <div className="relative flex-shrink-0">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-9 h-9 md:w-10 md:h-10 rounded-full object-cover"
                />
                {user.online && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 md:w-3 md:h-3 bg-green-500 border-2 border-white rounded-full"></span>
                )}
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-center gap-1.5 md:gap-2">
                  <span className="font-medium truncate text-sm md:text-base">{user.name}</span>
                  {user.hasUnread && (
                    <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></span>
                  )}
                </div>
                <span className={`text-xs truncate ${selectedUser?.id === user.id || selectedUser?._id === user.chatId ? "text-white/80" : "text-gray-500"}`}>
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
