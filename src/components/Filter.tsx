import React, { useState, useEffect } from 'react';
import { Tab, Repo, RunDetails } from '../types/models';
import { Form, Button } from 'react-bootstrap';

interface FilterProps {
  selectedTab: string;
  selectedRepo: string;
  tabsData: Tab[];
  selectedWorkflow: number;
  setSelectedWorkflow: (workflow_id: number) => void;
  release: boolean;
  setRelease: (release: boolean) => void;
  releaseVersion: string;
  setReleaseVersion: (version: string) => void;
  qaTest: string;
  setQaTest: (test: string) => void;
  startTime: string;
  setStartTime: (time: string) => void;
  endTime: string;
  setEndTime: (time: string) => void;
  startTestTime: string;
  setStartTestTime: (time: string) => void;
  endTestTime: string;
  setEndTestTime: (time: string) => void;
  setSelectedRepo: (repo: string) => void;
}

const Filter: React.FC<FilterProps> = ({
  selectedTab,
  selectedRepo,
  tabsData,
  selectedWorkflow,
  setSelectedWorkflow,
  release,
  setRelease,
  releaseVersion,
  setReleaseVersion,
  qaTest,
  setQaTest,
  startTime,
  setStartTime,
  endTime,
  setEndTime,
  startTestTime,
  setStartTestTime,
  endTestTime,
  setEndTestTime,
  setSelectedRepo,
}) => {
  const [allRuns, setAllRuns] = useState<RunDetails[]>([]);
  const [filteredReleaseVersions, setFilteredReleaseVersions] = useState<string[]>([]);

  useEffect(() => {
    const fetchRunsData = async () => {
      try {
        const response = await fetch(`${process.env.PUBLIC_URL}/data/runs.json`);
        const allRunsData: RunDetails[] = await response.json();
        setAllRuns(allRunsData);
      } catch (error) {
        console.error("Failed to fetch runs data", error);
      }
    };

    fetchRunsData();
  }, []);

  useEffect(() => {
    let versions: string[];
    if (selectedTab === 'all') {
      versions = [...new Set(allRuns.map(run => run.release_version).filter(version => version !== null && version !== undefined))] as string[];
    } else {
      const tabRepos = tabsData.find(tab => tab.name === selectedTab)?.repos?.map(repo => repo.name) || [];
      versions = [...new Set(allRuns.filter(run => tabRepos.includes(run.repo)).map(run => run.release_version).filter(version => version !== null && version !== undefined))] as string[];
    }
    setFilteredReleaseVersions(versions);
  }, [selectedTab, allRuns, tabsData]);

  const resetFilters = () => {
    setSelectedRepo('');
    setSelectedWorkflow(0);
    setRelease(false);
    setReleaseVersion('');
    setQaTest('All');
    setStartTime('');
    setEndTime('');
    setStartTestTime('');
    setEndTestTime('');
  };

  const repos: Repo[] = selectedTab === 'all'
    ? tabsData.flatMap(tab => tab.repos || []).filter(repo => repo.category === 'product')
    : (tabsData.find(tab => tab.name === selectedTab)?.repos || []).filter(repo => repo.category === 'product');

  const workflows = repos
    .filter(repo => repo.name === selectedRepo || selectedRepo === '')
    .flatMap(repo => repo.workflows || [])
    .filter(workflow => workflow.category === 'build');

  return (
    <div>
      <h4 className="mt-3 mb-3">Filter</h4>
      <Form>
        <Form.Group>
          <Form.Check
            type="checkbox"
            label="Release"
            checked={release}
            onChange={() => setRelease(!release)}
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>Release Version</Form.Label>
          <Form.Control
            as="select"
            value={releaseVersion}
            onChange={e => setReleaseVersion(e.target.value)}
          >
            <option value="">All Versions</option>
            {filteredReleaseVersions.map(version => (
              <option key={version} value={version}>
                {version}
              </option>
            ))}
          </Form.Control>
        </Form.Group>
        <Form.Group>
          <Form.Label>QA Test</Form.Label>
          <Form.Control
            as="select"
            value={qaTest}
            onChange={e => setQaTest(e.target.value)}
          >
            <option value="All">All</option>
            <option value="PASSED">PASSED</option>
            <option value="FAILED">FAILED</option>
            <option value="ABORTED">ABORTED</option>
          </Form.Control>
        </Form.Group>
        <Form.Group>
          <Form.Label>Repository</Form.Label>
          <Form.Control
            as="select"
            value={selectedRepo}
            onChange={e => setSelectedRepo(e.target.value)}
          >
            <option value="">All Repositories</option>
            {repos.map(repo => (
              <option key={repo.name} value={repo.name}>
                {repo.name}
              </option>
            ))}
          </Form.Control>
        </Form.Group>
        <Form.Group>
          <Form.Label>Workflow</Form.Label>
          <Form.Control
            as="select"
            value={selectedWorkflow}
            onChange={e => setSelectedWorkflow(parseInt(e.target.value))}
          >
            <option value="0">All Workflows</option>
            {workflows.map(workflow => (
              <option key={workflow.id} value={workflow.id}>
                {workflow.name}
              </option>
            ))}
          </Form.Control>
        </Form.Group>
        <Form.Group>
          <Form.Label>Start Build Time</Form.Label>
          <Form.Control
            type="datetime-local"
            value={startTime}
            onChange={e => setStartTime(e.target.value)}
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>End Build Time</Form.Label>
          <Form.Control
            type="datetime-local"
            value={endTime}
            onChange={e => setEndTime(e.target.value)}
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>Start QA Time</Form.Label>
          <Form.Control
            type="datetime-local"
            value={startTestTime}
            onChange={e => setStartTestTime(e.target.value)}
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>End QA Time</Form.Label>
          <Form.Control
            type="datetime-local"
            value={endTestTime}
            onChange={e => setEndTestTime(e.target.value)}
          />
        </Form.Group>
        <br />
        <Button variant="secondary" type="button" onClick={resetFilters}>
          Clear Filters
        </Button>
      </Form>
    </div>
  );
};

export default Filter;
