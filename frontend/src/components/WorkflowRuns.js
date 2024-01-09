import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ListGroup from 'react-bootstrap/ListGroup';

const WorkflowRuns = ({ repoName, workflowId, token }) => {
  const [runs, setRuns] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const url = `${process.env.REACT_APP_BACKEND_URL}/api/workflows/${repoName}/runs/${workflowId}`;

    axios
      .get(url, { headers: { Authorization: token } })
      .then(response => {
        setRuns(response.data.workflow_runs);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching workflow runs:', error);
        setIsLoading(false);
      });
  }, [repoName, workflowId, token]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h4>Runs for {workflowId ? `Workflow ${workflowId}` : `Repo ${repoName}`}</h4>
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

export default WorkflowRuns;
