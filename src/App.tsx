import React, { useEffect, useState } from 'react';
import Header from './components/Header';
import Navbar from './components/Navbar';
import Runs from './components/Runs';
import Filter from './components/Filter';
import Divider from './components/Divider';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import 'bootstrap/dist/css/bootstrap.min.css';
import "bootstrap-icons/font/bootstrap-icons.css";
import { Tab } from './types/models';
import './App.css';

const App: React.FC = () => {
  const [tabsData, setTabsData] = useState<Tab[]>([]);
  const [selectedTab, setSelectedTab] = useState<string>('all');
  const [selectedRepo, setSelectedRepo] = useState<string>('');
  const [selectedWorkflow, setSelectedWorkflow] = useState<number>(0);
  const [release, setRelease] = useState<boolean>(false);
  const [releaseVersion, setReleaseVersion] = useState<string>('');
  const [qaTest, setQaTest] = useState<string>('All');
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [filterVisible, setFilterVisible] = useState<boolean>(true);

  const toggleFilter = () => setFilterVisible(!filterVisible);

  const clearRepo = async () => {
    setSelectedRepo('');
  }

  const clearWorkflow = async () => {
    setSelectedWorkflow(0);
  }

  useEffect(() => {
    const fetchTabsData = async () => {
      try {
        const response = await fetch('/cicd_dashboard/data/components.json');
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
      <Navbar 
        selectedTab={selectedTab} 
        setSelectedTab={setSelectedTab} 
        tabsData={tabsData} 
        clearRepo={clearRepo} 
        clearWorkflow={clearWorkflow}
      />
      <Row>
        <Col xs={12} md={filterVisible ? 9 : 11}>
          <Runs 
            selectedTab={selectedTab}
            selectedRepo={selectedRepo}
            selectedWorkflow={selectedWorkflow}
            tabsData={tabsData}
            release={release}
            releaseVersion={releaseVersion}
            qaTest={qaTest}
            startTime={startTime}
            endTime={endTime}
          />
        </Col>
        <Divider isOpen={filterVisible} toggle={toggleFilter} /> {/* Divider */}
        {filterVisible && (
          <Col xs={12} md={2}>
            <Filter 
              selectedTab={selectedTab}
              selectedRepo={selectedRepo}
              tabsData={tabsData}
              selectedWorkflow={selectedWorkflow}
              setSelectedWorkflow={setSelectedWorkflow}
              release={release}
              setRelease={setRelease}
              releaseVersion={releaseVersion}
              setReleaseVersion={setReleaseVersion}
              qaTest={qaTest}
              setQaTest={setQaTest}
              startTime={startTime}
              setStartTime={setStartTime}
              endTime={endTime}
              setEndTime={setEndTime}
              setSelectedRepo={setSelectedRepo}
            />
          </Col>
        )}
      </Row>
    </Container>
  );
};

export default App;
