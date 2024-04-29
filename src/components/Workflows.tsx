import React from 'react';
import { Tab, Workflow } from '../types/models';
import ListGroup from 'react-bootstrap/ListGroup';

interface WorkflowsProps {
  selectedTab: string;
  selectedRepo: string;
  tabsData: Tab[];
  selectedWorkflow: number;
  setSelectedWorkflow: (workflow_id: number) => void;
}

const Workflows: React.FC<WorkflowsProps> = ({ selectedTab, selectedRepo, tabsData, selectedWorkflow, setSelectedWorkflow }) => {
  let workflows: Workflow[] = [];

  // Handling the workflows display logic
  if (selectedTab === 'all') {
    if (!selectedRepo) {
      // Get all workflows from all tabs if no specific repo is selected
      workflows = tabsData.flatMap(tab =>
        tab.repos?.flatMap(repo =>
          repo.workflows?.filter(workflow => workflow.default_display) || []
        ) || []
      );
    } else {
      // Get workflows from all tabs but only for the specified repo
      workflows = tabsData.flatMap(tab =>
        tab.repos?.filter(repo => repo.name === selectedRepo).flatMap(repo =>
          repo.workflows || []
        ) || []
      );
    }
  } else {
    const tab = tabsData.find(tab => tab.name === selectedTab);
    if (selectedRepo) {
      // Get workflows from the selected repo within the selected tab
      const repo = tab?.repos?.find(repo => repo.name === selectedRepo);
      workflows = repo?.workflows || [];
    } else {
      // Get all workflows within the selected tab
      workflows = tab?.repos?.flatMap(repo =>
        repo.workflows || []
      ) || [];
    }
  }

  // Sort workflows alphabetically by name
  workflows.sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div>
      <h4 className="mt-3 mb-3">Workflows</h4>
      <ListGroup className="workflows-sidebar">
        {workflows.map(workflow => (
          <ListGroup.Item key={workflow.id} action
            onClick={() => setSelectedWorkflow(workflow.id)}
            active={workflow.id === selectedWorkflow}
            className="d-flex justify-content-between align-items-center"
          >
            <span className="text-truncate" style={{ maxWidth: '85%' }}>
              {workflow.name}
            </span>
            <a href={workflow.url} target="_blank" rel="noopener noreferrer">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="icon" viewBox="0 0 1024 1024">
                <path d="M661.333333 170.666667l253.866667 34.133333-209.066667 209.066667zM362.666667 853.333333L108.8 819.2l209.066667-209.066667zM170.666667 362.666667L204.8 108.8l209.066667 209.066667z" fill="currentColor" />
                <path d="M198.4 452.266667l-89.6 17.066666c-2.133333 14.933333-2.133333 27.733333-2.133333 42.666667 0 98.133333 34.133333 192 98.133333 264.533333l64-55.466666C219.733333 663.466667 192 588.8 192 512c0-19.2 2.133333-40.533333 6.4-59.733333zM512 106.666667c-115.2 0-217.6 49.066667-292.266667 125.866666l59.733334 59.733334C339.2 230.4 420.266667 192 512 192c19.2 0 40.533333 2.133333 59.733333 6.4l14.933334-83.2C563.2 108.8 537.6 106.666667 512 106.666667zM825.6 571.733333l89.6-17.066666c2.133333-14.933333 2.133333-27.733333 2.133333-42.666667 0-93.866667-32-185.6-91.733333-258.133333l-66.133333 53.333333c46.933333 57.6 72.533333 130.133333 72.533333 202.666667 0 21.333333-2.133333 42.666667-6.4 61.866666zM744.533333 731.733333C684.8 793.6 603.733333 832 512 832c-19.2 0-40.533333-2.133333-59.733333-6.4l-14.933334 83.2c25.6 4.266667 51.2 6.4 74.666667 6.4 115.2 0 217.6-49.066667 292.266667-125.866667l-59.733334-57.6z" fill="currentColor" />
                <path d="M853.333333 661.333333l-34.133333 253.866667-209.066667-209.066667z" fill="currentColor" />
              </svg>
            </a>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </div>
  );
};

export default Workflows;