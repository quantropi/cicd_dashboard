import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ListGroup from 'react-bootstrap/ListGroup';

const RepositoryWorkflows = ({ repoName, token }) => {
  const [workflows, setWorkflows] = useState([]);

  console.log(`RepositoryWorkflows token: ${token}`);

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_BACKEND_URL}/api/workflows/${repoName}`, {
        headers: { Authorization: token },
      })
      .then(response => {
        setWorkflows(response.data.workflows);
      })
      .catch(error => {
        console.error('Error fetching workflows:', error);
      });
  }, [repoName, token]);

  return (
    <div>
      <h3>Workflows for {repoName}</h3>
      <ListGroup>
        {workflows.map(workflow => (
          <ListGroup.Item key={workflow.id}>{workflow.name}</ListGroup.Item>
        ))}
      </ListGroup>
    </div>
  );
};

export default RepositoryWorkflows;
