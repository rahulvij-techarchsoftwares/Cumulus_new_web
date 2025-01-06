import React from "react";
import { Routes, Route } from "react-router-dom";
import PublicSidebar from "../Component/Main/PublicSidebar";
import PublicNavbar from "../Component/Main/PublicNavbar";
import SharedFiles from "../Component/Main/SharedFiles";
const PublicLayout = () => {
  return (
    <div className="flex">
      <PublicSidebar />
      <div className="flex-grow">
        <PublicNavbar />
        <Routes>
          <Route path="/SharedFiles" element={<SharedFiles />} />
        </Routes>
      </div>
    </div>
  );
};
export default PublicLayout;