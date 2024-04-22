import React from 'react';
import { Tab, Repo } from '../types/models';
import ListGroup from 'react-bootstrap/ListGroup';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

interface ReposProps {
  selectedTab: string;
  tabsData: Tab[];
  selectedRepo: string;
  setSelectedRepo: (repo: string) => void;
  clearWorkflow: () => void;
}

const Repos: React.FC<ReposProps> = ({ selectedTab, tabsData, selectedRepo, setSelectedRepo, clearWorkflow }) => {
  // Filter repos based on the selected tab
  const repos = selectedTab === 'all' ?
    tabsData.flatMap(tab => tab.repos || []) :
    tabsData.find(tab => tab.name === selectedTab)?.repos || [];

  // Sort workflows alphabetically by name
  repos.sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div>
      <h4 className="mt-3 mb-3">Repositories</h4>
      <ListGroup className="repos-sidebar">
        {repos.map((repo: Repo) => (
          <ListGroup.Item key={repo.name} action onClick={() => {
            setSelectedRepo(repo.name);
            clearWorkflow();
          }}
            active={repo.name === selectedRepo}
            className="d-flex justify-content-between align-items-center"
          >
            <span className="text-truncate" style={{ maxWidth: '85%' }}>
              {repo.name}
            </span>
            <a href={repo.url} target="_blank" rel="noopener noreferrer">
              <i className="bi bi-github"></i>
            </a>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </div>
  );
};

export default Repos;