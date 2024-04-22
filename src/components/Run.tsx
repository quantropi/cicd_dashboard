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
      <td className='col-2'>
        <OverlayTrigger
          placement="right"
          delay={{ show: 250, hide: 400 }}
          overlay={renderTooltip}
        >
          <a href={run.url} target="_blank" rel="noopener noreferrer">
            {run.workflow_name} #{run.run_number} 
          </a>
        </OverlayTrigger>
        <Badge bg={run.status === "success" ? "success" : "danger"}>
          {run.status}
        </Badge>
      </td>
      <td className='col-2'>{run.time}</td>
      <td className='col-1'>{run.user}</td>
      <td className='col-2'>{run.branch}</td>
      <td className='col-1'>{run.isqa ? run.test_result : 'N/A'}</td>
      <td className='col-4'>{run.s3_urls !== "" ? run.s3_urls : 'N/A'}</td>
    </tr>
  );
};

export default Run;