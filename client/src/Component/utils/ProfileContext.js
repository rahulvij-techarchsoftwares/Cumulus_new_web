import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from './Apiconfig.jsx'; // Ensure this path is correct

// Create a context to share the profile picture
export const ProfileContext = createContext();

// ProfileProvider component to provide the profile picture context
export const ProfileProvider = ({ children }) => {
  const [profilePicture, setProfilePicture] = useState(null);

  // Fetch the profile picture when the app loads
  useEffect(() => {
    const fetchProfilePicture = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/api/auth/get-profile-picture`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfilePicture(response.data.profilePicture); // Store the profile picture URL
      } catch (error) {
        console.error('Error fetching profile picture:', error);
      }
    };

    fetchProfilePicture();
  }, []);

  return (
    <ProfileContext.Provider value={{ profilePicture, setProfilePicture }}>
      {children}
    </ProfileContext.Provider>
  );
};
