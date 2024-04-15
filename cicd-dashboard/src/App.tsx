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

  useEffect(() => {
    const fetchTabsData = async () => {
      try {
        const response = await fetch(`${process.env.PUBLIC_URL}/data/components.json`);
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
      <Navbar selectedTab={selectedTab} setSelectedTab={setSelectedTab} tabsData={tabsData} />
      <Row>
        <Col xs={12} md={3}><Repos selectedTab={selectedTab} tabsData={tabsData} /></Col>
        {/* <Col xs={12} md={6}><Runs /></Col>
        <Col xs={12} md={3}><Workflows /></Col> */}
      </Row>
    </Container>
  );
};

export default App;
