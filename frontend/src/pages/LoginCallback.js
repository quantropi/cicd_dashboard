import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginCallback = () => {
  const [accessToken, setAccessToken] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('access_token');

    console.log(`accessToken: ${token}`);
    setAccessToken(token);

    if (token) {
      // Navigate to dashboard
      navigate('/dashboard');
    } else {
      navigate('/');
    }
  }, [navigate]);

  if (!accessToken) {
    return <div>Loading...</div>;
  }

  return <div>Processing GitHub login...</div>;
};

export default LoginCallback;
