import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ListGroup from 'react-bootstrap/ListGroup';

const AllRepositoryRuns = ({ repoName, token }) => {
  const [runs, setRuns] = useState([]);

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_BACKEND_URL}/api/workflows/runs/${repoName}`, {
        headers: { Authorization: token },
      })
      .then(response => {
        setRuns(response.data.workflow_runs);
      })
      .catch(error => {
        console.error('Error fetching all repository runs:', error);
      });
  }, [repoName, token]);

  return (
    <div>
      <h4>All Runs for Repository {repoName}</h4>
      <ListGroup>
        {runs.map(run => (
          <ListGroup.Item key={run.id}>
            {run.display_title} - {run.status} - {run.conclusion}
            <a href={run.html_url} target="_blank" rel="noopener noreferrer"> Details </a>
          </ListGroup.Item>
        ))}
      </ListGroup>
      {runs.length === 0 && <div>No workflow runs found.</div>}
    </div>
  );
};

export default AllRepositoryRuns;
