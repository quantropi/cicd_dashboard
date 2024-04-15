import React from 'react';
import { RunDetails } from '../types/models';

interface RunProps {
  run: RunDetails;
}

const Run: React.FC<RunProps> = ({ run }) => {
  const statusClass = run.status === "success" ? "text-success" : "text-danger"; // This can also be background color based on your CSS
  return (
    <tr className={statusClass}>
      <td>
        <a href={run.url} target="_blank" rel="noopener noreferrer">
          {run.workflow_name} #{run.run_number}
        </a>
      </td>
      <td>{run.time}</td>
      <td>{run.user}</td>
      <td>{run.branch}</td>
      <td>{run.status}</td>
      {run.isqa && <td>{run.test_result}</td>}
      <td>{run.s3_urls}</td>
    </tr>
  );
};

export default Run;