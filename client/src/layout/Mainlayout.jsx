import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "../Component/Main/Sidebar";
import Dashboard from "../Component/Main/Dashboard";
import Subscription from "../Component/Main/Subscription";
import Navbar from "../Component/Main/Navbar";
import Voicememo from "../Component/Main/Voicememo";
import Help from "../Component/Main/Help";
import SharedFiles from "../Component/Main/SharedFiles";
import Profile from "../Component/Main/Profile";
import { UserProvider } from '../Component/utils/UserContext';
import { ProfileProvider } from "../Component/utils/ProfileContext"; // Import the ProfileProvider
const MainLayout = () => {
  const [selectedFolder, setSelectedFolder] = useState();
  const [searchQuery, setSearchQuery] = useState('');


  // Define the folder selection handler
  const handleFolderSelect = (folderId) => {

    setSelectedFolder(folderId);
  };

  return (
    <UserProvider>
      <ProfileProvider>
      
      <div className="flex">
      {/* Pass onFolderSelect to Sidebar */}
      <Sidebar onFolderSelect={handleFolderSelect} />
      <div className="flex-grow">
        <Navbar onFolderSelect={handleFolderSelect} setSearchQuery={setSearchQuery} />
        <Routes>
          {/* Pass both folderId and onFolderSelect to Dashboard */}
          <Route
            path="/folder/:id"

            element={
              <Dashboard folderId={selectedFolder} onFolderSelect={handleFolderSelect} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            }
          />
          <Route path="/SharedFiles" element={<SharedFiles />} />
          <Route path="/subscription" element={<Subscription />} />
          <Route path="/Voicememo" element={<Voicememo searchQuery={searchQuery} setSearchQuery={setSearchQuery} />} />
          <Route path="/my-profile" element={<Profile />} />
          <Route path="/help" element={<Help />} />
        </Routes>
      </div>
    </div>
      
      </ProfileProvider>
      </UserProvider>
    
  );
};

export default MainLayout;