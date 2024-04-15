import React from 'react';
import { Workflow } from '../types/models';

interface WorkflowsProps {
  workflows: Workflow[];
}

const Workflows: React.FC<WorkflowsProps> = ({ workflows }) => {
  return (
    <aside className="workflows-sidebar">
      <ul>
        {workflows.map((workflow) => (
          <li key={workflow.name}>
            <a href={workflow.url} target="_blank" rel="noopener noreferrer">
              {workflow.name} <i className="github-icon"></i>
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Workflows;
