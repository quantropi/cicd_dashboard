import React, { useState, useEffect } from 'react';
import { Tab, Repo, RunDetails } from '../types/models';
import { Form, Button } from 'react-bootstrap';

interface FilterProps {
  selectedTab: string;
  selectedRepo: string;
  tabsData: Tab[];
  selectedWorkflow: number;
  setSelectedWorkflow: (workflow_id: number) => void;
  release: boolean | undefined;
  setRelease: (release: boolean | undefined) => void;
  releaseVersion: string;
  setReleaseVersion: (version: string) => void;
  qaTest: string;
  setQaTest: (test: string) => void;
  startTime: string;
  setStartTime: (time: string) => void;
  endTime: string;
  setEndTime: (time: string) => void;
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
  setSelectedRepo,
}) => {
  const [releaseVersions, setReleaseVersions] = useState<string[]>([]);

  useEffect(() => {
    const fetchRunsData = async () => {
      try {
        const response = await fetch('/cicd_dashboard/data/runs.json');
        const allRuns: RunDetails[] = await response.json();

        const versions = [...new Set(allRuns.map((run: RunDetails) => run.release_version).filter((version: string | null) => version !== null))] as string[];
        setReleaseVersions(versions);
      } catch (error) {
        console.error("Failed to fetch runs data", error);
      }
    };

    fetchRunsData();
  }, []);

  const repos: Repo[] = selectedTab === 'all'
    ? tabsData.flatMap(tab => tab.repos || [])
    : tabsData.find(tab => tab.name === selectedTab)?.repos || [];

  const workflows = repos
    .filter(repo => repo.name === selectedRepo || selectedRepo === '')
    .flatMap(repo => repo.workflows || []);

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
            {releaseVersions.map(version => (
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
            <option value="N/A">All</option>
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
          <Form.Label>Start Time</Form.Label>
          <Form.Control
            type="datetime-local"
            value={startTime}
            onChange={e => setStartTime(e.target.value)}
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>End Time</Form.Label>
          <Form.Control
            type="datetime-local"
            value={endTime}
            onChange={e => setEndTime(e.target.value)}
          />
        </Form.Group>
        <br />
        <Button variant="primary" type="button" onClick={() => 
          setSelectedWorkflow(0)
        }>
          Clear
        </Button>
      </Form>
    </div>
  );
};

export default Filter;
