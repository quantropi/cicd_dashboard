import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ListGroup from 'react-bootstrap/ListGroup';
import WorkflowRuns from './WorkflowRuns';
import AllRepositoryRuns from './AllRepositoryRuns';

const RepositoryWorkflows = ({ repoName, token }) => {
  const [workflows, setWorkflows] = useState([]);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState(null);

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
    <div className="d-flex">
      <div className="flex-grow-1">
        <h3>Workflows for {repoName}</h3>
        <ListGroup>
          {workflows.map(workflow => (
            <ListGroup.Item
              key={workflow.id}
              action
              onClick={() => setSelectedWorkflowId(workflow.id)}
            >
              {workflow.name}
            </ListGroup.Item>
          ))}
        </ListGroup>
      </div>
      <div className="flex-grow-1">
        {selectedWorkflowId ? (
          <WorkflowRuns
            repoName={repoName}
            workflowId={selectedWorkflowId}
            token={token}
          />
        ) : (
          <AllRepositoryRuns
            repoName={repoName}
            token={token}
          />
        )}
      </div>
    </div>
  );
};

export default RepositoryWorkflows;
