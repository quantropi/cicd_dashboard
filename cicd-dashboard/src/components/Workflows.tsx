import React from 'react';
import { Tab, Workflow } from '../types/models';
import ListGroup from 'react-bootstrap/ListGroup';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

interface WorkflowsProps {
  selectedTab: string;
  selectedRepo: string;
  tabsData: Tab[];
  setSelectedWorkflow: (workflow: string) => void;
}

const Workflows: React.FC<WorkflowsProps> = ({ selectedTab, selectedRepo, tabsData, setSelectedWorkflow }) => {
  let workflows: Workflow[] = [];

  if (selectedTab === 'all') {
    // Get all workflows from all tabs
    workflows = tabsData.flatMap(tab => tab.repos?.flatMap(repo => repo.workflows || []) || []);
  } else {
    // Get workflows from the selected tab
    const tab = tabsData.find(tab => tab.name === selectedTab);
    if (selectedRepo) {
      // Get workflows from the selected repo within the selected tab
      const repo = tab?.repos?.find(repo => repo.name === selectedRepo);
      workflows = repo?.workflows || [];
    } else {
      // Get all workflows within the selected tab
      workflows = tab?.repos?.flatMap(repo => repo.workflows || []) || [];
    }
  }

  // Sort workflows alphabetically by name
  workflows.sort((a, b) => a.name.localeCompare(b.name));

  return (
    <ListGroup className="workflows-sidebar">
      {workflows.map(workflow => (
        <ListGroup.Item key={workflow.name} action onClick={() => setSelectedWorkflow(workflow.file)}>
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
  );
};

export default Workflows;