import React, { useEffect, useState } from 'react';
import Header from './components/Header';
import Navbar from './components/Navbar';
import Repos from './components/Repos';
import Runs from './components/Runs';
import Workflows from './components/Workflows';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import 'bootstrap/dist/css/bootstrap.min.css';
import "bootstrap-icons/font/bootstrap-icons.css";
import { Tab } from './types/models';

const App: React.FC = () => {
  const [tabsData, setTabsData] = useState<Tab[]>([]);
  const [selectedTab, setSelectedTab] = useState<string>('all');
  const [selectedRepo, setSelectedRepo] = useState<string>('');
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>('');

  const clearRepo = async () => {
    setSelectedRepo('');
  }

  const clearWorkflow = async () => {
    setSelectedWorkflow('');
  }

  useEffect(() => {
    const fetchTabsData = async () => {
      try {
        const response = await fetch(`data/components.json`);
        const tabs: Tab[] = await response.json();
        setTabsData(tabs);
      } catch (error) {
        console.error("Failed to fetch tabs", error);
      }
    };

    fetchTabsData();
  }, []);

  return (
    <Container fluid>
      <Header />
      <Navbar selectedTab={selectedTab} setSelectedTab={setSelectedTab} tabsData={tabsData} clearRepo={clearRepo} clearWorkflow={clearWorkflow}/>
      <Row>
        <Col xs={12} md={2}><Repos selectedTab={selectedTab} tabsData={tabsData} setSelectedRepo={setSelectedRepo} clearWorkflow={clearWorkflow} /></Col>
        <Col xs={12} md={8}><Runs selectedTab={selectedTab} selectedRepo={selectedRepo} selectedWorkflow={selectedWorkflow} tabsData={tabsData} /></Col>
        <Col xs={12} md={2}><Workflows selectedTab={selectedTab} selectedRepo={selectedRepo} tabsData={tabsData} setSelectedWorkflow={setSelectedWorkflow} /></Col>
      </Row>
    </Container>
  );
};

export default App;
