import { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const HomePage = () => {
  const { auth, setAuth } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('access_token');
    console.log(`HomePage token: ${token}`);
    if (token) {
      setAuth((prevAuth) => ({ ...prevAuth, token }));
      navigate('/dashboard');
    }   
    console.log(`HomePage auth:`);
    console.log(auth);
  }, [navigate, setAuth]);

  const githubUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.REACT_APP_GITHUB_CLIENT_ID}&redirect_uri=${process.env.REACT_APP_BACKEND_URL}/auth/callback`;

  return (
    <div className="App text-center container-fluid">
      {!auth.token ? (
        <>
          <img
            className="mb-4"
            src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
            alt='GitHub Logo'
            width="150"
          ></img>
          <h1 className="h3 mb-3 font-weight-normal">Sign in with GitHub</h1>
          <Button
            type="primary"
            className="btn"
            size="lg"
            href={githubUrl}
          >
            Sign in
          </Button>
        </>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
};

export default HomePage;
