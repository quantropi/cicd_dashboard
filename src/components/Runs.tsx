import React, { useState, useEffect } from 'react';
import { Tab, RunDetails } from '../types/models';
import Run from './Run';
import Table from 'react-bootstrap/Table';
import { Pagination } from 'react-bootstrap';

interface RunsProps {
  selectedTab: string;
  selectedRepo: string;
  selectedWorkflow: number;
  tabsData: Tab[];
  release: boolean | undefined;
  releaseVersion: string;
  qaTest: string;
  startTime: string;
  endTime: string;
  startTestTime: string;
  endTestTime: string;
}

const Runs: React.FC<RunsProps> = ({
  selectedTab,
  selectedRepo,
  selectedWorkflow,
  tabsData,
  release,
  releaseVersion,
  qaTest,
  startTime,
  endTime,
  startTestTime,
  endTestTime,
}) => {
  const [runs, setRuns] = useState<RunDetails[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  useEffect(() => {
    const fetchRuns = async () => {
      try {
        const response = await fetch(`${process.env.PUBLIC_URL}/data/runs.json`);
        const allRuns: RunDetails[] = await response.json();

        const filteredRuns = allRuns.filter(run => {
          const byTab = selectedTab === 'all' || tabsData.some(tab =>
            tab.name === selectedTab && tab.repos?.some(repo => repo.name === run.repo));
          const byRepo = !selectedRepo || run.repo === selectedRepo;
          const byWorkflow = !selectedWorkflow || run.workflow_id === selectedWorkflow;

          // Fetch the workflow category from the components data
          const workflowCategory = tabsData
            .flatMap(tab => tab.repos || [])
            .flatMap(repo => repo.workflows || [])
            .find(workflow => workflow.id === run.workflow_id)?.category;

          // Check that the workflow category is "build" or "tool"
          const byCategory = workflowCategory === 'build' || workflowCategory === 'tool';

          const byRelease = !release || run.isRelease === release;
          const byReleaseVersion = !releaseVersion || run.release_version === releaseVersion;
          const byQaTest = qaTest === 'All' || run.test_result === qaTest;

          const byTime =
            (!startTime || new Date(run.time) >= new Date(startTime)) &&
            (!endTime || new Date(run.time) <= new Date(endTime));

          const byTestTime =
            (!startTestTime || new Date(run.test_time) >= new Date(startTestTime)) &&
            (!endTestTime || new Date(run.test_time) <= new Date(endTestTime));

          return byTab && byRepo && byWorkflow && byCategory && byRelease && byReleaseVersion && byQaTest && byTime && byTestTime;
        });

        // Sort by time, most recent first
        filteredRuns.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

        setRuns(filteredRuns);
      } catch (error) {
        console.error('Failed to fetch runs', error);
      }
    };

    fetchRuns();
  }, [selectedTab, selectedRepo, selectedWorkflow, tabsData, release, releaseVersion, qaTest, startTime, endTime, startTestTime, endTestTime]);

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
    <div className="d-flex flex-column" style={{ minHeight: '88vh' }}>
      <h4 className="mt-3 mb-3">Build on Master</h4>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Workflow</th>
            <th>Repo</th>
            <th>QA Test</th>
            <th>Build Time</th>
            <th>QA Time</th>
            { selectedTab !== 'SDK' &&
              <th>Deploy Target</th>
            }
            <th>S3 URL</th>
          </tr>
        </thead>
        <tbody>
          {currentRuns.map(run => <Run key={run.id} run={run} selectedTab={selectedTab} />)}
        </tbody>
      </Table>

      <div className="mt-auto d-flex justify-content-between align-items-center p-3">
        <div>Showing {Math.min(runs.length, (currentPage - 1) * itemsPerPage + 1)} to {Math.min(currentPage * itemsPerPage, runs.length)} of {runs.length} entries</div>
        <Pagination className="flex-grow-1 justify-content-center">
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
    </div>
  );
};

export default Runs;
