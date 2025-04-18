import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PORT from './usePort';

interface User {
  username: string;
  avatar?: string;
  id?: number;
  role: string;
}

export const useSession = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const fetchSession = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:${PORT}/api/check-session`, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        sessionStorage.setItem("user", JSON.stringify(data.user)); // Save user to sessionStorage
        setUser(data.user); // Update user state
      } else {
        sessionStorage.clear();
        setUser(null);
      }
    } catch (error) {
      console.error('Error fetching session:', error);
      sessionStorage.clear();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:${PORT}/api/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      if (response.ok) {
        sessionStorage.clear();
        setUser(null);
        navigate('/login');
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSession(); // Initial fetch on hook initialization
  }, []);

  return { user, isLoading, fetchSession, logout };
};
