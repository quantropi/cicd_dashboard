import React from 'react';
import { Tab, Repo } from '../types/models';
import ListGroup from 'react-bootstrap/ListGroup';

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
        <ListGroup.Item 
          key={repo.name} 
          action 
          href={repo.url} 
          target="_blank" 
          rel="noopener noreferrer"
        >
          {repo.name}
          <a href={repo.url}>
            <i className="bi bi-github"></i>
          </a>
        </ListGroup.Item>
      ))}
    </ListGroup>
  );
};

export default Repos;