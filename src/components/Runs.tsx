import React, { useState, useEffect } from 'react';
import { Tab, RunDetails } from '../types/models';
import Run from './Run';
import Table from 'react-bootstrap/Table';
import { Pagination } from 'react-bootstrap';

interface RunsProps {
  selectedTab: string;
  selectedRepo: string;
  selectedWorkflow: string;
  tabsData: Tab[];
}

const Runs: React.FC<RunsProps> = ({ selectedTab, selectedRepo, selectedWorkflow, tabsData }) => {
  const [runs, setRuns] = useState<RunDetails[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

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

  // Calculate total pages and setup pagination
  const lastRunIndex = currentPage * itemsPerPage;
  const firstRunIndex = lastRunIndex - itemsPerPage;
  const currentRuns = runs.slice(firstRunIndex, lastRunIndex);

  const totalPages = Math.ceil(runs.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const pageNumbers = [];

  if (currentPage === 1) {
      pageNumbers.push(currentPage);
      if (totalPages >= currentPage + 1) {
          pageNumbers.push(currentPage + 1);
      }
      if (totalPages >= currentPage + 2) {
          pageNumbers.push(currentPage + 2);
      }
  } else if (currentPage > 1) {
      if (currentPage >= 3) {
          pageNumbers.push(currentPage - 2);
          pageNumbers.push(currentPage - 1);
      } else {
          pageNumbers.push(currentPage - 1);
      }

      pageNumbers.push(currentPage);

      if (totalPages >= currentPage + 1) {
          pageNumbers.push(currentPage + 1);
      }
      if (totalPages >= currentPage + 2) {
          pageNumbers.push(currentPage + 2);
      }
  }

  return (
    <div>
      <h4 className="mt-3 mb-3">Workflow Runs</h4>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Workflow</th>
            <th>Time</th>
            <th>User</th>
            <th>Branch</th>
            <th>Test Results</th>
            <th>S3 URLs</th>
          </tr>
        </thead>
        <tbody>
          {currentRuns.map(run => <Run key={run.id} run={run} />)}
        </tbody>
      </Table>
      
      <Pagination>
          <Pagination.Item onClick={() => paginate(1)}>
            First
          </Pagination.Item>
          {pageNumbers.map(number => (
            <Pagination.Item key={number} active={currentPage === number} onClick={() => paginate(number)}>
              {number}
            </Pagination.Item>
          ))}
          <Pagination.Item onClick={() => paginate(totalPages)}>
            Last
          </Pagination.Item>
      </Pagination>
      
    </div>
  );
};

export default Runs;