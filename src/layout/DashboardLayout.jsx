import React from "react";
import Sidebar from "../components/common/Sidebar";
import Header from "../components/common/Header";
import GlobalCallContainer from "../components/dashboard/chats/GlobalCallContainer";

const DashboardLayout = ({ children }) => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-0 md:ml-64">
        <Header />
        <main className="p-6">{children}</main>
      </div>
      {/* Global Call Container - appears on all dashboard pages */}
      <GlobalCallContainer />
    </div>
  );
};

export default DashboardLayout;
