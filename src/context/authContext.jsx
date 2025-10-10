import { createContext, useContext, useEffect, useState } from "react";
import { BASE_URL } from "../config/url";
import axios from "axios";

// Create Context
const AuthContext = createContext();

// Custom hook
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  // Load from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedToken) {
      setToken(storedToken);
      if (storedUser) {
        // Optimistically set user from localStorage
        setUser(JSON.parse(storedUser));

        // Verify and refresh user data from backend
        fetchUser(JSON.parse(storedUser)?._id);
      }
    }

    setLoading(false);
  }, []);

  const fetchUser = async (id) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/auth/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data);
      localStorage.setItem("user", JSON.stringify(response.data)); // keep updated
    } catch (error) {
      console.error("Error fetching user data:", error);
      logout(); // clear invalid session
    }
  };

  const login = (userData, tokenData) => {
    setUser(userData);
    setToken(tokenData);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", tokenData);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, setUser, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
