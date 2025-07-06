import { useEffect, useState, type JSX } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";

interface ProtectedRouteProps {
  children: JSX.Element;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setIsAuthenticated(false);
          return;
        }

        const res = await axios.get("http://localhost:5000/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("✅ Auth check success:", res.data);
        setIsAuthenticated(true);
      } catch (error) {
        console.log("⛔ Auth check failed:", error);
        localStorage.removeItem('token'); 
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  if (isAuthenticated === null) return <div>Loading...</div>;
  if (isAuthenticated === false) return <Navigate to="/signin" replace />;

  return children;
};

export default ProtectedRoute;
