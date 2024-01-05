import React, { useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const DashboardPage = () => {
  const { auth, setAuth } = useContext(AuthContext);

  useEffect(() => {
    console.log(`DashboardPage auth`);
    console.log(auth);
    if (auth.token) {
      axios
        .get(`${process.env.REACT_APP_BACKEND_URL}/user/data`, {
          headers: {
            Authorization: `token ${auth.token}`,
          },
        })
        .then((res) => {
          setAuth((prevAuth) => ({ ...prevAuth, user: res.data }));
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }, [auth.token, setAuth]);

  return (
    <div>
      <h1>Dashboard</h1>
      {auth.user ? (
        <div>
          <h1>Welcome, {auth.user.name}!</h1>
          <p>This is a simple integration between OAuth2 on GitHub with Node.js</p>
          <div style={{ maxWidth: '25%', margin: 'auto' }}>
            <img src={auth.user.avatar_url} alt="User profile" />
            <div>
              <div>{auth.user.name}</div>
              <div>{auth.user.bio}</div>
              <a href={auth.user.html_url}>GitHub Profile</a>
            </div>
          </div>
        </div>
      ) : (
        <p>Loading user data...</p>
      )}
    </div>
  );
};

export default DashboardPage;
