import React from "react";
import Sidebar from "../components/common/Sidebar";
import Header from "../components/common/Header";

const DashboardLayout = ({ children }) => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-0 md:ml-64">
        <Header />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
