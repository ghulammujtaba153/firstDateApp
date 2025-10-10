import React, { useEffect, useState } from 'react'
import { BASE_URL } from './../config/url';
import axios from "axios";
import { useAuth } from "../context/authContext";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

const GoogleAuth = () => {
    const [searchParams] = useSearchParams(); 
    const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const {login, setUser} = useAuth()

  const token = searchParams.get('token');
  
  console.log("token in file",token);

  const fetchUser = async () => {
    try {
      if (!token) {
        setError("No token found");
        setLoading(false);
        return;
      }

      const response = await axios.post(`${BASE_URL}/api/auth/me`, { 
        token: token
      });
      
      setUser(response.data);

      login(response.data, token)

      navigate("/dashboard");

    } catch (error) {
      console.error("Error fetching user:", error);

      setError("Failed to fetch user data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [token]); 

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-red-500 text-lg">{error}</div>
      </div>
    );
  }


  return (
    <div>
      <p>loading</p>
    </div>
  )
}

export default GoogleAuth
