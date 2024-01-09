import React, { useEffect, useContext, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ListGroup from 'react-bootstrap/ListGroup';
import RepositoryWorkflows from '../components/RepositoryWorkflows';

const DashboardPage = () => {
  const { auth } = useContext(AuthContext);
  const [repositories, setRepositories] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.token) navigate('/');

    axios
      .get(`${process.env.REACT_APP_BACKEND_URL}/api/repos`, {
        headers: { Authorization: auth.token },
        params: {
          type: 'private',
          per_page: 100
        }
      })
      .then(response => {
        setRepositories(response.data);
      })
      .catch(error => {
        console.error('Error fetching repos:', error);
      });
  }, [auth, navigate]);

  return (
    <div>
      <h1>Dashboard</h1>
      <h2>Your Repositories</h2>
      <ListGroup>
        {repositories.map(repo => (
          <ListGroup.Item
            key={repo.id}
            action
            onClick={() => setSelectedRepo(repo.name)}
          >
            {repo.name}
          </ListGroup.Item>
        ))}
      </ListGroup>
      {selectedRepo && (
        <RepositoryWorkflows repoName={selectedRepo} token={auth.token} />
      )}
    </div>
  );
};

export default DashboardPage;
