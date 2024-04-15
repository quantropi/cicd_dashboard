import React from 'react';
import { RunDetails } from '../types/models';

interface RunProps {
  run: RunDetails;
}

const Run: React.FC<RunProps> = ({ run }) => {
  return (
    <div className="run">
      <div>{run.run_name}</div>
      <div>{run.time}</div>
      <div>{run.user}</div>
      {/* Rest of the run details */}
    </div>
  );
};

export default Run;
