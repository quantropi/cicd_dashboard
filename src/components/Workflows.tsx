import React from 'react';
import { Tab, Workflow } from '../types/models';
import ListGroup from 'react-bootstrap/ListGroup';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

interface WorkflowsProps {
  selectedTab: string;
  selectedRepo: string;
  tabsData: Tab[];
  selectedWorkflow: string;
  setSelectedWorkflow: (workflow: string) => void;
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
          <ListGroup.Item key={workflow.name} action 
            onClick={() => setSelectedWorkflow(workflow.file)}
            active={workflow.file === selectedWorkflow}
          >
            <Row>
            <Col className="text-left" xs={10}>
              {workflow.name}
            </Col>
            <Col className="text-right" xs={2}>
              <a href={workflow.url} target="_blank" rel="noopener noreferrer">
                <i className="bi bi-github"></i>
              </a>
            </Col>
          </Row>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </div>
  );
};

export default Workflows;