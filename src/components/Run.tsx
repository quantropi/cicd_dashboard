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
        <Badge bg={run.status === "success" ? "success" : "danger"}>
          {run.status}
        </Badge>
      </td>
      <td>
        <div className="text-truncate" style={{ maxWidth: '150px' }}>
          {run.repo}
        </div>
      </td>
      <td>
        <div className="text-truncate" style={{ maxWidth: '200px' }}>
          {run.time}
        </div>
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
        {run.isqa ? (
          <div className="text-truncate" style={{ maxWidth: '150px' }}>
            {run.test_result}
          </div>
        ) : 'N/A'}
      </td>
      <td>{run.s3_urls !== "" ? run.s3_urls : 'N/A'}</td>
    </tr>
  );
};

export default Run;