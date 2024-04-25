import React from 'react';
import { RunDetails } from '../types/models';
import { Badge, Tooltip, OverlayTrigger } from 'react-bootstrap';

interface RunProps {
  run: RunDetails;
}

const Run: React.FC<RunProps> = ({ run }) => {
  const renderTooltip = (props: React.ComponentProps<typeof Tooltip>) => (
    <Tooltip id={`tooltip-${run.id}`} {...props}>
      Click to view details
    </Tooltip>
  );

  // Function to format UTC date string to local Ottawa time
  const formatLocalTime = (utcTime: string) => {
    const date = new Date(utcTime);
    return date.toLocaleString('en-CA', { timeZone: 'America/Toronto' });
  };

  return (
    <tr>
      <td>
        <OverlayTrigger
          placement="right"
          delay={{ show: 250, hide: 400 }}
          overlay={renderTooltip}
        >
          <a href={run.url} target="_blank" rel="noopener noreferrer" className="text-truncate" style={{ maxWidth: '200px' }}>
            {run.workflow_name} #{run.run_number}
          </a>
        </OverlayTrigger>
        <br/>
        <Badge bg={run.status === "success" ? "success" : run.status === "cancelled" ? "secondary" : "danger"}>
          {run.status}
        </Badge>
      </td>
      <td>
        <div className="text-truncate" style={{ maxWidth: '150px' }}>
          {run.repo}
        </div>
      </td>
      <td>
        {run.test_result !== "" ? (
          <div 
            className="text-truncate" 
            style={{ 
              maxWidth: '150px',
              color: run.test_result === 'FAILED' ? 'red' : 'inherit',
            }}>
            {run.test_result}
          </div>
        ) : 'N/A'}
      </td>
      <td>
        <div className="text-truncate" style={{ maxWidth: '150px' }}>
          {run.user}
        </div>
      </td>
      <td>
        <div className="text-truncate" style={{ maxWidth: '150px' }}>
          {run.branch}
        </div>
      </td>
      <td>
        <div className="time-display" style={{ maxWidth: '200px' }}>
          {formatLocalTime(run.time)}
        </div>
      </td>
      <td>{run.s3_urls !== "" ? run.s3_urls : 'N/A'}</td>
    </tr>
  );
};

export default Run;