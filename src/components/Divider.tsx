import React from 'react';

interface DividerProps {
  isOpen: boolean;
  toggle: () => void;
}

const Divider: React.FC<DividerProps> = ({ isOpen, toggle }) => {
  return (
    <button
      className={`divider ${isOpen ? 'open' : 'closed'}`}
      onClick={toggle}
      title={isOpen ? 'Close the filter bar' : 'Open the filter bar'}
      aria-expanded={isOpen}
      style={{ all: 'unset', cursor: 'pointer' }}
    >
      <span aria-hidden="true">
        {isOpen ? 
          <i className="bi bi-caret-right"></i> :
          <i className="bi bi-caret-left"></i>
        }
      </span>
      <span className="visually-hidden">
        {isOpen ? 'Close sidebar' : 'Open sidebar'}
      </span>
    </button>
  );
};


export default Divider;
