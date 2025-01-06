import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from './Apiconfig'; // Ensure you have this API URL configured

// Create a context for user data
export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState(null); // Store the user data
  const [username, setUsername] = useState(''); // Store username
  const [error, setError] = useState(''); // Store any error that occurs during data fetching

  // Function to fetch user data
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token'); // Get the token from localStorage
      const response = await axios.get(`${API_URL}/api/auth/get-personaluser-details`, {
        headers: { Authorization: `Bearer ${token}` }, // Send token in request headers
      });

      const data = response.data;
      if (!data?.user) {
        throw new Error('Invalid response structure');
      }

      setUserData(data);
      setUsername(data.user.username); // Set the username from fetched data
    } catch (err) {
      setError(err.message || 'Failed to fetch user data'); // Set error message if fetching fails
    }
  };

  useEffect(() => {
    fetchUserData();// Directly call fetchUserData to fetch data when the component mounts
  }, []);

  return (
    <UserContext.Provider value={{ userData, username, error }}>
      {children}
    </UserContext.Provider>
  );
};
