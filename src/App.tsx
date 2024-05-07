import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
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
  return (
    <Router>
      <Routes>
        <Route path="/:tab" element={<AppContent />} />
        <Route path="*" element={<Navigate to="/all" />} />
      </Routes>
    </Router>
  );
};

const AppContent: React.FC = () => {
  const { tab } = useParams();
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
  const clearRepo = () => setSelectedRepo('');
  const clearWorkflow = () => setSelectedWorkflow(0);

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

  useEffect(() => {
    // Reactively set selectedTab when tab changes and is valid
    if (tab && tabsData.some(t => t.name.toLowerCase() === tab.toLowerCase())) {
      setSelectedTab(tab);
    }
  }, [tab, tabsData]);

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
        <Divider isOpen={filterVisible} toggle={toggleFilter} />
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
