import React from 'react';
import { Tab, Repo } from '../types/models';
import ListGroup from 'react-bootstrap/ListGroup';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

interface ReposProps {
  selectedTab: string;
  tabsData: Tab[];
}

const Repos: React.FC<ReposProps> = ({ selectedTab, tabsData }) => {
  // Filter repos based on the selected tab
  const repos = selectedTab === 'all' ?
    tabsData.flatMap(tab => tab.repos || []) :
    tabsData.find(tab => tab.name === selectedTab)?.repos || [];

  return (
    <ListGroup className="repos-sidebar">
      {repos.map((repo: Repo) => (
        <ListGroup.Item key={repo.name} action>
        <Row>
          <Col className="text-left" xs={10}>
            {repo.name}
          </Col>
          <Col className="text-right" xs={2}>
            <a href={repo.url} target="_blank" rel="noopener noreferrer">
              <i className="bi bi-github"></i>
            </a>
          </Col>
        </Row>
      </ListGroup.Item>
    ))}
  </ListGroup>
  );
};

export default Repos;