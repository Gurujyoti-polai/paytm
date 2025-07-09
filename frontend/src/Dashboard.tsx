import { useEffect, useState } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [user, setUser] = useState<{ userId: string } | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        console.log("📡 Requesting /api/auth/me...");
        const token = localStorage.getItem('token');
        const { data } = await axios.get('http://localhost:5001/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(data);
      } catch (err) {
        console.error('Failed to fetch user', err);
      }
    };

    fetchUser();
  }, []);

  return (
    <div>
      <h1>Welcome {user?.userId}</h1>
    </div>
  );
};

export default Dashboard;
