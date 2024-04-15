import React, { useState } from 'react';
import Run from './Run';
import { RunDetails } from '../types/models';

interface RunsProps {
  runs: RunDetails[];
}

const Runs: React.FC<RunsProps> = ({ runs }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const runsPerPage = 20;

  const indexOfLastRun = (currentPage + 1) * runsPerPage;
  const indexOfFirstRun = indexOfLastRun - runsPerPage;
  const currentRuns = runs.slice(indexOfFirstRun, indexOfLastRun);

  // Add Pagination logic here (set `setCurrentPage` based on user interaction)

  return (
    <div className="runs-container">
      {currentRuns.map((run) => (
        <Run key={run.id} run={run} />
      ))}
      {/* Pagination component here */}
    </div>
  );
};

export default Runs;
