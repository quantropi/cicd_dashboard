import React from 'react';
import { RunDetails } from '../types/models';
import { Badge, Tooltip, OverlayTrigger } from 'react-bootstrap';

interface RunProps {
  run: RunDetails;
  selectedTab: string;
}

const Run: React.FC<RunProps> = ({ run, selectedTab }) => {
  const renderTooltip = (props: React.ComponentProps<typeof Tooltip>) => (
    <Tooltip id={`tooltip-${run.id}`} {...props}>
      Click to view details
    </Tooltip>
  );

  // Function to format UTC date string to local Ottawa time
  const formatLocalTime = (utcTime: string) => {
    const date = new Date(utcTime);
    return date.toLocaleString('en-US', { timeZone: 'America/Toronto' });
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
        <br />
        <Badge bg={run.status === "success" ? "success" : run.status === "cancelled" ? "secondary" : "danger"}>
          {run.status}
        </Badge>
        {run.isRelease ? (
          <Badge bg="primary">
            {run.release_version}
          </Badge>
        ) : ''}
      </td>
      <td>
        <div className="text-truncate" style={{ maxWidth: '150px' }}>
          <a href={run.repo_url} target="_blank" rel="noopener noreferrer">
            {run.repo}
          </a>
        </div>
      </td>
      <td>
        {run.test_result !== "" ? (
          <div
            className="text-truncate"
            style={{
              maxWidth: '150px',
            }}>
            <a href={run.test_run_url || '#'} target="_blank" rel="noopener noreferrer" 
              className={run.test_result === 'FAILED' ? 'link-failed' : 'link-default'}
            >
              {run.test_result}
            </a>
          </div>
        ) : 'N/A'}
      </td>
      <td>
        <div className="time-display" style={{ maxWidth: '200px' }}>
          {formatLocalTime(run.time)}
        </div>
      </td>
      <td>
        <div className="time-display" style={{ maxWidth: '200px' }}>
          {run.test_time ? formatLocalTime(run.test_time) : 'N/A'}
        </div>
      </td>
      {
        selectedTab !== 'SDK' &&
        <td>
          {run.deploy_target ? run.deploy_target.split(',').map(target => (
            <Badge key={target.trim()} bg="info" className="me-1">
              {target.trim()}
            </Badge>
          )) : 'N/A'}
        </td>
      }
      <td>{run.s3_urls !== "" ? run.s3_urls : ''}</td>
    </tr>
  );
};

export default Run;