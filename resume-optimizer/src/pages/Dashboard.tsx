// src/pages/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { removeAuthToken } from '../utils/auth';
import LoadingScreen from '../components/common/LoadingProgress';
import ErrorScreen from '../components/common/ErrorAlert';

const Dashboard: React.FC = () => {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getCurrentUser();
      
      if (response.status === 401) {
        removeAuthToken();
        navigate('/');
        return;
      }

      if (response.data) {
        setUserData(response.data);
      } else {
        setError('Failed to fetch user data.');
      }
    } catch (err) {
      setError('An error occurred while fetching user data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [navigate]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen 
      message={error}
      onRetry={fetchUserData}
    />;
  }

  return (
    <div>
      <h1>Welcome {userData?.full_name || userData?.email || 'User'}!</h1>
    </div>
  );
};

export default Dashboard;