import React from 'react';
import { Tab } from '../types/models';
import Nav from 'react-bootstrap/Nav';

interface NavbarProps {
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
  tabsData: Tab[];
  clearRepo: () => void;
  clearWorkflow: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ selectedTab, setSelectedTab, tabsData, clearRepo, clearWorkflow }) => {

  return (
    <Nav variant="tabs" activeKey={selectedTab}>
      <Nav.Item>
        <Nav.Link eventKey="all" onClick={() => {
          setSelectedTab('all');
          clearRepo();
          clearWorkflow();
        }}>All</Nav.Link>
      </Nav.Item>
      {tabsData.map((tab) => (
        <Nav.Item key={tab.name}>
          <Nav.Link eventKey={tab.name} onClick={() => {
          setSelectedTab(tab.name);
          clearRepo();
          clearWorkflow();
        }}>
            {tab.name}
          </Nav.Link>
        </Nav.Item>
      ))}
    </Nav>
  );
};

export default Navbar;