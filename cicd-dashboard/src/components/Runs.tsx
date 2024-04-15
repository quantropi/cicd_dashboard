import React, { useState, useEffect } from 'react';
import { Tab, RunDetails } from '../types/models';
import Run from './Run';
import Table from 'react-bootstrap/Table';

interface RunsProps {
  selectedTab: string;
  selectedRepo: string;
  selectedWorkflow: string;
  tabsData: Tab[];
}

const Runs: React.FC<RunsProps> = ({ selectedTab, selectedRepo, selectedWorkflow, tabsData }) => {
  const [runs, setRuns] = useState<RunDetails[]>([]);

  useEffect(() => {
    const fetchRuns = async () => {
      try {
        const response = await fetch(`data/runs.json`);
        const allRuns: RunDetails[] = await response.json();
        
        const filteredRuns = allRuns.filter(run => {
          const byTab = selectedTab === 'all' || tabsData.some(tab => 
            tab.name === selectedTab && tab.repos?.some(repo => repo.name === run.repo));
          const byRepo = !selectedRepo || run.repo === selectedRepo;
          const byWorkflow = !selectedWorkflow || run.workflow === selectedWorkflow;
          return byTab && byRepo && byWorkflow;
        });

        // Sort by time, most recent first
        filteredRuns.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
        
        setRuns(filteredRuns);
      } catch (error) {
        console.error("Failed to fetch runs", error);
      }
    };

    fetchRuns();
  }, [selectedTab, selectedRepo, selectedWorkflow, tabsData]);

  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          <th>Workflow</th>
          <th>Time</th>
          <th>User</th>
          <th>Branch</th>
          <th>Status</th>
          {runs.some(run => run.isqa) && <th>Test Results</th>}
          <th>S3 URLs</th>
        </tr>
      </thead>
      <tbody>
        {runs.map(run => <Run key={run.id} run={run} />)}
      </tbody>
    </Table>
  );
};

export default Runs;