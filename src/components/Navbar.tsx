import React from 'react';
import { Tab } from '../types/models';
import Nav from 'react-bootstrap/Nav';
import { NavLink } from 'react-router-dom';

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
        <NavLink
          to="/cicd_dashboard/all"
          className="nav-link"
          onClick={() => {
            setSelectedTab('all');
            clearRepo();
            clearWorkflow();
          }}
        >
          All
        </NavLink>
      </Nav.Item>
      {tabsData.map((tab) => (
        <Nav.Item key={tab.name}>
          <NavLink
            to={`/${tab.name}`}
            className="nav-link"
            onClick={() => {
              setSelectedTab(tab.name);
              clearRepo();
              clearWorkflow();
            }}
          >
            {tab.name}
          </NavLink>
        </Nav.Item>
      ))}
    </Nav>
  );
};

export default Navbar;