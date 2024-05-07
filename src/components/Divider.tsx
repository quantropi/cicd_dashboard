import React from 'react';

interface DividerProps {
  isOpen: boolean;
  toggle: () => void;
}

const Divider: React.FC<DividerProps> = ({ isOpen, toggle }) => {
  return (
    <div
      className={`divider ${isOpen ? 'open' : 'closed'}`}
      onClick={toggle}
    >
      {isOpen ? 
        <i className="bi bi-caret-left"></i>
      : <i className="bi bi-caret-right"></i>}
    </div>
  );
};

export default Divider;
